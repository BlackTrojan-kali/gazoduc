<?php

namespace App\Http\Controllers;

use App\Models\ProductStock;
use App\Models\ProductMove;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ComBoutiqueController extends Controller
{
    /**
     * Affiche le stock du commercial (Service: 'comptoir')
     * Uniquement pour la boutique de l'utilisateur connecté.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // On récupère les stocks liés au service 'comptoir' de la boutique de l'utilisateur
        $query = ProductStock::with('product.category')
            ->where('boutique_id', $user->boutique_id)
            ->where('service', 'comptoir'); // FILTRE CRUCIAL : Uniquement le stock commercial

        // Recherche optionnelle
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('product', function($q) use ($search) {
                $q->where('designation', 'like', '%' . $search . '%')
                  ->orWhere('sku', 'like', '%' . $search . '%');
            });
        }

        $stocks = $query->paginate(15)->withQueryString();

        // On retourne la vue Inertia (adaptez le chemin selon votre structure de dossiers)
        return Inertia::render('ComBoutique/ComBoutiqueIndex', [
            'stocks' => $stocks,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Enregistre un mouvement de sortie (Retour Magasin ou Perte).
     */
  public function store(Request $request)
{
    // 1. Validation
    $validated = $request->validate([
        'product_id'  => 'required|exists:products,id',
        'qty'         => 'required|numeric|min:0.01',
        'destination' => 'required|string|in:Magasin,Perte',
        'label'       => 'nullable|string|max:255',
    ]);

    $user = Auth::user();

    try {
        DB::transaction(function () use ($validated, $user) {
            
            // --- ÉTAPE A : GESTION DU COMPTOIR (SORTIE) ---

            // 2. Verrouillage du stock 'comptoir'
            $stockComptoir = ProductStock::where([
                'product_id'  => $validated['product_id'],
                'boutique_id' => $user->boutique_id,
                'service'     => 'comptoir'
            ])->lockForUpdate()->first();

            // 3. Vérification du Stock Disponible
            $currentQty = $stockComptoir ? $stockComptoir->available_qty : 0;

            if ($currentQty < $validated['qty']) {
                throw new \Exception("Stock insuffisant au comptoir. Disponible : $currentQty");
            }

            // 4. Débit du Stock Comptoir
            $stockComptoir->decrement('available_qty', $validated['qty']);
            $stockComptoir->refresh(); // Mise à jour pour l'historique

            // 5. Enregistrement du Mouvement SORTIE (Comptoir)
            ProductMove::create([
                'product_id'      => $validated['product_id'],
                'boutique_id'     => $user->boutique_id,
                'user_id'         => $user->id,
                'qty'             => $validated['qty'],
                'type'            => 'sortie',
                'departure'       => 'Comptoir',
                'destination'     => $validated['destination'], // 'Magasin' ou 'Perte'
                'label'           => $validated['label'] ?? 'Sortie comptoir',
                'remaining_stock' => $stockComptoir->available_qty
            ]);

            // --- ÉTAPE B : GESTION DU MAGASIN (ENTRÉE) SI APPLICABLE ---

            if ($validated['destination'] === 'Magasin') {
                
                // 6. Récupération ou Création du stock 'Magasin'
                // Note : On ne lock pas ici car firstOrCreate gère mal le lock atomique, 
                // mais pour une incrémentation le risque est minime.
                $stockMagasin = ProductStock::firstOrCreate(
                    [
                        'product_id'  => $validated['product_id'],
                        'boutique_id' => $user->boutique_id,
                        'service'     => 'magasin'
                    ],
                    ['available_qty' => 0]
                );

                // 7. Crédit du Stock Magasin
                $stockMagasin->increment('available_qty', $validated['qty']);
                $stockMagasin->refresh(); // IMPORTANT : Pour avoir la valeur exacte après incrément

                // 8. Enregistrement du Mouvement ENTRÉE (Magasin)
                // C'est ici qu'on assure la traçabilité complète
                ProductMove::create([
                    'product_id'      => $validated['product_id'],
                    'boutique_id'     => $user->boutique_id,
                    'user_id'         => $user->id,
                    'qty'             => $validated['qty'],
                    'type'            => 'entree', // Type inverse
                    'departure'       => 'Comptoir', // D'où ça vient
                    'destination'     => 'Magasin',  // Où ça va
                    'label'           => 'Retour interne depuis le Comptoir',
                    'remaining_stock' => $stockMagasin->available_qty // Stock du MAGASIN après mouvement
                ]);
            }

        });

        return redirect()->back()->with('success', 'Mouvement enregistré et stocks mis à jour.');

    } catch (\Exception $e) {
        return redirect()->back()->withErrors(['error' => $e->getMessage()]);
    }
}
}