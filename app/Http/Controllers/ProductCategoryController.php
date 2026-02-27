<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ProductCategoryController extends Controller
{/**
     * Affiche la liste des catégories de produits.
     */
    public function index(Request $request)
    {
        // 1. Récupération paginée pour le tableau (avec la relation parent pour l'affichage)
        $categories = ProductCategory::query()
            ->with('parent') // Si vous avez défini la relation parent() dans le modèle
            ->when($request->input('search'), function ($query, $search) {
                // On retire la recherche sur 'description' qui n'existe plus
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest() // Trie par le plus récent
            ->paginate(10)
            ->withQueryString();

        // 2. Récupération de TOUTES les catégories (id et name) pour le Select du modal
        $allCategories = ProductCategory::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('DirBoutique/Category/ProdCatIndex', [
            'categories' => $categories,
            'allCategories' => $allCategories, // Nouveau: à passer en prop 'categories' à votre modal
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
            // On remplace 'description' par 'parent_id'
            'parent_id' => ['nullable', 'exists:productcategories,id'], 
        ], [
            'name.required' => 'Le nom de la catégorie est obligatoire.',
            'name.unique' => 'Une catégorie porte déjà ce nom.',
            'parent_id.exists' => 'La catégorie parente sélectionnée est invalide.',
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
            'name' => [
                'required', 
                'string', 
                'max:255', 
                \Illuminate\Validation\Rule::unique('productcategories')->ignore($category->id)
            ],
            'parent_id' => [
                'nullable', 
                'exists:productcategories,id',
                // Sécurité vitale : empêche une catégorie d'être son propre parent au niveau SQL
                \Illuminate\Validation\Rule::notIn([$category->id]), 
            ],
        ], [
            'name.required' => 'Le nom de la catégorie est obligatoire.',
            'parent_id.not_in' => 'Une catégorie ne peut pas être son propre parent.',
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