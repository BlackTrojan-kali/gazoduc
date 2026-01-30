<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\Counter; // Import du modèle Counter
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Import de la Facade DB pour les transactions
use Illuminate\Validation\Rule;

class BoutiqueController extends Controller
{
    /**
     * Enregistre une nouvelle boutique et génère ses caisses.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'region_id'  => ['required', 'exists:regions,id'],
            'city_id'    => ['required', 'exists:cities,id'],
            'name'       => ['required', 'string', 'max:255', 'unique:boutiques,name'],
            'address'    => ['nullable', 'string'],
            'counters'   => ['required', 'integer', 'min:1'], // Minimum 1 caisse recommandé
            'is_central' => ['boolean'],
        ]);

        $validated['is_central'] = $request->boolean('is_central');

        // Utilisation d'une transaction pour garantir l'intégrité des données
        DB::transaction(function () use ($validated) {
            // 1. Création de la boutique
            $boutique = Boutique::create($validated);

            // 2. Génération automatique des caisses
            $this->generateCounters($boutique, (int)$validated['counters']);
        });

        return redirect()->back()->with('success', 'Boutique et caisses créées avec succès.');
    }

    /**
     * Met à jour une boutique et ajuste les caisses.
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

        $validated['is_central'] = $request->boolean('is_central');

        DB::transaction(function () use ($boutique, $validated) {
            // 1. Mise à jour de la boutique
            $boutique->update($validated);

            // 2. Génération ou vérification des caisses supplémentaires
            // Si on passe de 2 à 4 caisses, ça crée la 3 et la 4.
            // Si on passe de 4 à 2 caisses, ça NE SUPPRIME PAS la 3 et la 4 (sécurité pour l'historique des ventes).
            $this->generateCounters($boutique, (int)$validated['counters']);
        });

        return redirect()->back()->with('success', 'Boutique mise à jour et caisses vérifiées.');
    }

    /**
     * Supprime une boutique.
     */
    public function destroy(Boutique $boutique)
    {
        // Le onDelete('cascade') dans la migration supprimera les caisses automatiquement
        $boutique->delete();
        return redirect()->back()->with('success', 'Boutique supprimée avec succès.');
    }

    /**
     * Méthode privée pour générer les caisses
     * * @param Boutique $boutique
     * @param int $count Nombre de caisses souhaité
     */
    private function generateCounters(Boutique $boutique, int $count)
    {
        for ($i = 1; $i <= $count; $i++) {
            $caisseName = "Caisse " . $i;

            // firstOrCreate : Vérifie si la caisse existe pour cette boutique.
            // Si oui, ne fait rien. Si non, la crée.
            Counter::firstOrCreate(
                [
                    'boutique_id' => $boutique->id,
                    'name'        => $caisseName
                ],
                [
                    // Valeurs par défaut lors de la création
                    'transfert_point' => 0, // Requis car non nullable dans votre migration
                    'type'            => 'standard'
                ]
            );
        }
    }
}