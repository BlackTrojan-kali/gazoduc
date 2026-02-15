<?php
// App/Http/Controllers/TrackingController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GpsDevice;
use App\Models\VehiclePosition;
use Illuminate\Support\Facades\Log;

class TrackingController extends Controller
{
    public function handleWebhook(Request $request)
    {
        // 1. Log pour le débogage (Visible dans storage/logs/laravel.log)
        // C'est ici que la simplicité de débogage brille !
        // Log::info('Traccar Data:', $request->all());

        $data = $request->input('position'); 
        $deviceData = $request->input('device');

        if (!$data || !$deviceData) {
            return response()->json(['message' => 'Invalid data'], 400);
        }

        // 2. Identification du boîtier
        $uniqueId = $deviceData['uniqueId']; // L'IMEI
        $device = GpsDevice::where('imei', $uniqueId)->first();

        if (!$device) {
            // Optionnel : Créer le device automatiquement s'il est inconnu
            return response()->json(['message' => 'Device unknown'], 404);
        }

        // 3. Récupération du véhicule associé
        $vehicle = $device->vehicule; 

        if ($vehicle) {
            // 4. Extraction du niveau de carburant (Sonde Ultrason)
            // Traccar met souvent les données capteurs dans 'attributes'
            // 'io1' ou 'fuel' dépend de la config de votre boîtier GPS
            $fuelLevel = $data['attributes']['fuel'] ?? $data['attributes']['io1'] ?? null; 
            
            // Logique de détection de vol (Simplifiée)
            $lastPosition = $vehicle->latestPosition;
            if ($lastPosition && $fuelLevel) {
                $diff = $lastPosition->fuel_level - $fuelLevel;
                if ($diff > 10) { // Si perte de plus de 10 litres d'un coup
                     // ALERTE ! C'est ici que vous envoyez un SMS/Notif
                     Log::critical("ALERTE VOL CARBURANT : Véhicule {$vehicle->licence_plate} a perdu {$diff}L");
                }
            }

            // 5. Sauvegarde
            VehiclePosition::create([
                'vehicule_id' => $vehicle->id,
                'gps_device_id' => $device->id,
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'speed' => $data['speed'], // Souvent en noeuds, à convertir en km/h (* 1.852)
                'heading' => $data['course'],
                'fuel_level' => $fuelLevel,
                'captured_at' => \Carbon\Carbon::parse($data['deviceTime']),
            ]);
        }

        return response()->json(['status' => 'success']);
    }
}