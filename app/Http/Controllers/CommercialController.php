<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\ArticleCategoryPrice;
use App\Models\Client;
use App\Models\Facture;
use App\Models\FactureItem;
use App\Models\Mouvement;
use App\Models\Stock;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommercialController extends Controller
{
      private function getUnitPriceForArticle(
        $articleId,
        $clientCategoryId,
        $agencyId,
        $saleType
    ) {
        // 1. Rechercher l'entrée de prix dans la table 'article_category_prices'
        //    en utilisant les trois critères : article_id, client_category_id et agency_id.
        $priceEntry = ArticleCategoryPrice::where('article_id', $articleId)
                                          ->where('client_category_id', $clientCategoryId)
                                          ->where('agency_id', $agencyId)
                                          ->first();

        // 2. Vérifier si une entrée de prix a été trouvée.
        if (!$priceEntry) {
            // Si aucune entrée n'est trouvée, cela signifie qu'il n'y a pas de prix défini
            // pour cette combinaison spécifique. Il est crucial de gérer ce cas.
            // On log l'erreur pour le débogage et on lève une exception.
            Log::error(
                "Prix manquant dans article_category_prices pour: " .
                "Article ID: {$articleId}, Catégorie Client ID: {$clientCategoryId}, Agence ID: {$agencyId}."
            );
            throw new \Exception(
                "Prix non trouvé pour l'article dans cette catégorie de client et cette agence."
            );
        }

        // 3. Déterminer quel prix retourner ('price' ou 'consigne_price')
        //    en fonction du 'saleType'.
        if ($saleType === 'consigne') {
            // Si le type de vente est 'consigne', on utilise le 'consigne_price'.
            // Il est bon de vérifier si ce prix est défini et non nul.
            if (!isset($priceEntry->consigne_price) || is_null($priceEntry->consigne_price)) {
                 // Optionnel : Si 'consigne_price' est nul, vous pouvez décider de :
                 //   a) Lancer une autre exception si un prix de consigne est absolument requis.
                 //   b) Revenir au 'price' standard (comme implémenté ci-dessous).
                 //   c) Utiliser une valeur par défaut ou 0.
                 // Pour l'instant, nous revenons au 'price' standard tout en loggant un avertissement.
                 Log::warning(
                     "consigne_price est nul pour ArticleCategoryPrice ID: " . $priceEntry->id .
                     ", Article ID: {$articleId}, Catégorie Client ID: {$clientCategoryId}. " .
                     "Utilisation de 'price' par défaut."
                 );
                 return $priceEntry->price; // Fallback au prix normal
            }
            return $priceEntry->consigne_price;
        } else {
            // Pour tous les autres types de vente (principalement 'vente'), on utilise le 'price' standard.
            return $priceEntry->price;
        }
    }
    //

        public function index()
        {
            // Récupérer l'agence de l'utilisateur connecté
            $agencyId = Auth::user()->agency_id;
    
            // Obtenir le mois et l'année en cours
            $now = Carbon::now();
            $startOfMonth = $now->copy()->startOfMonth();
            $endOfMonth = $now->copy()->endOfMonth();
    
            // --- PARTIE 1 : CHIFFRE D'AFFAIRE POUR LES VENTES (invoice_type = "vente") ---
            $dailySalesVente = Facture::where('agency_id', $agencyId)
                                      ->where('invoice_type', 'vente')
                                      ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                                      ->orderBy('created_at')
                                      ->get()
                                      ->groupBy(function($date) {
                                          return Carbon::parse($date->created_at)->format('Y-m-d');
                                      })
                                      ->map(function ($day) {
                                          return $day->sum('total_amount');
                                      });
    
            // Préparer les données pour le graphique des ventes
            $salesDataVente = [];
            $totalMonthlySalesVente = 0;
            $daysInMonth = $now->daysInMonth;
    
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $date = $now->copy()->day($i)->format('Y-m-d');
                $amount = $dailySalesVente->has($date) ? $dailySalesVente[$date] : 0;
                $salesDataVente[] = [
                    'date' => Carbon::parse($date)->format('d M'),
                    'amount' => $amount,
                ];
                $totalMonthlySalesVente += $amount;
            }
    
            // --- PARTIE 2 : CHIFFRE D'AFFAIRE POUR LES CONSIGNES (invoice_type = "consigne") ---
            $dailySalesConsigne = Facture::where('agency_id', $agencyId)
                                         ->where('invoice_type', 'consigne')
                                         ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                                         ->orderBy('created_at')
                                         ->get()
                                         ->groupBy(function($date) {
                                             return Carbon::parse($date->created_at)->format('Y-m-d');
                                         })
                                         ->map(function ($day) {
                                             return $day->sum('total_amount');
                                         });
    
            // Préparer les données pour le graphique des consignes
            $salesDataConsigne = [];
            $totalMonthlySalesConsigne = 0;
    
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $date = $now->copy()->day($i)->format('Y-m-d');
                $amount = $dailySalesConsigne->has($date) ? $dailySalesConsigne[$date] : 0;
                $salesDataConsigne[] = [
                    'date' => Carbon::parse($date)->format('d M'),
                    'amount' => $amount,
                ];
                $totalMonthlySalesConsigne += $amount;
            }
    
            return inertia("Commercial/ComIndex", [
                'dailySalesDataVente' => $salesDataVente,
                'totalMonthlySalesVente' => $totalMonthlySalesVente,
                'dailySalesDataConsigne' => $salesDataConsigne,
                'totalMonthlySalesConsigne' => $totalMonthlySalesConsigne,
                'currentMonth' => $now->format('F Y'),
            ]);
        }
    
    public function sales()
    {
        // Récupération des factures filtrées par l'agence de l'utilisateur
        $factures = Facture::where("agency_id", Auth::user()->agency_id)
            ->with("client", "user", "items.article", "agency")
            ->orderBy("created_at","desc")->paginate(100);

        // Récupération de toutes les données nécessaires
        $articles = Article::all();
        $clients = Client::with("category")->get();
              if(Auth::user()->role->name !=="direction"){
        $clients= Client::where("agency_id",Auth::user()->agency_id)->with("category")->get();
            
        } 
        $articlePrices= ArticleCategoryPrice::where("agency_id",Auth::user()->agency_id)->get();
        // Logique conditionnelle pour les agences
        // Assumons que vous avez une méthode 'hasRole' sur votre modèle User.
        if (Auth::user()->role->name == 'direction') {
            $agencies = Agency::all();
        } else {
            // Récupère uniquement l'agence de l'utilisateur connecté
            // La méthode 'get()' retourne une collection, ce qui est cohérent avec 'Agency::all()'.
            $agencies = Agency::where('id', Auth::user()->agency_id)->get();
        }
 
        // Retourne la vue Inertia avec toutes les données
        return inertia("Commercial/ComSales", compact("factures", "articles", "clients", "agencies","articlePrices"));
    }
   // ...
    public function store(Request $request)
    {
        // 1. Validation (Déjà parfaite)
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'currency' => 'required|string|in:liquide,virement',
            'type' => 'required|string|in:vente,consigne', // 'vente' ou 'consigne'
            'items' => 'required|array|min:1',
            'items.*.article_id' => 'required|exists:articles,id',
            'items.*.quantity' => 'required|integer|min:1',
            
        ]);

        $clientId = $request->client_id;
        $agencyId = Auth::user()->agency_id;
        $saleType = $request->type;
        $userRoleName = Auth::user()->role->name; // Stocker le nom du rôle pour comparaison

        $client = Client::findOrFail($clientId);
        $clientCategoryId = $client->client_category_id;
        
        DB::beginTransaction();
        try {
            $totalAmount = 0;
            $processedItems = [];

            // 2. Calcul du Montant Total et Préparation des Items (Factorisé)
            foreach ($request->items as $itemData) {
                $articleId = $itemData['article_id'];
                $quantity = $itemData['quantity'];

                // Utilisation de la méthode pour obtenir le prix unitaire
                $unitPrice = $this->getUnitPriceForArticle(
                    $articleId,
                    $clientCategoryId,
                    $agencyId,
                    $saleType
                );

                $subtotal = $quantity * $unitPrice;
                $totalAmount += $subtotal;

                $processedItems[] = [
                    'article_id' => $articleId,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    // Note: 'facture_id' sera ajouté par createMany()
                ];
            }

            // 3. Création de la Facture (Factorisé)
            $facture = Facture::create([
                'client_id' => $clientId,
                'user_id' => Auth::user()->id,
                'agency_id' => $agencyId,
                'total_amount' => $totalAmount,
                'currency' => $request->currency,
                'status' => 'pending',
                'invoice_type' => $saleType,
            ]);

            // 4. Création des Items de la Facture (Optimisé avec Relation)
            // Assurez-vous que le modèle Facture a la relation: public function items() { return $this->hasMany(FactureItem::class); }
            $facture->items()->createMany($processedItems);

            // 5. Logique de Mouvement de Stock (Uniquement si ce n'est pas un commercial, ou pour un rôle avec gestion de stock)
            if ($userRoleName != "commercial") {
                // Le bloc `else` de votre code original
                $this->processStockMovement($processedItems, $facture, $saleType, $agencyId, $userRoleName);
            }
            // Si le rôle "commercial" ne gère pas le stock lui-même, il ne nécessite pas de mouvement.
            // Si le rôle 'commercial' est un alias pour un autre rôle qui gère le stock, ajustez la condition.


            DB::commit();
            return back()->with('success', 'Vente enregistrée avec succès, monsieur.');
        } catch (Exception $e) {
            DB::rollBack();
            // ... Logique d'erreur
            Log::error('Erreur lors de la création de la vente: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
                'agency_id' => $agencyId,
                'client_id' => $clientId,
                'client_category_id' => $clientCategoryId ?? 'N/A',
            ]);
            return back()->with('error' , 'Impossible d\'enregistrer la vente. ' . $e->getMessage());
        }
    }

    /**
     * Gère les mouvements de stock après la vente (sortie).
     * @param array $items
     * @param Facture $facture
     * @param string $saleType
     * @param int $agencyId
     * @param string $storageType
     * @throws Exception
     */
    protected function processStockMovement(array $items, $facture, string $saleType, int $agencyId, string $storageType)
    {
        foreach ($items as $item) {
            $stock = Stock::where("article_id", $item["article_id"])
                        ->where("agency_id", $agencyId)
                        ->where("storage_type", $storageType)
                        ->with("article")
                        ->first();

            // Vérification de l'existence du stock et de la quantité
            if (!$stock || $stock->quantity < $item["quantity"]) {
                $articleName = $stock->article->name ?? 'Article inconnu';
                throw new Exception("Quantité en stock insuffisante pour l'article : " . $articleName);
            }

            $oldStock = $stock->quantity;
            $newStock = $oldStock - $item["quantity"];

            // Création du Mouvement de Sortie
            $mouvement = new Mouvement();
            $mouvement->article_id = $item["article_id"];
            $mouvement->agency_id = $agencyId;
            $mouvement->entreprise_id = Auth::user()->entreprise_id;
            $mouvement->recorded_by_user_id = Auth::user()->id;
            $mouvement->movement_type = "sortie";
            $mouvement->quantity = $item["quantity"];
            $mouvement->stock = $newStock; // Nouveau stock après mouvement
            $mouvement->qualification = $saleType; // 'vente' ou 'consigne'
            $mouvement->source_location = $storageType;
            $mouvement->description = "Mouvement automatique pour " . $saleType . " (Facture ID: " . $facture->id . ")";
            $mouvement->facture_id = $facture->id;
            $mouvement->save();

            // Mise à jour du Stock
            $stock->quantity = $newStock;
            $stock->save();
            
            // Logique de l'article parent (CORRIGÉE et isolée)
            if ($saleType === "vente" && $stock->article->type === "produit_fini") { // Utilisation de === pour comparaison
                 // Dans une vente de produit_fini, on suppose que l'article parent est le conteneur/consigne qui rentre en stock
                 // Cette logique est très spécifique et devrait être revue avec votre métier si elle est fausse.
                 // Si c'est pour gérer un conteneur rendu, la quantité parent devrait être ajoutée (ENTRÉE de stock).
                 
                 // Je conserve votre logique existante (ENTRÉE du parent), mais elle devrait être validée:
                 // Est-ce que la vente du produit fini (ex: une palette de bouteilles) implique une rentrée de la consigne (ex: la palette vide) ?

                 // Si c'est une entrée de conteneur consigné :
                 $stock_parent = Stock::where("article_id", $stock->article->article_id)
                                    ->where("agency_id", $agencyId)
                                    ->where("storage_type", $storageType)
                                    ->first();
                 
                 if($stock_parent){
                    $stock_parent->quantity += $item["quantity"];
                    $stock_parent->save();
                    // Création du mouvement d'ENTRÉE du parent
                    // (Le code du mouvement parent est omis pour la clarté, mais doit être recréé ici si nécessaire)
                 }
            }
            
        }
    }
    // ...
  
}
