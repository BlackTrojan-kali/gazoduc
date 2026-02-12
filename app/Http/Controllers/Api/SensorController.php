<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Citerne;
use App\Models\CiterneReading;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SensorController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validation
        $request->validate([
            'sensor_token' => 'required|exists:citernes,sensor_token',
            'distance_cm'  => 'required|numeric|min:0',
        ]);

        try {
            // 2. Retrouver la Citerne
            $citerne = Citerne::where('sensor_token', $request->sensor_token)->firstOrFail();

            // 3. Retrouver le Stock lié DIRECTEMENT à la citerne
            // (C'est plus précis grâce à votre mise à jour du modèle Stock)
            $stock = Stock::where('citerne_id', $citerne->id)->first();

            if (!$stock) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Aucun stock n'est associé à la citerne {$citerne->name}. Veuillez configurer le stock."
                ], 404);
            }

            // 4. CALCUL DU VOLUME (Algorithme)
            $hauteur_vide = $request->distance_cm;
            $hauteur_totale = $citerne->total_height_cm ?? 200;
            $hauteur_liquide = $hauteur_totale - $hauteur_vide;

            if ($hauteur_liquide < 0) $hauteur_liquide = 0;

            $rayon = ($citerne->diameter_cm ?? 100) / 2;
            $volume_cm3 = pi() * pow($rayon, 2) * $hauteur_liquide;
            $volume_litres = round($volume_cm3 / 1000, 2); // Arrondi à 2 décimales

            // Utilisation d'une transaction pour garantir que le Stock et le Relevé sont synchros
            DB::beginTransaction();

            // 5. Sauvegarde des anciennes valeurs pour le calcul de différence
            $ancienne_quantite = $stock->quantity;
            $difference = $volume_litres - $ancienne_quantite;

            // 6. MISE À JOUR DU STOCK (Ceci déclenchera votre notification via boot())
            $stock->quantity = $volume_litres;
            $stock->theorical_quantity =  $ancienne_quantite;
            // On peut optionnellement mettre à jour le théorique pour qu'il colle au réel si c'est un reset
            // $stock->theorical_quantity = $volume_litres; 
            $stock->save(); 

            // 7. Enregistrement du Relevé (Historique)
            $reading = new CiterneReading();
            $reading->citerne_id = $citerne->id;
            $reading->agency_id  = $citerne->agency_id;
            $reading->stock_id   = $stock->id;
            $reading->user_id    = 1; // ID Système/Robot
            
            // On enregistre ce qu'il y avait AVANT la mise à jour comme "théorique" à cet instant T
            $reading->theorical_quantity = $ancienne_quantite; 
            $reading->measured_quantity  = $volume_litres;
            $reading->difference = $difference;
            
            $reading->type = 'automatique';
            $reading->reading_date = now();
            $reading->save();

            DB::commit();

            return response()->json([
                'status' => 'success', 
                'message' => 'Stock mis à jour et relevé enregistré',
                'liters' => $volume_litres,
                'previous_stock' => $ancienne_quantite
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erreur Sonde IoT : " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Erreur serveur interne'], 500);
        }
    }
}