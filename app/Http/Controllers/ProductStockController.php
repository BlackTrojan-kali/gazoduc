<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ProductStockController extends Controller
{
    /**
     * Affiche l'état des stocks (Inventaire global pour le Directeur, Inventaire local pour le Contrôleur).
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // DÉTERMINATION DU RÔLE : À adapter selon comment vous gérez vos rôles
        // Si vous utilisez un package comme Spatie : $isDirecteur = $user->hasRole('directeur');
        $isDirecteur = $user->role->name == 'direction'; 
        
        // 1. Préparation de la requête avec Eager Loading
        $query = \App\Models\ProductStock::query()
            ->with(['product.category', 'boutique']);

        // --- SÉCURITÉ MULTI-TENANT (Isolation par rôle) ---
        // Si l'utilisateur est contrôleur (pas directeur), on l'enferme dans sa boutique
        if (!$isDirecteur) {
            $query->where('boutique_id', $user->boutique_id);
        }

        // 2. Filtre par Recherche Globale (Désignation, SKU, Code-barres)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('designation', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // 3. Filtre par Boutique (Uniquement si l'utilisateur a le droit ET a sélectionné une boutique)
        if ($request->filled('boutique_id')) {
            if ($isDirecteur) {
                // Le directeur peut filtrer par la boutique de son choix
                $query->where('boutique_id', $request->boutique_id);
            } else {
                // Si un contrôleur essaie de forcer le filtre boutique dans l'URL, on l'écrase avec SA boutique
                $query->where('boutique_id', $user->boutique_id);
            }
        }
        
        // Filtre par Service (Comptoir, Magasin, etc.)
        if ($request->filled('service')) {
            $query->where('service', $request->service);
        }

        // 4. Filtre par Catégorie (Rayon)
        if ($request->filled('category_id')) {
            $query->whereHas('product', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        // 5. Filtre Stratégique de Stock (Alertes et Ruptures)
        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'rupture') {
                // Stock à 0 ou négatif
                $query->where('available_qty', '<=', 0);
            } elseif ($request->stock_status === 'alerte') {
                // Stock critique (Inférieur ou égal à l'alerte produit)
                $query->whereHas('product', function ($q) {
                    $q->whereRaw('productstocks.available_qty <= products.stock_alert')
                      ->whereRaw('productstocks.available_qty > 0');
                });
            } elseif ($request->stock_status === 'disponible') {
                $query->where('available_qty', '>', 0);
            }
        }

        // 6. Tri Dynamique
        $sortField = $request->input('sort_field', 'boutique_id'); 
        $sortDirection = $request->input('sort_direction', 'asc');

        // Sécurité sur les champs de tri autorisés
        $allowedSorts = ['boutique_id', 'available_qty', 'service', 'updated_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Exécution avec Pagination
        $stocks = $query->orderBy('product_id') // Tri secondaire par défaut
                        ->paginate(20)
                        ->withQueryString();

        // 7. Données pour les filtres de l'interface (Selects)
        
        // Le directeur voit toutes les boutiques. Le contrôleur ne voit que la sienne (ou pas du tout le filtre)
        if ($isDirecteur) {
            $boutiques = \App\Models\Boutique::orderBy('name')->get(['id', 'name']);
        } else {
            // Optionnel: on peut lui renvoyer uniquement sa boutique pour affichage
            $boutiques = \App\Models\Boutique::where('id', $user->boutique_id)->get(['id', 'name']);
        }

        $categories = \App\Models\ProductCategory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('DirBoutique/Products/ProductStockIndex', [
            'stocks'      => $stocks,
            'boutiques'   => $boutiques,
            'categories'  => $categories,
            'isDirecteur' => $isDirecteur, // Renvoi du rôle au front-end pour cacher le menu Select Boutique si besoin
            'filters'     => $request->only(['search', 'boutique_id', 'service', 'category_id', 'stock_status', 'sort_field', 'sort_direction']),
        ]);
    }
}