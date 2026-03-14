<?php

namespace App\Http\Controllers;

use App\Models\StorageTank;
use App\Models\Gas;
use App\Models\Agency; // Assurez-vous d'avoir ce modèle
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorageTankController extends Controller
{
    /**
     * Affiche la liste des cuves avec leurs gaz et agences associés.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $agencyFilter = $request->input('agency_id');

        $tanks = StorageTank::query()
            ->with(['gas', 'agency']) // Eager loading pour optimiser les requêtes SQL
            ->when($search, function ($query, $search) {
                $query->where('reference_code', 'like', "%{$search}%");
            })
            ->when($agencyFilter, function ($query, $agencyFilter) {
                $query->where('agency_id', $agencyFilter);
            })
            ->orderBy('agency_id')
            ->orderBy('reference_code')
            ->paginate(10)
            ->withQueryString();

        // On envoie aussi la liste des gaz et agences pour garnir les <select> de la modale
        return Inertia::render('MedDir/StorageTanks/Index', [
            'tanks' => $tanks,
            'gases' => Gas::orderBy('name')->get(['id', 'name']),
            'agencies' => Agency::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'agency_id']),
        ]);
    }

    /**
     * Enregistre une nouvelle cuve dans le système.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference_code' => 'required|string|max:255|unique:storage_tanks,reference_code',
            'gas_id' => 'required|exists:gases,id',
            'agency_id' => 'required|exists:agencies,id',
            'max_capacity' => 'required|numeric|min:1',
            'current_volume' => 'required|numeric|min:0|lte:max_capacity', // Doit être <= max_capacity
            'safe_minimum_level' => 'required|numeric|min:0|lt:max_capacity', // Doit être < max_capacity
            'status' => 'required|in:Operationnelle,En_Maintenance,Hors_Service',
        ], [
            'current_volume.lte' => 'Le volume actuel ne peut pas dépasser la capacité maximale de la cuve.',
            'safe_minimum_level.lt' => 'Le seuil d\'alerte doit être strictement inférieur à la capacité maximale.',
        ]);

        StorageTank::create($validated);

        return redirect()->back()->with('success', 'La cuve a été ajoutée avec succès.');
    }

    /**
     * Met à jour les paramètres de la cuve.
     */
    public function update(Request $request, StorageTank $storageTank)
    {
        $validated = $request->validate([
            'reference_code' => 'required|string|max:255|unique:storage_tanks,reference_code,' . $storageTank->id,
            'gas_id' => 'required|exists:gases,id',
            'agency_id' => 'required|exists:agencies,id',
            'max_capacity' => 'required|numeric|min:1',
            // On s'assure que le volume mis à jour ne dépasse pas la NOUVELLE capacité maximale définie
            'current_volume' => 'required|numeric|min:0|lte:max_capacity', 
            'safe_minimum_level' => 'required|numeric|min:0|lt:max_capacity',
            'status' => 'required|in:Operationnelle,En_Maintenance,Hors_Service',
        ], [
            'current_volume.lte' => 'Le volume actuel ne peut pas dépasser la capacité maximale de la cuve.',
            'safe_minimum_level.lt' => 'Le seuil d\'alerte doit être inférieur à la capacité maximale.',
        ]);

        $storageTank->update($validated);

        return redirect()->back()->with('success', 'Les paramètres de la cuve ont été mis à jour.');
    }

    /**
     * Met à jour uniquement le volume de la cuve (très utile pour les relevés manuels de jauge).
     */
    public function updateVolume(Request $request, StorageTank $storageTank)
    {
        $validated = $request->validate([
            'current_volume' => 'required|numeric|min:0|lte:' . $storageTank->max_capacity,
        ], [
            'current_volume.lte' => 'Le volume saisi dépasse la capacité maximale physique de cette cuve.',
        ]);

        $storageTank->update([
            'current_volume' => $validated['current_volume']
        ]);

        // Note pour plus tard : C'est ici que l'on pourrait créer une entrée dans la table "TankTransaction" 
        // pour tracer qui a modifié le volume manuellement (ex: Ajustement d'inventaire / Évaporation).

        return redirect()->back()->with('success', 'Le niveau de la cuve a été ajusté avec succès.');
    }

    /**
     * Supprime la cuve.
     */
    public function destroy(StorageTank $storageTank)
    {
        $reference = $storageTank->reference_code;
        
        // Sécurité métier : On ne supprime pas une cuve qui contient encore du gaz
        if ($storageTank->current_volume > 0) {
            return redirect()->back()->with('error', "Impossible de supprimer la cuve {$reference} car elle contient encore {$storageTank->current_volume} unités de gaz. Veuillez la vider informatiquement d'abord.");
        }

        $storageTank->delete();

        return redirect()->back()->with('success', "La cuve {$reference} a été retirée du système.");
    }
}