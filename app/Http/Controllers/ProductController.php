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
    // --- NOUVELLES FONCTIONS DE GESTION DE STOCK OPTIMISÉES ---------------
    // ----------------------------------------------------------------------

    /**
     * Action Publique : Initialise les stocks pour UN produit spécifique.
     */
    public function initializeProductStock(Product $product)
    {
        // On passe les boutiques en paramètre pour éviter de les recharger inutilement
        $boutiques = Boutique::all();
        $this->ensureStockExists($product, $boutiques);
        
        return redirect()->back()->with('success', "Stocks initialisés pour le produit : {$product->designation}");
    }

    /**
     * Action Publique : Initialise les stocks pour TOUS les produits.
     */
    public function initializeAllStocks()
    {
        // 1. On charge les boutiques UNE SEULE FOIS pour tout le processus
        $boutiques = Boutique::all();
        $services = ['magasin', 'comptoir'];

        // 2. On utilise chunkById (plus sûr que chunk quand on modifie ou insère)
        Product::chunkById(200, function ($products) use ($boutiques, $services) {
            
            $stocksToInsert = [];
            $now = now();

            // 3. On prépare un gros tableau de données en mémoire (ultra rapide)
            foreach ($products as $product) {
                foreach ($boutiques as $boutique) {
                    foreach ($services as $service) {
                        $stocksToInsert[] = [
                            'product_id'    => $product->id,
                            'boutique_id'   => $boutique->id,
                            'service'       => $service,
                            'available_qty' => 0,
                            'created_at'    => $now,
                            'updated_at'    => $now,
                        ];
                    }
                }
            }

            // 4. On insère tout d'un seul coup (Bulk Insert)
            // insertOrIgnore tentera d'insérer. Si la combinaison existe déjà 
            // (grâce à l'index unique), il l'ignorera sans faire d'erreur.
            // Cela réduit 1000 requêtes individuelles en 1 seule requête !
            \App\Models\ProductStock::insertOrIgnore($stocksToInsert);
        });

        return redirect()->back()->with('success', 'Tous les stocks ont été initialisés/vérifiés de manière optimisée.');
    }

    /**
     * Méthode Privée (Helper) : Logique pour UN seul produit (utile lors de la création d'un produit)
     */
    private function ensureStockExists(Product $product, $boutiques = null)
    {
        // Si les boutiques ne sont pas fournies, on les charge
        $boutiques = $boutiques ?? Boutique::all();
        $services = ['magasin', 'comptoir'];
        $stocksToInsert = [];
        $now = now();

        foreach ($boutiques as $boutique) {
            foreach ($services as $service) {
                $stocksToInsert[] = [
                    'product_id'    => $product->id,
                    'boutique_id'   => $boutique->id,
                    'service'       => $service,
                    'available_qty' => 0,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ];
            }
        }

        \App\Models\ProductStock::insertOrIgnore($stocksToInsert);
    }
}