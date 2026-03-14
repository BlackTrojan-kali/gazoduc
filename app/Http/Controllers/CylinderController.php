<?php

namespace App\Http\Controllers;

use App\Models\Cylinder;
use App\Models\CylinderType;
use App\Models\Agency;
use App\Models\Gas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CylinderController extends Controller
{
    /**
     * Affiche le parc global avec filtres multi-sites.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $statusFilter = $request->input('status');
        $typeFilter = $request->input('cylinder_type_id');
        $agencyFilter = $request->input('current_agency_id'); // Filtre par agence
        $gasFilter = $request->input('gas_id');               // Filtre par produit

        $cylinders = Cylinder::query()
            ->with(['cylinderType', 'currentAgency', 'gas']) // Chargement optimisé des relations
            ->when($search, function ($query, $search) {
                $query->where('serial_number', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%");
            })
            ->when($statusFilter, function ($query, $statusFilter) {
                $query->where('status', $statusFilter);
            })
            ->when($typeFilter, function ($query, $typeFilter) {
                $query->where('cylinder_type_id', $typeFilter);
            })
            ->when($agencyFilter, function ($query, $agencyFilter) {
                $query->where('current_agency_id', $agencyFilter);
            })
            ->when($gasFilter, function ($query, $gasFilter) {
                $query->where('gas_id', $gasFilter);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('MedDir/Cylinders/Index', [
            'cylinders' => $cylinders,
            // Données pour les listes déroulantes de filtrage et de la modale
            'cylinderTypes' => CylinderType::orderBy('name')->get(['id', 'name']),
            'agencies' => Agency::orderBy('name')->get(['id', 'name']),
            'gases' => Gas::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'status', 'cylinder_type_id', 'current_agency_id', 'gas_id']),
        ]);
    }

    /**
     * Enregistre une nouvelle bouteille.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'serial_number' => 'required|string|max:255|unique:cylinders,serial_number',
            'barcode' => 'required|string|max:255|unique:cylinders,barcode',
            'cylinder_type_id' => 'required|exists:cylinder_types,id',
            'current_agency_id' => 'nullable|exists:agencies,id',
            'gas_id' => 'nullable|exists:gases,id',
            'tare_weight' => 'required|numeric|min:1',
            'last_test_date' => 'required|date|before_or_equal:today',
            // Nouveaux statuts logistiques intégrés
            'status' => 'required|in:Vide_Usine,Pleine_Usine,Chez_Client,En_Maintenance,Rebut,En_Transit,Pleine_Agence',
        ]);

        Cylinder::create($validated);

        return redirect()->back()->with('success', 'La nouvelle bouteille a été ajoutée au parc avec succès.');
    }

    /**
     * Met à jour les informations de la bouteille.
     */
    public function update(Request $request, Cylinder $cylinder)
    {
        $validated = $request->validate([
            'serial_number' => 'required|string|max:255|unique:cylinders,serial_number,' . $cylinder->id,
            'barcode' => 'required|string|max:255|unique:cylinders,barcode,' . $cylinder->id,
            'cylinder_type_id' => 'required|exists:cylinder_types,id',
            'current_agency_id' => 'nullable|exists:agencies,id',
            'gas_id' => 'nullable|exists:gases,id',
            'tare_weight' => 'required|numeric|min:1',
            'last_test_date' => 'required|date|before_or_equal:today',
            'status' => 'required|in:Vide_Usine,Pleine_Usine,Chez_Client,En_Maintenance,Rebut,En_Transit,Pleine_Agence',
        ]);

        $cylinder->update($validated);

        return redirect()->back()->with('success', 'Les données de la bouteille ont été mises à jour.');
    }

    /**
     * Fonction Rapide : Modifie le statut (et potentiellement l'agence lors d'une réception).
     */
    public function updateStatus(Request $request, Cylinder $cylinder)
    {
        $validated = $request->validate([
            'status' => 'required|in:Vide_Usine,Pleine_Usine,Chez_Client,En_Maintenance,Rebut,En_Transit,Pleine_Agence',
            'current_agency_id' => 'nullable|exists:agencies,id', // Optionnel : si le scan est fait par une agence qui la réceptionne
        ]);

        $cylinder->update($validated);

        return redirect()->back()->with('success', "Statut de la bouteille mis à jour avec succès.");
    }

    /**
     * Retire une bouteille du système.
     */
    public function destroy(Cylinder $cylinder)
    {
        $serial = $cylinder->serial_number;
        
        if ($cylinder->status === 'Chez_Client' || $cylinder->status === 'En_Transit') {
            return redirect()->back()->with('error', "Impossible de supprimer la bouteille {$serial} car elle est en circulation (Client ou Transit).");
        }

        $cylinder->delete();

        return redirect()->back()->with('success', "La bouteille n°{$serial} a été retirée définitivement du système.");
    }
}