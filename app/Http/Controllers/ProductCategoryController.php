<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ProductCategoryController extends Controller
{
    /**
     * Affiche la liste des catégories de produits.
     */
    public function index(Request $request)
    {
        // Récupération avec recherche et pagination
        $categories = ProductCategory::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->latest() // Trie par le plus récent
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('DirBoutique/Category/ProdCatIndex', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Enregistre une nouvelle catégorie.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:productcategories,name'],
            'description' => ['nullable', 'string', 'max:1000'],
        ], [
            'name.required' => 'Le nom de la catégorie est obligatoire.',
            'name.unique' => 'Une catégorie porte déjà ce nom.',
        ]);

        ProductCategory::create($validated);

        return redirect()->back()->with('success', 'Catégorie créée avec succès.');
    }

    /**
     * Met à jour une catégorie existante.
     */
    public function update(Request $request, ProductCategory $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('productcategories')->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Catégorie mise à jour avec succès.');
    }

    /**
     * Supprime une catégorie.
     */
    public function destroy(ProductCategory $category)
    {
        // Sécurité : Vérifier si des produits sont liés avant de supprimer
        // Si vous avez une relation defined 'products()' dans votre modèle
        /*
        if ($category->products()->exists()) {
             return redirect()->back()->with('error', 'Impossible de supprimer cette catégorie car elle contient des produits.');
        }
        */

        $category->delete();

        return redirect()->back()->with('success', 'Catégorie supprimée avec succès.');
    }
}