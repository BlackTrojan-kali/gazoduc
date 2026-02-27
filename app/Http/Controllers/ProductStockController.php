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
    /**
     * Affiche la liste des stocks (Vision Directeur)
     */
    public function index(Request $request)
    {
        // 1. Préparation de la requête avec Eager Loading
        $query = \App\Models\ProductStock::query()
            ->with(['product.category', 'boutique']);

        // 2. Filtre par Recherche Globale (Désignation, SKU, Code-barres)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('designation', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // 3. Filtre par Boutique et par Service
        if ($request->filled('boutique_id')) {
            $query->where('boutique_id', $request->boutique_id);
        }
        if ($request->filled('service')) {
            $query->where('service', $request->service);
        }

        // 4. NOUVEAU : Filtre par Catégorie (Rayon)
        if ($request->filled('category_id')) {
            $query->whereHas('product', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        // 5. NOUVEAU : Filtre Stratégique de Stock (Alertes et Ruptures)
        // C'est le filtre le plus important pour un directeur
        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'rupture') {
                // Stock à 0 ou négatif
                $query->where('available_qty', '<=', 0);
            } elseif ($request->stock_status === 'alerte') {
                // Stock critique : Quantité disponible inférieure ou égale au seuil d'alerte du produit
                // On utilise whereRaw dans le whereHas pour comparer les deux tables
                $query->whereHas('product', function ($q) {
                    $q->whereRaw('productstocks.available_qty <= products.stock_alert')
                      ->whereRaw('productstocks.available_qty > 0');
                });
            } elseif ($request->stock_status === 'disponible') {
                $query->where('available_qty', '>', 0);
            }
        }

        // 6. Tri Dynamique (Permet au directeur de trier par quantité pour voir les plus bas en premier)
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
        $boutiques = \App\Models\Boutique::orderBy('name')->get(['id', 'name']);
        $categories = \App\Models\ProductCategory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('DirBoutique/Products/ProductStockIndex', [
            'stocks'     => $stocks,
            'boutiques'  => $boutiques,
            'categories' => $categories, // Ajout des catégories pour le filtre
            // On renvoie tous les filtres actifs pour que React garde l'état des selects
            'filters'    => $request->only(['search', 'boutique_id', 'service', 'category_id', 'stock_status', 'sort_field', 'sort_direction']),
        ]);
    }
}