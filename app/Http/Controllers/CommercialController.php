<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\ArticleCategoryPrice;
use App\Models\Client;
use App\Models\Facture;
use App\Models\FactureItem;
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
    public function index(){
          // Récupérer l'agence de l'utilisateur connecté
        $agencyId = Auth::user()->agency_id;

        // Obtenir le mois et l'année en cours
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Récupérer les factures pour l'agence et le mois en cours
        // et agréger le total_amount par jour
        $dailySales = Facture::where('agency_id', $agencyId)
                              ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                              ->orderBy('created_at')
                              ->get()
                              ->groupBy(function($date) {
                                  return Carbon::parse($date->created_at)->format('Y-m-d'); // Grouper par jour
                              })
                              ->map(function ($day) {
                                  return $day->sum('total_amount'); // Somme des montants pour chaque jour
                              });

        // Préparer les données pour le graphique :
        // Assurer que tous les jours du mois sont présents, même si aucune vente
        $daysInMonth = $now->daysInMonth;
        $salesData = [];
        $totalMonthlySales = 0; // Calculer le chiffre d'affaires total du mois

        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = $now->copy()->day($i)->format('Y-m-d');
            $amount = $dailySales->has($date) ? $dailySales[$date] : 0;
            $salesData[] = [
                'date' => Carbon::parse($date)->format('d M'), // Format pour l'affichage (ex: 01 Jan)
                'amount' => $amount,
            ];
            $totalMonthlySales += $amount; // Accumuler le total mensuel
        }

        return inertia("Commercial/ComIndex", [
            'dailySalesData' => $salesData,
            'totalMonthlySales' => $totalMonthlySales,
            'currentMonth' => $now->format('F Y'),]);
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
        return inertia("Commercial/ComSales", compact("factures", "articles", "clients", "agencies"));
    }
      public function store(Request $request)
    {
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
        $saleType = $request->type; // 'vente' ou 'consigne'

        // Étape cruciale : Récupérer la catégorie du client
        $client = Client::findOrFail($clientId);
        $clientCategoryId = $client->client_category_id; // Assurez-vous que votre modèle Client a cette colonne

        DB::beginTransaction();
        try {
            $totalAmount = 0;
            $processedItems = [];

            // Traitement de chaque article dans la vente
            foreach ($request->items as $itemData) {
                $articleId = $itemData['article_id'];
                $quantity = $itemData['quantity'];

                // Récupérer le prix unitaire approprié (normal ou consigne)
                // en utilisant la catégorie du client
                $unitPrice = $this->getUnitPriceForArticle(
                    $articleId,
                    $clientCategoryId, // Passe la catégorie du client
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
                ];
            }

            // Création de la facture
            $facture = Facture::create([
                'client_id' => $clientId,
                'user_id' => Auth::user()->id,
                'agency_id' => $agencyId,
                'total_amount' => $totalAmount,
                'currency' => $request->currency,
                'status' => 'pending', // Ou un autre statut par défaut si nécessaire
                'invoice_type' => $saleType,
            ]);

            // Création des articles de la facture manuellement (sans $fillable)
            foreach ($processedItems as $item) {
                $factureItem = new FactureItem();
                $factureItem->facture_id = $facture->id;
                $factureItem->article_id = $item['article_id'];
                $factureItem->quantity = $item['quantity'];
                $factureItem->unit_price = $item['unit_price'];
                $factureItem->subtotal = $item['subtotal'];
                // Ajoutez ici d'autres champs si nécessaire
                $factureItem->save(); // Sauvegarde l'item manuellement
            }

            DB::commit(); // Confirme la transaction
            return back()->with('success', 'Vente enregistrée avec succès, monsieur.');
        } catch (Exception $e) {
            DB::rollBack(); // Annule la transaction en cas d'erreur

            Log::error('Erreur lors de la création de la vente: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
                'agency_id' => $agencyId,
                'client_id' => $clientId,
                'client_category_id' => $clientCategoryId ?? 'N/A', // Inclure la catégorie si elle est définie
            ]);

            return back()->with('error' , 'Impossible d\'enregistrer la vente. ' . $e->getMessage());
        }
    }

  
}
