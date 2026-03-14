<?php

namespace App\Http\Controllers;

use App\Models\Gas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GasController extends Controller
{
    /**
     * Affiche la liste de tous les gaz avec pagination et recherche.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $gases = Gas::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('un_code', 'like', "%{$search}%");
            })
            ->orderBy('name', 'asc')
            ->paginate(10)
            ->withQueryString(); // Garde les paramètres de recherche dans l'URL lors du changement de page

        return Inertia::render('MedDir/Gas/Index', [
            'gases' => $gases,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Affiche le formulaire de création d'un nouveau gaz.
     */
    public function create()
    {
        return Inertia::render('Gases/Create');
    }

    /**
     * Enregistre le nouveau gaz dans la base de données.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:gases,name',
            'category' => 'required|in:Médical,Industriel,Alimentaire,Spécial',
            'un_code' => 'nullable|string|max:10', // Code ONU pour le transport de matières dangereuses
            'description' => 'nullable|string',
        ]);

        Gas::create($validated);

        // Redirection avec un message flash (qui sera capté par React/Tailwind)
        return redirect()->route('gases.index')->with('success', 'Le gaz a été ajouté au catalogue avec succès.');
    }

    /**
     * Affiche les détails d'un gaz spécifique (Optionnel pour un catalogue, mais utile).
     */
    public function show(Gas $gas)
    {
        return Inertia::render('Gases/Show', [
            'gas' => $gas
        ]);
    }

    /**
     * Affiche le formulaire de modification d'un gaz.
     */
    public function edit(Gas $gas)
    {
        return Inertia::render('Gases/Edit', [
            'gas' => $gas
        ]);
    }

    /**
     * Met à jour les informations du gaz dans la base de données.
     */
    public function update(Request $request, Gas $gas)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:gases,name,' . $gas->id,
            'category' => 'required|in:Médical,Industriel,Alimentaire,Spécial',
            'un_code' => 'nullable|string|max:10',
            'description' => 'nullable|string',
        ]);

        $gas->update($validated);

        return redirect()->route('gases.index')->with('success', 'Les informations du gaz ont été mises à jour.');
    }

    /**
     * Supprime le gaz du catalogue.
     */
    public function destroy(Gas $gas)
    {
       
        $gas->delete();

        return redirect()->route('gases.index')->with('success', 'Le gaz a été retiré du catalogue.');
    }
}