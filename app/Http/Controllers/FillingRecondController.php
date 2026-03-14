<?php

namespace App\Http\Controllers;

use App\Models\FillingRecord;
use App\Models\Cylinder;
use App\Models\StorageTank;
use App\Models\ProductionBatch;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class FillingRecordController extends Controller
{
    /**
     * =========================================================================
     * 1. INTERFACE DE PRODUCTION EN USINE (LE MES)
     * =========================================================================
     */

    /**
     * Affiche l'écran de production (Plein écran, conçu pour les douchettes USB).
     */
    public function create()
    {
        // On ne charge que les cuves opérationnelles et les lots de production actifs (non périmés)
        $activeTanks = StorageTank::with('gas')->where('status', 'Operationnelle')->get();
        $activeBatches = ProductionBatch::whereDate('expiry_date', '>=', now())->get();

        return Inertia::render('MedDir/Production/FillingStation', [
            'tanks' => $activeTanks,
            'batches' => $activeBatches,
        ]);
    }

    /**
     * API Rapide : Vérifie si une bouteille scannée est apte au remplissage.
     * Cette fonction est appelée en AJAX/Axios à chaque "bip" de la douchette.
     */
    public function verifyScan(Request $request)
    {
        $barcode = $request->input('barcode');
        
        $cylinder = Cylinder::with('cylinderType')->where('barcode', $barcode)
                            ->orWhere('serial_number', $barcode)
                            ->first();

        if (!$cylinder) {
            return response()->json(['status' => 'error', 'message' => 'Bouteille introuvable dans le parc.'], 404);
        }

        if ($cylinder->status !== 'Vide_Usine') {
            return response()->json(['status' => 'error', 'message' => "Erreur: Cette bouteille est au statut '{$cylinder->status}'."], 400);
        }

        // Vérification de la date d'épreuve (Sécurité Industrielle)
        // Supposons qu'une épreuve est valide 5 ans
        if ($cylinder->last_test_date->diffInYears(now()) >= 5) {
            return response()->json(['status' => 'error', 'message' => "DANGER: Bouteille à requalifier. Dernière épreuve > 5 ans."], 403);
        }

        return response()->json(['status' => 'success', 'cylinder' => $cylinder], 200);
    }

    /**
     * LE MOTEUR TRANSACTIONNEL : Valide le remplissage d'un lot de bouteilles scannées.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'operator_code' => 'required|string', // Le PIN à 4 ou 6 chiffres de l'opérateur
            'storage_tank_id' => 'required|exists:storage_tanks,id',
            'production_batch_id' => 'required|exists:production_batches,id',
            'cylinder_ids' => 'required|array|min:1', // Tableau des ID des bouteilles scannées
            'cylinder_ids.*' => 'exists:cylinders,id',
        ]);

        // 1. Authentification ultra-rapide par code PIN (Atelier)
        $operator = User::where('code', $validated['operator_code'])->first();
        
        if (!$operator || !$operator->hasRole('production')) { // Assurez-vous d'avoir une méthode hasRole
            return response()->json(['message' => 'Code PIN invalide ou accès non autorisé.'], 403);
        }

        $tank = StorageTank::findOrFail($validated['storage_tank_id']);
        $cylinders = Cylinder::with('cylinderType')->whereIn('id', $validated['cylinder_ids'])->get();

        // 2. Calcul du gaz total nécessaire (Simplification : on se base sur la capacité en eau)
        // Dans la réalité, vous appliquerez un coefficient de conversion Litres d'eau -> m3 de gaz selon la pression
        $totalVolumeNeeded = $cylinders->sum(function($cyl) {
            return $cyl->cylinderType->water_capacity_liters; 
        });

        if ($tank->current_volume < $totalVolumeNeeded) {
            return response()->json(['message' => "Volume insuffisant dans la cuve. Requis: {$totalVolumeNeeded}, Dispo: {$tank->current_volume}"], 400);
        }

        // 3. Lancement de la Transaction sécurisée
        try {
            DB::beginTransaction();

            // A. Déduire le volume de la cuve
            $tank->current_volume -= $totalVolumeNeeded;
            $tank->save();

            foreach ($cylinders as $cylinder) {
                // B. Mettre à jour le statut de la bouteille
                $cylinder->update(['status' => 'Pleine_Usine']);

                // C. Créer l'archive de traçabilité
                FillingRecord::create([
                    'cylinder_id' => $cylinder->id,
                    'production_batch_id' => $validated['production_batch_id'],
                    'storage_tank_id' => $tank->id,
                    'filled_by' => $operator->id, // Traçabilité exacte de l'opérateur
                    'volume_filled' => $cylinder->cylinderType->water_capacity_liters,
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success', 
                'message' => count($cylinders) . ' bouteilles remplies avec succès.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            // Loggez l'erreur pour le debug: \Log::error($e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Erreur critique lors de la transaction. L\'opération a été annulée.'], 500);
        }
    }

    /**
     * =========================================================================
     * 2. INTERFACE DE CONSULTATION (POUR LA DIRECTION / AUDIT)
     * =========================================================================
     */

    /**
     * Affiche l'historique de tous les remplissages (Le registre journalier).
     */
    public function index(Request $request)
    {
        $records = FillingRecord::with(['cylinder', 'batch', 'tank', 'operator'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('MedDir/FillingRecords/Index', [
            'records' => $records,
        ]);
    }
}