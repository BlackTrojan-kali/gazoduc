<?php

namespace App\Http\Controllers;

use App\Exports\ProductionHistoryExcelExport;
use App\Models\Agency;
use App\Models\Article;
use App\Models\Citerne;
use App\Models\Entreprise;
use App\Models\Mouvement;
use App\Models\ProductionHistory;
use App\Models\Stock;
use App\Models\Vehicule;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProductionController extends Controller
{
    //
    public function index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type",Auth::user()->role->name)
        ->with("article")
        ->get();  
         $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","!=","matiere_premiere")->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
  
        return Inertia("Production/Prodindex",compact("stocks","articles","agencies"));
    }
       //
     public function citerne_index()
{
    $user = Auth::user();

    // 1. Récupération sécurisée des stocks (Gaz/Liquide) de l'agence
    // On utilise une sous-requête pour que l'agence soit toujours respectée
    $stocks = Stock::where("agency_id", $user->agency_id)
        ->where(function($query) {
            $query->where("storage_type", "gaz")
                  ->orWhere("storage_type", "liquide");
        })
        ->with(["article", "citerne.agency"])
        ->get();

    // 2. Agences rattachées
    $agencies = Agency::where("id", $user->agency_id)
        ->where("entreprise_id", $user->entreprise_id)
        ->get(['id', 'name']);

    // 3. Récupération des Articles selon votre nouvelle migration
    // Matières premières (Gaz Vrac)
    $articles = Article::where("entreprise_id", $user->entreprise_id)
        ->where("type", "matiere_premiere")
        ->get(['id', 'name', 'unit', 'weight_per_unit']);

    // Produits finis (Bouteilles prêtes à être produites)
    $articlesProd = Article::where("entreprise_id", $user->entreprise_id)
        ->where("type", "produit_fini")
        ->get(['id', 'name', 'unit', 'weight_per_unit']);

    // 4. Sources de Production : Citernes Fixes
    $citernesFixes = Citerne::where("entreprise_id", $user->entreprise_id)
        ->where("agency_id", $user->agency_id)
        ->where("type", "fixed")
        ->with("article")
        ->get();

    // 5. Sources de Production : Citernes Mobiles (Table Véhicules)
    // On récupère les camions-citernes non archivés
    $citernesMobiles = Vehicule::where("archived",0)->get();
    // 6. Envoi des données vers Inertia
    return Inertia::render("Production/ProdCiterne", [
        "stocks"          => $stocks,
        "agencies"        => $agencies,
        "articles"        => $articles,     // Matière première (Vrac)
        "articlesProd"    => $articlesProd, // Produit à générer (Bouteilles)
        "citernesFixes"   => $citernesFixes,
        "citernesMobiles" => $citernesMobiles,
    ]);
}
  public function produce(Request $request)
    {
        // 1. Validation des données
        $request->validate([
            "source_type"       => "required|in:fixed,mobile",
            "source_citerne_id" => "required_if:source_type,fixed",
            "vehicle_id"        => "required_if:source_type,mobile",
            "article_id"        => "required|exists:articles,id", // Article à produire (Plein)
            "quantity_produced" => "required|numeric|min:1",
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $qty = $request->quantity_produced;

            // --- A. RÉCUPÉRATION DES ARTICLES ---

            $articlePlein = Article::findOrFail($request->article_id);
            
            if (!$articlePlein->article_id) {
                return back()->with("error", "Erreur config : L'article {$articlePlein->name} n'a pas de bouteille vide associée.");
            }
            $articleVide = Article::findOrFail($articlePlein->article_id);

            // --- B. VÉRIFICATION STRICTE DES STOCKS (Type 'production' uniquement) ---

            // 1. Stock Bouteilles VIDES (Matière sèche)
            $stockVide = Stock::where('article_id', $articleVide->id)
                ->where('agency_id', $user->agency_id)
                ->where('storage_type', 'production') // <--- CONTRAINTE STRICTE
                ->first();

            // Pas de création automatique : on bloque si le stock n'existe pas ou est insuffisant
            if (!$stockVide) {
                return back()->with("error", "Aucun stock de type 'Production' trouvé pour les bouteilles vides ({$articleVide->name}).");
            }
            if ($stockVide->quantity < $qty) {
                return back()->with("error", "Stock 'Production' insuffisant pour {$articleVide->name}. (Dispo: {$stockVide->quantity})");
            }

            // 2. Stock Bouteilles PLEINES (Produit Fini)
            $stockPlein = Stock::where('article_id', $articlePlein->id)
                ->where('agency_id', $user->agency_id)
                ->where('storage_type', 'production') // <--- CONTRAINTE STRICTE
                ->first();

            // Pas de création automatique
            if (!$stockPlein) {
                return back()->with("error", "Aucun stock de type 'Production' initialisé pour le produit fini ({$articlePlein->name}). Veuillez créer la ligne de stock.");
            }

            // --- C. GESTION GAZ VRAC (Citerne) ---
            
            $poidsGazNecessaire = $qty * $articlePlein->weight_per_unit;
            $stockCiterneSnapshot = 0;

            if ($request->source_type === 'fixed') {
                $citerneFixe = Citerne::with('stock')->findOrFail($request->source_citerne_id);
                $stockCiterne = $citerneFixe->stock;

                if (!$stockCiterne || $stockCiterne->quantity < $poidsGazNecessaire) {
                    return back()->with("error", "Quantité de gaz insuffisante dans la citerne fixe.");
                }
                
                $stockCiterneSnapshot = $stockCiterne->quantity;

                // Logique IoT : On ne déduit que si pas de sonde
                if (empty($citerneFixe->sensor_token)) {
                    $stockCiterne->quantity -= $poidsGazNecessaire;
                    $stockCiterne->theorical_quantity = $stockCiterne->quantity;
                    $stockCiterne->save();
                }
            } else {
                // Mobile : Validation simple d'existence
                $vehicule = Vehicule::findOrFail($request->vehicle_id);
            }

            // --- D. EXÉCUTION DES MOUVEMENTS ---

            // 1. DÉBITER les Vides (Consommation)
            $stockVide->quantity -= $qty;
            $stockVide->save();

            // 2. CRÉDITER les Pleines (Production)
            $stockPlein->quantity += $qty;
            $stockPlein->save();

            $mouvPlein = Mouvement::create([
                'article_id'          => $articlePlein->id,
                'agency_id'           => $user->agency_id,
                'entreprise_id'       => $user->entreprise_id,
                'recorded_by_user_id' => $user->id,
                'movement_type'       => 'entree',
                'quantity'            => $qty,
                'stock'               => $stockPlein->quantity,
                'qualification'       => 'production_finie',
                'source_location'     => 'production',
                'destination_location'=> 'Stock Production', // <--- Destination logique
                'description'         => "Production validée depuis " . ($request->source_type === 'fixed' ? 'Citerne Usine' : 'Camion'),
            ]);

            // --- E. HISTORIQUE ---

            $prodHistory = new ProductionHistory();
            $prodHistory->agency_id = $user->agency_id;
            $prodHistory->recorded_by_user_id = $user->id;
            $prodHistory->article_id = $request->article_id;
            $prodHistory->quantity_produced = $qty;
            $prodHistory->total_weight_produced = $poidsGazNecessaire;
            $prodHistory->production_movement_id = $mouvPlein->id;
            $prodHistory->stock_citern = $stockCiterneSnapshot;



            

            if ($request->source_type === 'fixed') {
                $prodHistory->source_citerne_id = $request->source_citerne_id;
            } else {
                $prodHistory->vehicle_id = $request->vehicle_id;
            }

            $prodHistory->save();

            
            Mouvement::create([
                'article_id'          => $articleVide->id,
                'agency_id'           => $user->agency_id,
                'entreprise_id'       => $user->entreprise_id,
                'recorded_by_user_id' => $user->id,
                'movement_type'       => 'sortie',
                'quantity'            => $qty,
                'stock'               => $stockVide->quantity,
                'qualification'       => 'consommation_production '.$prodHistory->id,
                'source_location'     => 'production', // <--- CONTRAINTE RESPECTÉE
                'destination_location'=> 'Ligne de Remplissage',
                'description'         => "Mise en production: {$articlePlein->name}",
            ]);
            DB::commit();
            return back()->with("success", "Production de $qty bouteilles enregistrée avec succès.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with("error", "Erreur technique : " . $e->getMessage());
        }
    }

public function prod_history()
    {
        $user = Auth::user();

        // 1. Construction de la requête principale (ProductionHistory)
        // On commence par charger les relations nécessaires. 
        // IMPORTANT : On ajoute 'vehicle' car la source peut être mobile.
        $query = ProductionHistory::with(['citerne', 'vehicle', 'article', 'agency', 'user'])
            ->orderBy("created_at", "desc");

        // 2. Préparation des requêtes pour les données auxiliaires (Filtres)
        // On s'assure de toujours filtrer par entreprise_id pour la sécurité multi-tenant
        $citernesQuery = Citerne::where("entreprise_id", $user->entreprise_id)
            ->where("product_type", "gaz"); // Ou type 'fixed' selon votre nomenclature

        // Pour les articles, on veut voir les produits finis (ce qu'on a produit), pas la matière première
        $articlesQuery = Article::where("entreprise_id", $user->entreprise_id)
            ->where("type", "produit_fini"); 

        $agenciesQuery = Agency::where("entreprise_id", $user->entreprise_id);

        // 3. Application du filtre de Rôle (Logique identique à votre demande)
        if ($user->role->name !== "direction") {
            // L'utilisateur lambda ne voit que son agence
            $query->where("agency_id", $user->agency_id);
            
            // Les filtres aussi sont restreints à son agence
            $citernesQuery->where("agency_id", $user->agency_id);
            $agenciesQuery->where("id", $user->agency_id);
        }

        // 4. Exécution des requêtes
        $prodMoves = $query->paginate(15);
        $citernes = $citernesQuery->get();
        $articles = $articlesQuery->get();
        $agencies = $agenciesQuery->get();

        return Inertia::render("Production/ProdMoves", [
            "prodMoves" => $prodMoves,
            "articles"  => $articles,
            "citernes"  => $citernes,
            "agencies"  => $agencies
        ]);
    }





public function delete($idProd)
    {
        try {
            DB::beginTransaction();

            // 1. Récupération de l'historique avec ses relations
            $prodHistory = ProductionHistory::with(['article', 'citerne.stock', 'mouvement'])->findOrFail($idProd);
            $user = Auth::user();

            // --- A. VÉRIFICATION DE LA FAISABILITÉ (Anti-Stock Négatif) ---
            
            // On récupère le stock de produits finis (Bouteilles pleines)
            $stockPlein = Stock::where('article_id', $prodHistory->article_id)
                ->where('agency_id', $prodHistory->agency_id)
                ->where('storage_type', 'production')
                ->first();

            if (!$stockPlein || $stockPlein->quantity < $prodHistory->quantity_produced) {
                return back()->with("error", "Annulation impossible : Le stock de bouteilles pleines est insuffisant (déjà vendues ou déplacées).");
            }

            // --- B. INVERSION DES STOCKS D'ARTICLES ---

            // 1. Retrait des Bouteilles Pleines
            $stockPlein->quantity -= $prodHistory->quantity_produced;
            $stockPlein->save();

            // 2. Réintégration des Bouteilles Vides (Article Parent)
            $articlePlein = $prodHistory->article;
            $stockVide = Stock::where('article_id', $articlePlein->article_id)
                ->where('agency_id', $prodHistory->agency_id)
                ->where('storage_type', 'production')
                ->first();

            if ($stockVide) {
                $stockVide->quantity += $prodHistory->quantity_produced;
                $stockVide->save();
            }

            // --- C. RÉINTÉGRATION DU GAZ VRAC (Si Citerne Fixe & Hors IoT) ---

            if ($prodHistory->source_citerne_id) {
                $citerne = $prodHistory->citerne;
                // On ne réintègre QUE si la citerne n'a pas de sonde (Gestion manuelle)
                if ($citerne && empty($citerne->sensor_token)) {
                    $stockCiterne = $citerne->stock;
                    if ($stockCiterne) {
                        $stockCiterne->quantity += $prodHistory->total_weight_produced;
                        $stockCiterne->theorical_quantity = $stockCiterne->quantity;
                        $stockCiterne->save();
                    }
                }
            }

            // --- D. NETTOYAGE DES MOUVEMENTS ET DE L'HISTORIQUE ---

            // 1. Supprimer le mouvement d'entrée qui était lié à cette production
            if ($prodHistory->production_movement_id) {
                Mouvement::where('id', $prodHistory->production_movement_id)->delete();
            }

            // 2. Supprimer le mouvement de sortie des bouteilles vides 
            // (On le retrouve par la qualification et la date/heure proche si pas d'ID direct)
            Mouvement::where('agency_id', $prodHistory->agency_id)
                ->where('article_id', $articlePlein->article_id)
                ->where('movement_type', 'sortie')
                ->where('qualification', 'consommation_production '.$prodHistory->id)
                ->delete();

            // 3. Enfin, on supprime l'historique lui-même
            $prodHistory->delete();

            DB::commit();
            return back()->with("success", "La production a été annulée. Les stocks et mouvements ont été corrigés, monsieur.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with("error", "Erreur lors de la suppression : " . $e->getMessage());
        }
    }    

     public function export(Request $request)
{
    // 1. Validation basique pour éviter les erreurs de parsing date
    $request->validate([
        'start_date' => 'required|date',
        'end_date'   => 'required|date|after_or_equal:start_date',
    ]);

    $user = Auth::user();
    $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
    $endDate   = Carbon::parse($request->input('end_date'))->endOfDay();
    
    // Nettoyage du format (enlève le "=" traînant si présent : "pdf=" -> "pdf")
    $formatRaw = $request->input('format');
    $format = str_replace('=', '', $formatRaw); // Sécurité
    
    $fileName = 'historique_productions_' . now()->format('d-m-Y_H-i');

    // 2. Construction de la requête (Query Builder)
    $query = ProductionHistory::query()
        // Chargement optimisé (Eager Loading) incluant 'vehicle' pour la production mobile
        ->with(['agency', 'article', 'citerne', 'vehicle', 'user'])
        // Sécurité : On s'assure de rester dans le périmètre de l'entreprise
        ->whereHas('agency', fn($q) => $q->where('entreprise_id', $user->entreprise_id));

    // 3. Application conditionnelle des filtres (Syntaxe propre Laravel)
    $query->when($request->input('agency_id'), fn($q, $id) => $q->where('agency_id', $id))
          ->when($request->input('article_id'), fn($q, $id) => $q->where('article_id', $id))
          ->when($request->input('citerne_id'), fn($q, $id) => $q->where('source_citerne_id', $id))
          ->whereBetween('created_at', [$startDate, $endDate]);

    // 4. Gestion des supprimés
    // Si le format contient "Deleted", on inclut les archives
    $isWithDeleted = str_contains($formatRaw, 'WithDeleted'); 
    if ($isWithDeleted) {
        $query->withTrashed();
    }

    // 5. Exportation
    if (str_contains($format, 'pdf')) {
        
        // Pour le PDF, on doit récupérer les données en mémoire (Attention aux gros volumes)
        // Limite de sécurité à 500 ou 1000 lignes pour ne pas crasher le serveur PDF
        $prodMoves = $query->limit(1000)->get(); 

        $data = [
            'prodMoves' => $prodMoves,
            'filters'   => [
                'start_date' => $startDate->format('d/m/Y'),
                'end_date'   => $endDate->format('d/m/Y'),
                // On peut ajouter les noms des filtres ici pour l'en-tête du PDF
            ],
            'isWithDeleted' => $isWithDeleted,
        ];

        $pdf = Pdf::loadView('PDF.ProductionPDFView', $data)
                  ->setPaper('a4', 'landscape'); // Format paysage souvent mieux pour les tableaux

        return $pdf->download($fileName . '.pdf');

    } elseif (str_contains($format, 'excel')) {
        
        // Pour Excel, on passe directement la requête ou les paramètres pour gérer le chunking
        // Il faudra adapter votre classe ProductionHistoryExcelExport pour accepter ces params
        return Excel::download(
            new ProductionHistoryExcelExport(
                $query // On passe la requête déjà filtrée, c'est plus puissant
            ),
            $fileName . '.xlsx'
        );
    }

    return back()->with('error', 'Format d\'exportation non reconnu.');
}
}
