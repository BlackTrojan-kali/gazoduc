<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\ArticleCategoryPrice;
use App\Models\Citerne;
use App\Models\Client;
use App\Models\FuelSale;
use App\Models\Stock;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FuelController extends Controller
{
    //
    public function store(Request $request)
    {
        // 1. Validation des données
         $request->validate([
            'citerne_id' => ['required', 'exists:stocks,id'],
            'agency_id' => ['required', 'exists:agencies,id'],
            'article_id' => ['required', 'exists:articles,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', 'string', 'in:NA,A'],
        ]);
        $stock = Stock::where("id",$request->citerne_id)->first();
        $client = Client::findOrFail($request->client_id);
        $price  = ArticleCategoryPrice::where("article_id",$request->article_id)->where("agency_id",$request->agency_id)->where("client_category_id",$client->client_category_id)->first();
        if(!$price){
            return back()->with("error","prix article inexistant");
        }
        
        // 5. Enregistrement et Décrémentation du stock (Transaction)
        // Utiliser une transaction pour garantir que la vente et la décrémentation sont atomiques
        try {
            DB::beginTransaction();
              // Création de la vente
                FuelSale::create([
                    'citerne_id' => $stock->citerne_id,
                    'agency_id' => $request->agency_id,
                    'article_id' => $request->article_id,
                    'user_id' => Auth::user()->id,
                    'client_id' => $request->client_id,
                    'quantity' => $request->quantity,
                    'unitPrice' => $price->price, // Enregistrement du prix pour l'historique
                    'sub_total' => $price->price *floatval($request->quantity),
                    'total_price' => $price->price * $request->quantity,
                    'status' => $request->status,
                ]);
                $stock->theorical_quantity -= $request->quantity;
                $stock->quantity = $stock->theorical_quantity;
                $stock->save();
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            // Loguer l'erreur ou la gérer
            // dd($e); 
            return back()->withErrors(['error' => 'Erreur lors de l\'enregistrement de la vente ou de la décrémentation du stock.'.$e->getMessage()]);
        }

        return redirect()->back()->with('success', 'Vente de carburant enregistrée avec succès et stock mis à jour.');
    }
    public function history(Request $request){
        $fuelSales = FuelSale::with("article","user","agency","citerne")->paginate(15);
   
        $articles = Article::where("type","produit_petrolier")->get();
        $agencies = Agency::all();
        if(Auth::user()->role->name !== "direction"){
            $agencies= Agency::where("id",Auth::user()->agency_id)->get();
            $fuelSales = FuelSale::where("agency_id",Auth::user()->agency_id)->with("article","user","agency","citerne")->paginate(15);
        
        }
        
        return Inertia("Fuel/FuelSaleHistory",compact("fuelSales","articles","agencies"));
    }
    // app/Http/Controllers/FuelSaleController.php (Exemple)



public function exportPdf(Request $request)
{
    // 1. Validation des données de base (dates requises pour l'exportation)
    $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'agency_id' => 'nullable|exists:agencies,id',
        'article_id' => 'nullable|exists:articles,id',
    ]);

    // 2. Préparation des dates pour la requête
    $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
    $endDate = Carbon::parse($request->input('end_date'))->endOfDay();

    // 3. Récupération et filtrage des données
    $sales = FuelSale::with(['agency', 'article', 'client', 'user'])
        ->whereBetween('created_at', [$startDate, $endDate])
        ->when($request->filled('agency_id'), function ($query) use ($request) {
            $query->where('agency_id', $request->input('agency_id'));
        })
        ->when($request->filled('article_id'), function ($query) use ($request) {
            $query->where('article_id', $request->input('article_id'));
        })
        ->orderBy('created_at', 'asc')
        ->get();

    // 4. Définition du titre du rapport
    $reportTitle = 'Rapport de Ventes de Carburant';
    $period = "Du " . $startDate->format('d/m/Y') . " au " . $endDate->format('d/m/Y');

    // 5. Création du PDF
    $pdf = Pdf::loadView('PDF.fuel_sales_pdf', [
        'sales' => $sales,
        'reportTitle' => $reportTitle,
        'period' => $period,
        // Optionnel : Passer les noms pour afficher les filtres appliqués sur le PDF
        'filters' => [
            'agency_name' => $request->agency_id ? optional($sales->first())->agency->name : 'Tous',
            'article_name' => $request->article_id ? optional($sales->first())->article->name : 'Tous',
        ]
    ]);

    // 6. Téléchargement du fichier
    $fileName = 'ventes_carburant_' . $startDate->format('Ymd') . '_' . $endDate->format('Ymd') . '.pdf';
    
    // Le 'download' enverra le fichier directement au navigateur
    return $pdf->download($fileName);
}
}
