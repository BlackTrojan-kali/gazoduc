<?php

namespace App\Services;

use App\Models\Vehicule;
use App\Models\VehiclePosition;
use App\Models\FuelAlert;
use Illuminate\Support\Facades\Log;

class FuelMonitoringService
{
    /**
     * Analyse une nouvelle position pour détecter une anomalie.
     */
    public function analyze(Vehicule $vehicule, float $currentFuelLevel, VehiclePosition $currentPosition)
    {
        // 1. Récupérer la dernière position connue AVANT celle-ci
        $lastPosition = $vehicule->positions()
            ->where('id', '!=', $currentPosition->id)
            ->latest('captured_at')
            ->first();

        if (!$lastPosition || !$vehicule->tank_capacity) {
            return; // Pas assez de données pour comparer
        }

        // 2. Calculer la différence
        // Attention : Les capteurs renvoient souvent un % ou un voltage, il faut convertir en Litres si besoin.
        // Ici on suppose que $currentFuelLevel est déjà en Litres.
        
        $fuelDiff = $lastPosition->fuel_level - $currentFuelLevel;
        
        // Calcul du seuil en litres (ex: 5% de 500L = 25L)
        $thresholdLitres = ($vehicule->tank_capacity * $vehicule->theft_threshold_percentage) / 100;

        // 3. Logique de détection de VOL (Baisse brutale)
        if ($fuelDiff > $thresholdLitres) {
            
            // FILTRE INTELLIGENT : 
            // Si le camion roule, le carburant bouge ("sloshing"). 
            // Une vraie baisse brutale arrive souvent à l'arrêt ou est massive.
            
            $isMoving = $currentPosition->speed > 5; // Plus de 5 km/h
            
            // Si on roule, on tolère un seuil double (car ça bouge)
            $effectiveThreshold = $isMoving ? $thresholdLitres * 2 : $thresholdLitres;

            if ($fuelDiff > $effectiveThreshold) {
                $this->createAlert($vehicule, $currentPosition, $fuelDiff, $lastPosition->fuel_level, $currentFuelLevel);
            }
        }
    }

    protected function createAlert(Vehicule $vehicule, VehiclePosition $position, $lost, $before, $after)
    {
        // Eviter les doublons (si le tracker envoie 10 positions en 10 secondes pendant le vol)
        $existingAlert = FuelAlert::where('vehicule_id', $vehicule->id)
            ->where('created_at', '>=', now()->subMinutes(5)) // Une alerte toutes les 5 min max pour le même événement
            ->first();

        if (!$existingAlert) {
            FuelAlert::create([
                'vehicule_id' => $vehicule->id,
                'position_id' => $position->id,
                'type' => 'THEFT',
                'volume_lost' => $lost,
                'level_before' => $before,
                'level_after' => $after,
                'detected_at' => now(),
            ]);

            // TODO: Ici, déclencher l'envoi de SMS ou Notification Inertia
            Log::critical("VOL DÉTECTÉ ! Véhicule {$vehicule->licence_plate} : -{$lost} Litres");
        }
    }
}