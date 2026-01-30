<?php

namespace App\Http\Controllers;

use App\Models\Counter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CounterController extends Controller
{
    /**
     * Affiche la liste de toutes les caisses, triées par Région.
     */
    public function index()
    {
        // 1. Récupération de TOUTES les caisses
        // On utilise le "Deep Eager Loading" (chargement imbriqué) pour récupérer :
        // La boutique liée > La ville liée > La région liée
        $counters = Counter::with(['boutique.city.region'])
            ->get()
            // 2. Tri Côté Collection (PHP)
            // Puisqu'on ne filtre pas en SQL, on trie la collection résultante
            // pour que l'affichage soit logique (Regroupé par Région, puis Ville, puis Boutique)
            ->sortBy(function ($counter) {
                return sprintf('%s-%s-%s', 
                    $counter->boutique->city->region->name, // 1er critère : Région
                    $counter->boutique->city->name,         // 2ème critère : Ville
                    $counter->boutique->name                // 3ème critère : Boutique
                );
            })
            ->values(); // Réindexe le tableau pour le JSON (évite les clés bizarres)

        return Inertia::render('DirBoutique/CounterIndex', [
            'counters' => $counters
        ]);
    }
    public function updateTransfertPoint(Request $request, Counter $counter)
    {
        // 1. Validation de la somme
        $validated = $request->validate([
            'transfert_point' => ['required', 'integer', 'min:0'],
        ], [
            'transfert_point.required' => 'Le montant du seuil est obligatoire.',
            'transfert_point.integer'  => 'Le montant doit être un nombre entier.',
            'transfert_point.min'      => 'Le montant ne peut pas être négatif.',
        ]);

        // 2. Mise à jour groupée
        // On cherche toutes les caisses qui ont le même 'boutique_id' que la caisse envoyée
        // et on met à jour leur 'transfert_point' en une seule requête.
        Counter::where('boutique_id', $counter->boutique_id)
               ->update(['transfert_point' => $validated['transfert_point']]);

        // 3. Retour avec notification
        return redirect()->back()->with('success', "Le seuil de versement a été mis à jour à {$validated['transfert_point']} FCFA pour toutes les caisses de cette boutique.");
    }
}