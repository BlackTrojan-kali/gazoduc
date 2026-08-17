<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\ArticleCategoryPrice;
use App\Models\ClientCategory;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PriceController extends Controller
{
    /**
     * Affiche la liste des prix (filtrée par rôle)
     */
    public function index()
    {
        $user = Auth::user();
        
        // Requête de base avec les relations nécessaires
        $query = ArticleCategoryPrice::with(["article", "agency", "category"]);

        // Filtrage par agence si l'utilisateur n'est pas de la direction
        if ($user->role->name !== "direction") {
            $query->where("agency_id", $user->agency_id);
            // On limite aussi la liste des agences disponibles pour le filtre
            $agencies = Agency::where("id", $user->agency_id)->get();
        } else {
            $agencies = Agency::all();
        }

        $prices = $query->paginate(150);
        
        // Chargement des données auxiliaires pour les filtres/modals
        $clientCategories = ClientCategory::all();
        // On exclut les matières premières car on ne leur définit pas de prix de vente client généralement
        $articles = Article::where("type", "!=", "matiere_premiere")->get();

        return inertia("Clients/Price", compact("prices", "clientCategories", "articles", "agencies"));
    }
   
    /**
     * Enregistre un nouveau prix
     */
    public function store(Request $request)
    {
        $request->validate([
            "agency_id" => "required|exists:agencies,id",
            "client_category_id" => "required|exists:client_categories,id",
            "price" => "required|numeric|min:0",
            "consigne_price" => "nullable|numeric|min:0",
            "article_id" => [
                "required",
                "exists:articles,id",
                // Validation unique composite : Vérifie que le trio Article+Catégorie+Agence est unique
                Rule::unique('article_category_prices')->where(function ($query) use ($request) {
                    return $query->where('client_category_id', $request->client_category_id)
                                 ->where('agency_id', $request->agency_id);
                }),
            ],
        ]);

        ArticleCategoryPrice::create([
            'article_id' => $request->article_id,
            'client_category_id' => $request->client_category_id,
            'agency_id' => $request->agency_id,
            'price' => $request->price,
            'consigne_price' => $request->consigne_price ?? 0, // Valeur par défaut si null
        ]);

        return back()->with("success", "Prix configuré avec succès.");
    }

    /**
     * Met à jour un prix existant
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            "agency_id" => "required|exists:agencies,id",
            "client_category_id" => "required|exists:client_categories,id",
            "price" => "required|numeric|min:0",
            "consigne_price" => "nullable|numeric|min:0",
            "article_id" => [
                "required",
                "exists:articles,id",
                // IMPORTANT : On ignore l'ID actuel pour permettre la mise à jour
                Rule::unique('article_category_prices')->where(function ($query) use ($request) {
                    return $query->where('client_category_id', $request->client_category_id)
                                 ->where('agency_id', $request->agency_id);
                })->ignore($id),
            ],
        ]);

        $price = ArticleCategoryPrice::findOrFail($id);
        
        $price->update([
            'article_id' => $request->article_id,
            'client_category_id' => $request->client_category_id,
            'agency_id' => $request->agency_id,
            'price' => $request->price,
            'consigne_price' => $request->consigne_price ?? 0,
        ]);

        return back()->with("success", "Prix mis à jour avec succès.");
    }

    public function delete($id)
    {
        $price = ArticleCategoryPrice::findOrFail($id);
        $price->delete();
        return back()->with("warning", "Prix supprimé de la grille.");
    }

    /**
     * Exportation PDF avec filtres et sécurité
     */
    public function exportPdf(Request $request)
    {
        $user = Auth::user();

        // 1. Récupération des filtres
        $agencyId = $request->agency_id;
        $clientCategoryId = $request->client_category_id;
        $articleId = $request->article_id;

        // 2. Construction de la requête
        $query = ArticleCategoryPrice::with(['article', 'category', 'agency']);

        // 3. SÉCURITÉ : Application des contraintes de rôle
        if ($user->role->name !== "direction") {
            // Un utilisateur lambda ne peut voir QUE son agence, peu importe le filtre envoyé
            $query->where('agency_id', $user->agency_id);
            // On force la variable agencyId pour l'affichage correct dans le PDF
            $agencyId = $user->agency_id; 
        } elseif (!empty($agencyId)) {
            // Si c'est la direction, on applique le filtre choisi
            $query->where('agency_id', $agencyId);
        }

        // 4. Application des autres filtres
        if (!empty($clientCategoryId)) {
            $query->where('client_category_id', $clientCategoryId);
        }
        
        if (!empty($articleId)) {
            $query->where('article_id', $articleId);
        }

        // 5. Récupération des données triées
        $prices = $query->orderBy('article_id')->get();

        // 6. Récupération des objets pour l'entête du PDF (Affichage joli)
        $agency = $agencyId ? Agency::find($agencyId) : null;
        $category = $clientCategoryId ? ClientCategory::find($clientCategoryId) : null;
        $article = $articleId ? Article::find($articleId) : null;

        // 7. Génération du PDF
        // Assurez-vous d'avoir créé le fichier resources/views/pdf/prices-by-category.blade.php
        $pdf = Pdf::loadView('pdf.prices-by-category', [
            'prices' => $prices,
            'agency' => $agency,
            'category' => $category,
            'article' => $article,
            'date' => now()->format('d/m/Y H:i')
        ])->setPaper('A4', 'portrait');

        return $pdf->download('grille_tarifaire_' . now()->format('dmY_Hi') . '.pdf');
    }
}