<?php

namespace App\Http\Controllers;

use App\Models\ArticleCategoryPrice;
use App\Models\Citerne;
use App\Models\Client;
use App\Models\FuelSale;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
        $fuelSales = FuelSale::where("agency_id",Auth::user()->agency_id)->get();
        dd($fuelSales);
    }
}
