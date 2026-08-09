<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Mouvement;
use Barryvdh\DomPDF\Facade\Pdf; // IMPORT IMPORTANT POUR LE PDF

class ArticleController extends Controller
{
   public function index(Request $request)
    {
        $query = Article::where("entreprise_id", Auth::user()->entreprise_id)
                        ->where("type", "!=", "produit_petrolier")
                        ->with("entreprise");

        // Appliquer le filtre de recherche (Code ou Nom)
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        // Appliquer le filtre par Type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $articles = $query->orderBy("created_at", "desc")->paginate(15)
                          ->withQueryString(); // Garde les filtres lors de la pagination !

        $simpleArticles = Article::where("entreprise_id", Auth::user()->entreprise_id)
                                 ->where("type", "produit")
                                 ->with("entreprise")
                                 ->orderBy("created_at", "desc")
                                 ->get();
                                 
        $entreprises = Entreprise::where("id", Auth::user()->entreprise_id)->get();
        
        // On renvoie aussi les filtres actuels à la vue pour garder l'état des inputs
        $filters = $request->only(['search', 'type']);

        return Inertia("Direction/Articles", compact("articles", "entreprises", "simpleArticles", "filters"));
    }

    public function store(Request $request)
    {
        $request->validate([
            "code" => "string|required|unique:articles,code",
            "name" => "string|min:2|required",
            "type" => "string|required",
            "unit" => "string|required",
            "entreprise_id" => "required",
            "simple_article_id" => "nullable",
            "weight_per_unit" => "nullable|numeric", // Parfait pour le gaz (ex: 12.5)
        ]);

        $article = new Article();
        $article->code = $request->code;
        $article->name = $request->name;
        $article->type = $request->type;
        $article->unit = $request->unit;
        $article->entreprise_id = $request->entreprise_id;
        $article->weight_per_unit = $request->weight_per_unit;
        $article->article_id = $request->simple_article_id;
        $article->save();

        return back()->with("success", "Article créé avec succès");
    }
    
    public function update(Request $request, $idAr)
    {
        $request->validate([
            "code" => "string|required",
            "name" => "string|min:2|required",
            "type" => "string|required",
            "unit" => "string|required",
            "entreprise_id" => "required",
            "simple_article_id" => "nullable",
            "weight_per_unit" => "nullable|numeric",
        ]);

        $article = Article::where("id", $idAr)->firstOrFail();
        $article->code = $request->code;
        $article->name = $request->name;
        $article->type = $request->type;
        $article->unit = $request->unit;
        $article->entreprise_id = $request->entreprise_id;
        $article->weight_per_unit = $request->weight_per_unit;
        $article->article_id = $request->simple_article_id;
        $article->save();

        return back()->with("info", "Article mis à jour avec succès");
    }

    public function delete($idAr)
    {
        $article = Article::where("id", $idAr)->firstOrFail();
        $movement = Mouvement::where("article_id", $idAr)->get();
        
        if (count($movement) > 0 || $article->type == "matiere_premiere") {
            return back()->with("error", "Cet article ne peut plus être supprimé car il a des mouvements.");
        }
        
        $article->delete();
        return back()->with("warning", "Article supprimé avec succès");
    }

    /**
     * NOUVEAU : EXPORT PDF FILTRABLE
     */
    public function exportPdf(Request $request)
    {
        $query = Article::where("entreprise_id", Auth::user()->entreprise_id)
                        ->with("entreprise");

        // 1. Filtrage dynamique par type (ex: si le client veut uniquement le "gaz")
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // 2. Filtrage par recherche de nom
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // On récupère les données sans pagination pour le PDF
        $articles = $query->orderBy("created_at", "desc")->get();

        // 3. On charge la vue Blade qui servira de template (que l'on vous fournira plus tard)
        // Le fichier devra se trouver dans resources/views/pdfs/articles.blade.php
        $pdf = Pdf::loadView('articles', compact('articles'));

        // 4. On génère et télécharge le fichier
        // Utilisez ->stream() si vous voulez juste l'afficher dans le navigateur au lieu de le télécharger direct
        return $pdf->download('liste_articles.pdf');
    }

    /********************************************************************************** */
    /*|                    FUEL PART  FUEL PART  FUEL PART  FUEL PART                   | */
    /********************************************************************************** */
    public function fuel_index()
    {
        $articles = Article::where("entreprise_id", Auth::user()->entreprise_id)
                           ->where("type", "produit_petrolier")
                           ->with("entreprise")
                           ->orderBy("created_at", "desc")
                           ->paginate(15);
                           
        $simpleArticles = Article::where("entreprise_id", Auth::user()->entreprise_id)
                                 ->where("type", "produit")
                                 ->with("entreprise")
                                 ->orderBy("created_at", "desc")
                                 ->get();
                                 
        $entreprises = Entreprise::where("id", Auth::user()->entreprise_id)->get();
        
        return Inertia("DirectionFuel/FuelArticles", compact("articles", "entreprises", "simpleArticles"));
    }
}