<?php

namespace App\Http\Controllers;

use App\Models\Vehicule;
use App\Models\VehiclePosition;
use App\Models\FuelAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class GPSController extends Controller
{
    /**
     * PAGE 1 : Le Tableau de Bord Global (La carte avec tous les camions)
     */
    public function index()
    {
        // On charge les véhicules avec leur DERNIÈRE position connue et les alertes non résolues
        $vehicules = Vehicule::with(['latestPosition', 'gpsDevice'])
            ->withCount(['fuelAlerts' => function ($query) {
                $query->where('is_resolved', false); // Compteur d'alertes actives
            }])
            ->get()
            ->map(function ($vehicule) {
                return [
                    'id' => $vehicule->id,
                    'name' => $vehicule->brand . ' - ' . $vehicule->licence_plate,
                    'status' => $this->determineStatus($vehicule->latestPosition), // En ligne, Hors ligne, En mouvement
                    'fuel_level' => $vehicule->latestPosition?->fuel_level ?? 0,
                    'tank_capacity' => $vehicule->tank_capacity,
                    'position' => $vehicule->latestPosition ? [
                        'lat' => $vehicule->latestPosition->latitude,
                        'lng' => $vehicule->latestPosition->longitude,
                        'speed' => $vehicule->latestPosition->speed,
                        'heading' => $vehicule->latestPosition->heading,
                        'updated_at' => $vehicule->latestPosition->captured_at->diffForHumans(),
                    ] : null,
                    'alerts_count' => $vehicule->fuel_alerts_count,
                ];
            });

        // On récupère aussi les 5 dernières alertes critiques pour le fil d'actualité
        $recentAlerts = FuelAlert::with('vehicule')
            ->where('is_resolved', false)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Tracking/Dashboard', [
            'fleet' => $vehicules,
            'recentAlerts' => $recentAlerts,
            'mapboxToken' => config('services.mapbox.token'), // Si vous utilisez Mapbox ou Google Maps
        ]);
    }

    /**
     * PAGE 2 : Le Détail d'un Véhicule (Trajet du jour + Graphique Carburant)
     */
    public function show(Vehicule $vehicule)
    {
        // Par défaut, on charge l'historique des 24 dernières heures
        $positions = $vehicule->positions()
            ->where('captured_at', '>=', Carbon::now()->subDay())
            ->orderBy('captured_at', 'asc')
            ->get(['latitude', 'longitude', 'speed', 'fuel_level', 'captured_at']);

        // Préparation des données pour le graphique (Chart.js ou Recharts)
        $chartData = $positions->map(function ($pos) {
            return [
                'time' => Carbon::parse($pos->captured_at)->format('H:i'),
                'fuel' => $pos->fuel_level,
                'speed' => $pos->speed,
            ];
        });

        return Inertia::render('Tracking/VehicleDetail', [
            'vehicule' => $vehicule->load('gpsDevice'),
            'path' => $positions, // Pour tracer la ligne sur la carte
            'chartData' => $chartData, // Pour le graphique de consommation/vol
            'alerts' => $vehicule->fuelAlerts()->latest()->take(10)->get()
        ]);
    }

    /**
     * API : Récupérer l'historique sur une plage de dates (Pour le "Replay")
     * Appelé via axios.get() depuis React quand on change la date
     */
    public function history(Request $request, Vehicule $vehicule)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $positions = $vehicule->positions()
            ->whereBetween('captured_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ])
            ->orderBy('captured_at', 'asc')
            ->get(['latitude', 'longitude', 'speed', 'fuel_level', 'captured_at']);

        return response()->json([
            'path' => $positions,
            'stats' => [
                'max_speed' => $positions->max('speed'),
                'start_fuel' => $positions->first()?->fuel_level,
                'end_fuel' => $positions->last()?->fuel_level,
            ]
        ]);
    }

    /**
     * Helper pour déterminer l'état du véhicule (Logique métier)
     */
    private function determineStatus($latestPosition)
    {
        if (!$latestPosition) return 'UNKNOWN';

        $lastUpdate = Carbon::parse($latestPosition->captured_at);
        
        // Si pas de signal depuis 10 minutes -> HORS LIGNE
        if ($lastUpdate->diffInMinutes(now()) > 10) {
            return 'OFFLINE';
        }

        // Si vitesse > 2 km/h -> EN MOUVEMENT
        if ($latestPosition->speed > 2) {
            return 'MOVING';
        }

        // Sinon -> À L'ARRÊT (Moteur tournant ou éteint dépendra du fil ACC si vous l'avez câblé)
        return 'IDLE';
    }
}