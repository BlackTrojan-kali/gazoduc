<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Bank;
use App\Models\Client;
use App\Models\Facture;
use App\Models\FactureItem;
use App\Models\Payment;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RegionalController extends Controller
{
    //
    public function index(){
         $stocks = Stock::where("agency_id",Auth::user()->agency_id)->where("storage_type","!=","gaz")
        ->with("article",'agency')
        ->get();  
        return inertia("Regional/RegIndex",compact("stocks"));
    } 
    public function citerne_index(){
         $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type","gaz")->orWhere("storage_type","liquide")
        ->with("article","citerne")
        ->get();

        return inertia("Regional/RegCiterne",compact("stocks"));
    }
   public function sales()
    {
        // 1. Récupérer l'utilisateur actuellement authentifié
        $user = Auth::user();

        // 2. Définir une requête de base pour les FactureItems en chargeant les relations
        $query = FactureItem::with(['facture.agency', 'article']);

        // 3. Appliquer le filtre de l'agence si l'utilisateur n'est pas "direction"
        if ($user && $user->role->name !== 'direction') {
            // Utilise whereHas pour filtrer les items dont la facture appartient à l'agence de l'utilisateur
            $query->whereHas('facture', function ($q) use ($user) {
                $q->where('agency_id', $user->agency_id);
            });
            $agencies = Agency::all();
        }
        
        // 4. Exécuter la requête et récupérer les résultats
        $factureItems = $query->paginate(15);
        $articles = Article::all();
        $agencies = Agency::where("id",Auth::user()->agency_id)->get();
        // 5. Retourner les données en format JSON
        return inertia("Regional/RegItems",compact("factureItems","agencies","articles"));
    }
      //
    public function payments(){

        $payments = Payment::paginate(15);
        $clients = Client::all();
        $agencies = Agency::all();
        $banks = Bank::all();
        if(Auth::user()->role->name !="direction"){
            $payments = Payment::where("agency_id",Auth::user()->agency_id)->with("agency","bank","client","factures")->paginate(15);
            $agencies = Agency::where("id",Auth::user()->agency_id)->get();
            $sales = Facture::where("agency_id",Auth::user()->agency_id)->where("status","pending")->with("client")->get();
        }
        return inertia("Regional/RegPayment",compact("payments","banks","agencies","clients","sales"));
    }
        public function factures()
    {
        // Récupération des factures filtrées par l'agence de l'utilisateur
        $factures = Facture::where("agency_id", Auth::user()->agency_id)
            ->with("client", "user", "items.article", "agency")
            ->paginate(15);

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
        return inertia("Regional/RegSales", compact("factures", "articles", "clients", "agencies"));
    }
}
