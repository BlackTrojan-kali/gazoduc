<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BoutiqueController extends Controller
{
    /**
     * Enregistre une nouvelle boutique.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'region_id'  => ['required', 'exists:regions,id'],
            'city_id'    => ['required', 'exists:cities,id'],
            'name'       => ['required', 'string', 'max:255', 'unique:boutiques,name'],
            'address'    => ['nullable', 'string'],
            'counters'   => ['required', 'integer', 'min:0'],
            'is_central' => ['boolean'],
        ], [
            'region_id.required' => 'La région est obligatoire.',
            'city_id.required'   => 'La ville est obligatoire.',
            'name.unique'        => 'Une boutique avec ce nom existe déjà.',
            'counters.required'  => 'Le nombre de guichets/compteurs est obligatoire.',
        ]);

        // Gestion de la valeur par défaut pour is_central si non envoyée
        $validated['is_central'] = $request->boolean('is_central');

        Boutique::create($validated);

        return redirect()->back()->with('success', 'Boutique créée avec succès.');
    }

    /**
     * Met à jour une boutique existante.
     */
    public function update(Request $request, Boutique $boutique)
    {
        $validated = $request->validate([
            'region_id'  => ['required', 'exists:regions,id'],
            'city_id'    => ['required', 'exists:cities,id'],
            'name'       => ['required', 'string', 'max:255', Rule::unique('boutiques')->ignore($boutique->id)],
            'address'    => ['nullable', 'string'],
            'counters'   => ['required', 'integer', 'min:0'],
            'is_central' => ['boolean'],
        ]);

        // Conversion explicite en booléen pour la mise à jour
        $validated['is_central'] = $request->boolean('is_central');

        $boutique->update($validated);

        return redirect()->back()->with('success', 'Boutique mise à jour avec succès.');
    }

    /**
     * Supprime une boutique.
     */
    public function destroy(Boutique $boutique)
    {
        // Vérification optionnelle si la boutique contient des stocks ou des ventes
        // if ($boutique->sales()->exists()) {
        //     return back()->with('error', 'Impossible de supprimer cette boutique car elle a des ventes associées.');
        // }

        $boutique->delete();

        return redirect()->back()->with('success', 'Boutique supprimée avec succès.');
    }
}