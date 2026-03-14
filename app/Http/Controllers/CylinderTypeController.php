<?php

namespace App\Http\Controllers;

use App\Models\CylinderType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CylinderTypeController extends Controller
{
    /**
     * Affiche la liste des types d'emballages (formats de bouteilles).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $cylinderTypes = CylinderType::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('water_capacity_liters', 'desc') // On trie souvent par taille (du plus grand au plus petit)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('MedDir/Cylinders/CylinderTypesIndex', [
            'cylinderTypes' => $cylinderTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Affiche le formulaire de création (optionnel si utilisation d'une modal).
     */
    public function create()
    {
        return Inertia::render('MedDir/CylinderTypes/Create');
    }

    /**
     * Enregistre un nouveau type d'emballage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:cylinder_types,name',
            'water_capacity_liters' => 'required|numeric|min:0.1',
            'working_pressure_bars' => 'required|numeric|min:1',
            'description' => 'nullable|string|max:500',
        ], [
            'name.unique' => 'Ce format de bouteille existe déjà dans le système.',
            'water_capacity_liters.numeric' => 'La capacité en eau doit être un nombre.',
        ]);

        CylinderType::create($validated);

        return redirect()->route('cylinder-types.index')
            ->with('success', 'Le type d\'emballage a été ajouté avec succès.');
    }

    /**
     * Affiche les détails d'un type spécifique.
     */
    public function show(CylinderType $cylinderType)
    {
        return Inertia::render('MedDir/CylinderTypes/Show', [
            'cylinderType' => $cylinderType
        ]);
    }

    /**
     * Affiche le formulaire de modification (optionnel si utilisation d'une modal).
     */
    public function edit(CylinderType $cylinderType)
    {
        return Inertia::render('MedDir/CylinderTypes/Edit', [
            'cylinderType' => $cylinderType
        ]);
    }

    /**
     * Met à jour les informations du type d'emballage.
     */
    public function update(Request $request, CylinderType $cylinderType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:cylinder_types,name,' . $cylinderType->id,
            'water_capacity_liters' => 'required|numeric|min:0.1',
            'working_pressure_bars' => 'required|numeric|min:1',
            'description' => 'nullable|string|max:500',
        ]);

        $cylinderType->update($validated);

        return redirect()->route('cylinder-types.index')
            ->with('success', 'Le format a été mis à jour avec succès.');
    }

    /**
     * Supprime le type d'emballage.
     * Note: En raison du 'cascadeOnDelete' défini dans la migration,
     * TOUTES les bouteilles (cylinders) liées à ce type seront également détruites en base de données.
     */
    public function destroy(CylinderType $cylinderType)
    {
        $name = $cylinderType->name;
        
        // La suppression en cascade s'occupe de vider les tables dépendantes
        $cylinderType->delete();

        return redirect()->route('cylinder-types.index')
            ->with('success', "Le type d'emballage {$name} et toutes ses bouteilles associées ont été supprimés.");
    }
}