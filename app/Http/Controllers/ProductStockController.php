<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\Productstock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductStockController extends Controller
{
    /**
     * Affiche l'état des stocks (Inventaire global).
     */
    public function index(Request $request)
    {
        // 1. Préparation de la requête avec Eager Loading
        // On charge le produit (et sa catégorie) ainsi que la boutique pour éviter les requêtes N+1
        $query = Productstock::query()
            ->with(['product.category', 'boutique']);

        // 2. Filtre par Recherche (Désignation du produit, SKU ou Code-barres)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('designation', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // 3. Filtre par Boutique spécifique
        if ($request->filled('boutique_id')) {
            $query->where('boutique_id', $request->boutique_id);
        }

        // 4. Filtre par Service (ex: magasin ou comptoir)
        if ($request->filled('service')) {
            $query->where('service', $request->service);
        }

        // 5. Exécution avec Tri et Pagination
        // Tri par boutique puis par produit pour un affichage logique
        $stocks = $query->orderBy('boutique_id')
                        ->orderBy('product_id')
                        ->paginate(15)
                        ->withQueryString();

        // 6. Données pour les filtres de l'interface
        $boutiques = Boutique::orderBy('name')->get(['id', 'name']);

        return Inertia::render('DirBoutique/Products/ProductStockIndex', [
            'stocks'    => $stocks,
            'boutiques' => $boutiques,
            'filters'   => $request->only(['search', 'boutique_id', 'service']),
        ]);
    }
}