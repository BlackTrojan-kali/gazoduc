<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductStock; // Assurez-vous d'avoir créé ce modèle
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Affiche la liste des produits (sans filtres backend).
     */
    public function index()
    {
        $products = Product::with('category')->latest()->get();
        $categories = ProductCategory::orderBy('name')->get(['id', 'name']);
        $units = Unit::orderBy('name')->get(['id', 'name']);

        return Inertia::render('DirBoutique/Products/ProductIndex', [
            'products'   => $products,
            'categories' => $categories,
            'units'      => $units,
        ]);
    }

    /**
     * Enregistre un nouveau produit et initialise ses stocks.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id'    => ['required', 'exists:productcategories,id'],
            'designation'    => ['required', 'string', 'max:255'],
            'sku'            => ['required', 'string', 'unique:products,sku', 'max:50'],
            'barcode'        => ['nullable', 'string', 'max:50'],
            'prix_achat'     => ['nullable', 'numeric', 'min:0'],
            'prix_vente'     => ['required', 'numeric', 'min:0'],
            'tva'            => ['required', 'numeric', 'between:0,100'],
            'unit'           => ['required', 'string'],
            'value_per_unit' => ['required', 'numeric', 'min:0.01'],
            'stock_alert'    => ['required', 'integer', 'min:0'],
            'image'          => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image_url'] = $request->file('image')->store('products', 'public');
        }
        unset($validated['image']);

        // Utilisation d'une transaction pour garantir que le produit ET les stocks sont créés ensemble
        DB::transaction(function () use ($validated) {
            $product = Product::create($validated);
            
            // Initialisation automatique des stocks pour ce nouveau produit
            $this->ensureStockExists($product);
        });

        return redirect()->back()->with('success', 'Produit créé et stocks initialisés avec succès.');
    }

    /**
     * Met à jour un produit existant.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id'    => ['required', 'exists:productcategories,id'],
            'designation'    => ['required', 'string', 'max:255'],
            'sku'            => ['required', 'string', 'max:50', Rule::unique('products')->ignore($product->id)],
            'barcode'        => ['nullable', 'string', 'max:50'],
            'prix_achat'     => ['nullable', 'numeric', 'min:0'],
            'prix_vente'     => ['required', 'numeric', 'min:0'],
            'tva'            => ['required', 'numeric', 'between:0,100'],
            'unit'           => ['required', 'string'],
            'value_per_unit' => ['required', 'numeric', 'min:0.01'],
            'stock_alert'    => ['required', 'integer', 'min:0'],
            'image'          => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            if ($product->image_url && Storage::disk('public')->exists($product->image_url)) {
                Storage::disk('public')->delete($product->image_url);
            }
            $validated['image_url'] = $request->file('image')->store('products', 'public');
        }
        unset($validated['image']);

        $product->update($validated);

        return redirect()->back()->with('success', 'Produit mis à jour avec succès.');
    }

    /**
     * Supprime un produit.
     */
    public function destroy(Product $product)
    {
        if ($product->image_url && Storage::disk('public')->exists($product->image_url)) {
            Storage::disk('public')->delete($product->image_url);
        }
        $product->delete();

        return redirect()->back()->with('success', 'Produit supprimé avec succès.');
    }

    // ----------------------------------------------------------------------
    // --- NOUVELLES FONCTIONS DE GESTION DE STOCK --------------------------
    // ----------------------------------------------------------------------

    /**
     * Action Publique : Initialise les stocks pour UN produit spécifique.
     * Utile si on ajoute une nouvelle boutique et qu'on veut mettre à jour un produit.
     */
    public function initializeProductStock(Product $product)
    {
        $this->ensureStockExists($product);
        return redirect()->back()->with('success', "Stocks initialisés pour le produit : {$product->designation}");
    }

    /**
     * Action Publique : Initialise les stocks pour TOUS les produits.
     * Utile lors de la mise en production ou après l'ajout de nouvelles boutiques.
     */
    public function initializeAllStocks()
    {
        // On utilise chunk pour éviter de surcharger la mémoire s'il y a des milliers de produits
        Product::chunk(100, function ($products) {
            foreach ($products as $product) {
                $this->ensureStockExists($product);
            }
        });

        return redirect()->back()->with('success', 'Tous les stocks ont été initialisés/vérifiés pour toutes les boutiques.');
    }

    /**
     * Méthode Privée (Helper) : Logique métier d'initialisation.
     * Parcourt toutes les boutiques et crée les lignes "magasin" et "comptoir" si absentes.
     */
    private function ensureStockExists(Product $product)
    {
        $boutiques = Boutique::all();
        $services = ['magasin', 'comptoir'];

        foreach ($boutiques as $boutique) {
            foreach ($services as $service) {
                // firstOrCreate vérifie si la combinaison product_id + boutique_id + service existe déjà
                // Si non, elle la crée avec available_qty = 0
                ProductStock::firstOrCreate(
                    [
                        'product_id'  => $product->id,
                        'boutique_id' => $boutique->id,
                        'service'     => $service,
                    ],
                    [
                        'available_qty' => 0,
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]
                );
            }
        }
    }
}