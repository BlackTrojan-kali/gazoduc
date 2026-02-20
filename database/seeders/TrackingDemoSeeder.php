<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicule;
use App\Models\GpsDevice;
use App\Models\VehiclePosition;
use App\Models\FuelAlert;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TrackingDemoSeeder extends Seeder
{
    public function run()
    {
        // 1. Nettoyage préalable (Optionnel, pour éviter les doublons lors des tests)
        // DB::table('vehicle_positions')->truncate();
        // DB::table('fuel_alerts')->truncate();

        DB::transaction(function () {
            
            // 2. Création du Boîtier GPS
            $device = GpsDevice::firstOrCreate(
                ['imei' => 'DEMO-TRACKER-001'],
                ['model' => 'Teltonika FMB920', 'sim_number' => '+237699000000']
            );

            // 3. Création du Camion
            $truck = Vehicule::firstOrCreate(
                ['licence_plate' => 'LT 1945 AF'],
                [
                    'brand' => 'Mercedes Actros',
                    'type' => 'CAMION_CITERNE',
                    'capacity_liters' => 30000, // Citerne Marchandise
                    'tank_capacity' => 600,     // Réservoir Moteur
                    'theft_threshold_percentage' => 5.0,
                    'fuel_type' => 'diesel',
                    'gps_device_id' => $device->id,
                    'owner_type' => 'flotte_propre'
                ]
            );

            // 4. Génération du Trajet (Yaoundé -> Edéa -> Douala)
            // On simule un trajet qui a commencé il y a 6 heures
            $startTime = Carbon::now()->subHours(6);
            
            // Points de passage approximatifs (Lat, Lng)
            $waypoints = [
                ['lat' => 3.8480, 'lng' => 11.5021, 'name' => 'Yaoundé'],
                ['lat' => 3.8560, 'lng' => 10.7060, 'name' => 'Boumnyebel'],
                ['lat' => 3.8050, 'lng' => 10.1290, 'name' => 'Edéa (Pont)'], // Le vol aura lieu ici
                ['lat' => 4.0511, 'lng' => 9.7679,  'name' => 'Douala'],
            ];

            $currentFuel = 550; // Départ avec 550 Litres
            $currentTime = $startTime->copy();

            // On génère des points entre chaque étape
            foreach ($waypoints as $key => $point) {
                if (!isset($waypoints[$key + 1])) break; // Fin du trajet

                $nextPoint = $waypoints[$key + 1];
                $steps = 30; // Nombre de points GPS entre deux villes

                for ($i = 0; $i < $steps; $i++) {
                    // Interpolation linéaire pour trouver les coordonnées intermédiaires
                    $ratio = $i / $steps;
                    $lat = $point['lat'] + ($nextPoint['lat'] - $point['lat']) * $ratio;
                    $lng = $point['lng'] + ($nextPoint['lng'] - $point['lng']) * $ratio;

                    // Simulation réaliste
                    $speed = rand(40, 85); // Vitesse normale
                    $fuelConsumption = 0.2; // Consommation normale par point
                    $currentFuel -= $fuelConsumption;
                    
                    // --- SCÉNARIO DU VOL À EDÉA ---
                    // Si on est proche d'Edéa (index du tableau proche de la fin de l'étape 2)
                    if ($point['name'] === 'Edéa (Pont)' && $i < 5) {
                        $speed = 0; // Arrêt du camion
                        $fuelDrop = 10; // Perte massive par minute (Siphonage)
                        $currentFuel -= $fuelDrop; 

                        // On crée l'alerte dans la base seulement pour le premier gros écart
                        if ($i === 2) {
                            FuelAlert::create([
                                'vehicule_id' => $truck->id,
                                'type' => 'THEFT',
                                'volume_lost' => 50,
                                'level_before' => $currentFuel + 50,
                                'level_after' => $currentFuel,
                                'detected_at' => $currentTime->copy(),
                                'is_resolved' => false
                            ]);
                        }
                    }

                    // Ajout d'un peu de "bruit" GPS (imprécision normale)
                    $jitter = (rand(-100, 100) / 100000); 

                    $position = VehiclePosition::create([
                        'vehicule_id' => $truck->id,
                        'gps_device_id' => $device->id,
                        'latitude' => $lat + $jitter,
                        'longitude' => $lng + $jitter,
                        'speed' => $speed,
                        'heading' => rand(0, 360),
                        'fuel_level' => max(0, $currentFuel), // Ne pas descendre sous 0
                        'captured_at' => $currentTime->copy(),
                    ]);

                    // On avance le temps de 3 minutes entre chaque point
                    $currentTime->addMinutes(3);
                }
            }
        });
    }
}