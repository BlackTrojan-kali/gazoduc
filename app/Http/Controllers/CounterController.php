<?php

namespace App\Http\Controllers;

use App\Models\Counter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CounterController extends Controller
{
    /**
     * Affiche la liste des caisses.
     * Directeur : Voit toutes les caisses triées par Région/Ville/Boutique.
     * Contrôleur : Ne voit que les caisses de sa propre boutique.
     */
    public function index()
    {
        $user = Auth::user();
        // DÉTERMINATION DU RÔLE
        $isDirecteur = $user->role->name === 'direction'; 

        // 1. Préparation de la requête avec Eager Loading (chargement imbriqué)
        $query = Counter::with(['boutique.city.region']);

        // --- LA RÈGLE D'OR : CONTRÔLEUR VS DIRECTEUR ---
        // Si ce n'est pas le directeur, on verrouille la requête sur la boutique de l'utilisateur
        if (!$isDirecteur) {
            $query->where('boutique_id', $user->boutique_id);
        }

        // 2. Récupération et Tri Côté Collection (PHP)
        $counters = $query->get()
            ->sortBy(function ($counter) {
                // On utilise "?? 'Z'" par sécurité au cas où une caisse aurait perdu sa relation boutique/ville
                $regionName = $counter->boutique->city->region->name ?? 'Z';
                $cityName   = $counter->boutique->city->name ?? 'Z';
                $boutiqueName = $counter->boutique->name ?? 'Z';

                return sprintf('%s-%s-%s', 
                    $regionName,   // 1er critère : Région
                    $cityName,     // 2ème critère : Ville
                    $boutiqueName  // 3ème critère : Boutique
                );
            })
            ->values(); // Réindexe le tableau pour le JSON (évite les clés objets en JavaScript)

        return Inertia::render('DirBoutique/CounterIndex', [
            'counters'    => $counters,
            'isDirecteur' => $isDirecteur, // On le passe au front-end (pour cacher des colonnes inutiles pour le contrôleur)
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