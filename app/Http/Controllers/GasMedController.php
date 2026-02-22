<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Entreprise;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GasMedController extends Controller
{
    /**
     * Affiche la liste des bouteilles de gaz médical
     */
 public function index(Request $request)
    {
        // 1. Récupérer les articles avec la relation "entreprise" ET le contenu "productInside"
        // On filtre strictement sur le type "gaz_medical" (les contenants/bouteilles)
        $articles = Article::with(['entreprise', 'productInside'])
            ->where('type', 'gaz_medical')
            ->orderBy('created_at', 'desc') // Les plus récents en premier
            ->paginate(10); // 10 bouteilles par page

        // 2. Récupérer les entreprises pour alimenter le <select> de votre modale
        $entreprises = Entreprise::select('id', 'name')->get();

        // 3. NOUVEAU : Récupérer les gaz (matières premières) pour alimenter le <select> "Gaz Contenu"
        // (Assurez-vous que le type correspond bien à ce que vous avez en base, ex: 'matiere_premiere')
        $matieresPremieres = Article::where('type', 'matiere_premiere')
            ->select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        // 4. Retourner la vue Inertia avec toutes les données requises
        return Inertia::render('Direction/GasMedical/Index', [
            'articles'          => $articles,
            'entreprises'       => $entreprises,
            'matieresPremieres' => $matieresPremieres, // Transmission de la liste des gaz
            'filters'           => $request->only(['search', 'state']) 
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            "code"                       => "string|required|unique:articles,code",
            "name"                       => "string|required",
            "type"                       => "string|required",
            "unit"                       => "string|required",
            "entreprise_id"              => "numeric|required",
            "weight_per_unit"            => "numeric|nullable",
            "state"                      => "string|nullable",
            "batch_number"               => "string|nullable",
            "article_id"                 => "numeric|nullable",
            // NOUVEAUX CHAMPS
            "product_inside_id"          => "numeric|nullable|exists:articles,id",
            "last_maintenance"           => "date|nullable", 
            "estimated_maintenance_date" => "date|nullable"
        ]);

        $article = new Article();
        $article->code = $request->code;
        $article->name = $request->name;
        $article->type = $request->type;
        $article->unit = $request->unit;
        $article->entreprise_id = $request->entreprise_id;
        $article->weight_per_unit = $request->weight_per_unit;
        $article->state = $request->state;
        $article->batch_number = $request->batch_number;
        $article->article_id = $request->article_id;
        
        // NOUVEAUX CHAMPS
        $article->product_inside_id = $request->product_inside_id;
        $article->last_maintenance = $request->last_maintenance;
        $article->estimated_maintenance_date = $request->estimated_maintenance_date;
        
        $article->save();

        return back()->with("success", "gas medical article created successfully");
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            // CORRECTION : On ignore l'ID actuel pour la règle d'unicité du code
            "code"                       => "string|required|unique:articles,code," . $id, 
            "name"                       => "string|required",
            "type"                       => "string|required",
            "unit"                       => "string|required",
            "entreprise_id"              => "numeric|required",
            "weight_per_unit"            => "numeric|nullable",
            "state"                      => "string|nullable",
            "batch_number"               => "string|nullable",
            "article_id"                 => "numeric|nullable",
            // NOUVEAUX CHAMPS
            "product_inside_id"          => "numeric|nullable|exists:articles,id",
            "last_maintenance"           => "date|nullable",
            "estimated_maintenance_date" => "date|nullable"
        ]);

        $article = Article::findOrFail($id);
        $article->code = $request->code;
        $article->name = $request->name;
        $article->type = $request->type;
        $article->unit = $request->unit;
        $article->entreprise_id = $request->entreprise_id;
        $article->weight_per_unit = $request->weight_per_unit;
        $article->state = $request->state;
        $article->batch_number = $request->batch_number;
        $article->article_id = $request->article_id;
        
        // NOUVEAUX CHAMPS
        $article->product_inside_id = $request->product_inside_id;
        $article->last_maintenance = $request->last_maintenance;
        $article->estimated_maintenance_date = $request->estimated_maintenance_date;
        
        $article->save();

        // On initialise les stocks immédiatement après la sauvegarde
        $this->initializeStockForArticle($article);
        
        return back()->with("info", "gas medical article updated successfully");
    }
    public function destroy($id)
    {
        // 1. Recherche de l'article par son ID, renvoie une erreur 404 si non trouvé
        $article = Article::findOrFail($id);
        
        // 2. Suppression de l'article
        $article->delete();
        
        // 3. Retour à la page précédente avec un message de succès
        // (Inertia interceptera ce retour pour rafraîchir le tableau sans recharger la page)
        return back()->with("success", "gas medical article deleted successfully");
    }
    protected function initializeStockForArticle(Article $article)
    {
        $agencies = Agency::all();
        $storageTypes = ['magasin', 'production', 'commercial'];

        foreach ($agencies as $agency) {
            foreach ($storageTypes as $type) {
                // firstOrCreate cherche la combinaison (article, agence, type).
                // Si elle n'existe pas, il la crée avec les valeurs du deuxième tableau (quantités à 0).
                Stock::firstOrCreate(
                    [
                        'article_id'   => $article->id,
                        'agency_id'    => $agency->id,
                        'storage_type' => $type,
                    ],
                    [
                        'quantity'           => 0,
                        'theorical_quantity' => 0,
                    ]
                );
            }
        }
    }

    /**
     * 2. Initialise les stocks pour TOUS les articles de type gaz_medical
     * (Utile pour une migration de données ou un script d'initialisation global)
     */
    public function initializeAllGasMedicalStocks()
    {
        // Récupère uniquement les articles de type gaz médical
        $gasArticles = Article::where('type', 'gaz_medical')->get();

        foreach ($gasArticles as $article) {
            $this->initializeStockForArticle($article);
        }

        return back()->with('success', 'Tous les stocks de gaz médical ont été initialisés à zéro pour toutes les agences.');
    }
   /**
     * Affiche l'inventaire des stocks de gaz médical (avec gestion des emplacements et des zéros)
     */
    public function inventory(Request $request)
    {
        $agencyId = $request->input('agency_id');
        $searchCode = $request->input('code');

        $groupedStocks = [];
        $searchedBottle = null;

        // 1. Recherche spécifique par Code-barres
        if ($searchCode) {
            $searchedBottle = Stock::with(['article', 'agency'])
                ->whereHas('article', function ($query) use ($searchCode) {
                    $query->where('code', $searchCode)
                          ->where('type', 'gaz_medical');
                })
                ->where('quantity', 1) 
                ->first(); 
        } 
        
        // 2. Visualisation par Agence (Regroupée par Nom et Emplacement avec affichage des zéros)
        else if ($agencyId) {
            // A. On récupère la liste exhaustive et unique des noms d'articles de type gaz médical
            $articleNames = Article::where('type', 'gaz_medical')
                ->select('name')
                ->distinct()
                ->pluck('name');

            // B. On calcule les stocks réels actuellement à 1 dans cette agence
            $actualStocks = DB::table('stocks')
                ->join('articles', 'stocks.article_id', '=', 'articles.id')
                ->where('stocks.agency_id', $agencyId)
                ->where('stocks.quantity', 1) // Bouteille physiquement présente
                ->where('articles.type', 'gaz_medical')
                ->select('articles.name', 'stocks.storage_type', DB::raw('count(*) as total_bottles'))
                ->groupBy('articles.name', 'stocks.storage_type')
                ->get();
            // C. On construit le tableau final en croisant les noms et les types de stockage
            foreach ($articleNames as $name) {
                // Initialisation à zéro pour chaque emplacement
                $stockData = [
                    'name'       => $name,
                    'magasin'    => 0,
                    'production' => 0,
                    'commercial' => 0,
                    'total'      => 0
                ];

                // On peuple avec les vraies données si elles existent
                foreach ($actualStocks as $actualStock) {
                    if ($actualStock->name === $name) {
                        // storage_type sera 'magasin', 'production', ou 'commercial'
                        $type = $actualStock->storage_type;
                        if (array_key_exists($type, $stockData)) {
                            $stockData[$type] = $actualStock->total_bottles;
                            $stockData['total'] += $actualStock->total_bottles;
                        }
                    }
                }
                $groupedStocks[] = $stockData;
            }
        }
        $agencies = Agency::select('id', 'name')->orderBy('name')->get();
        
        return Inertia::render('Direction/GasMedical/Inventory', [
            'agencies'       => $agencies,
            'groupedStocks'  => $groupedStocks,
            'searchedBottle' => $searchedBottle,
            'filters'        => $request->only(['agency_id', 'code'])
        ]);
    }
}