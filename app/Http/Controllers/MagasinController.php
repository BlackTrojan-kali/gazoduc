<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\ArticleCategoryPrice;
use App\Models\Citerne;
use App\Models\Entreprise;
use App\Models\Stock;
use App\Models\Vehicule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Client;
use App\Models\Pompe;

class MagasinController extends Controller
{
    // Original index function (Mise à jour pour la CSPH)
    public function index(){
        
        // 1. CHANGEMENT MINEUR : Ajout de 'agency.city' dans le with()
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type",Auth::user()->role->name)
        ->with(['article', 'agency.city']) 
        ->get();  

        // 2. NOUVEAU : Calcul de la subvention CSPH à la volée
        $stocks->map(function ($stock) {
            // On vérifie si la ville a un coût de transport (sinon 0)
            $costPerTonne = $stock->agency->city->transport_cost_per_tonne ?? 0;
            
            // On récupère le poids de l'article
            $weightInKg = (float) $stock->article->weight_per_unit;

            // Formule : (Quantité * Poids en Kg / 1000) * Coût par Tonne
            if ($weightInKg > 0 && $costPerTonne > 0 && $stock->quantity > 0) {
                $totalTonnes = ($stock->quantity * $weightInKg) / 1000;
                $stock->expected_csph_refund = round($totalTonnes * $costPerTonne);
            } else {
                $stock->expected_csph_refund = 0;
            }

            return $stock;
        });

        // La suite de votre logique reste INTACTE
        $articlePrices = ArticleCategoryPrice::where("agency_id",Auth::user()->agency_id)->get();
        $clients = Client::all();
         
        if(Auth::user()->role->name !=="direction"){
            $clients= Client::where("agency_id",Auth::user()->agency_id)->with("category")->get();
        } 
        
        $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)
            ->where("type","!=","matiere_premiere")
            ->where("type","!=","produit_petrolier")
            ->get();
            
        $agencies = Agency::where("id",Auth::user()->agency_id)
            ->where("entreprise_id",Auth::user()->entreprise_id)
            ->get();
        
        return Inertia("Magasin/MagIndex",compact("stocks","articles","agencies","clients","articlePrices"));
    }

    // Original citerne_index function (Intacte)
    public function citerne_index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type","gaz")->orWhere("storage_type","liquide")
        ->with("article","citerne")
        ->get();
        
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();
        $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","matiere_premiere")->get();
        $citernesMobiles = Vehicule::where("archived",0)->where("type","Camion-citerne")->get();
        $citernesFixes = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->where("type","fixed")->with("entreprise","agency","article")->get();
       
        return Inertia("Magasin/MagCiterne",compact("stocks","agencies","articles","citernesMobiles","citernesFixes"));
    }
    
    public function licence(){
        return Inertia("SelectLicence");
    }

    // New index function for fuel logic (Intacte)
    public function fuel_index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type",Auth::user()->role->name)
        ->with("article")
        ->get();  
        
        $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","!=","matiere_premiere")->where("type","!=","produit_petrolier")->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
        $clients = Client::all();
        
        if(Auth::user()->role->name !=="direction"){
            $clients= Client::where("agency_id",Auth::user()->agency_id)->with("category")->get();
        } 
        
        return Inertia("Fuel/MagFuelIndex",compact("stocks","articles","agencies", "clients"));
    }

  // New citerne_index function for fuel logic (Intacte)
    public function fuel_citerne_index()
    {
        $user = Auth::user();
        $agencyId = $user->agency_id;
        $entrepriseId = $user->entreprise_id;

        $stocks = Stock::where("agency_id", $agencyId)
            ->where("storage_type", "carburant")
            ->with("article", "citerne")
            ->get();
            
        $agencies = Agency::where("id", $agencyId)
            ->where("entreprise_id", $entrepriseId)
            ->get();

        $articles = Article::where("entreprise_id", $entrepriseId)
            ->where("type", "produit_petrolier")
            ->get();

        $citernesMobiles = Vehicule::where("archived", 0)
            ->where("type", "Camion-citerne")
            ->get();

        $cuvesFixes = Citerne::where("entreprise_id", $entrepriseId)
            ->where("agency_id", $agencyId)
            ->where("type", "carburant")
            ->with("entreprise", "agency", "article")
            ->get();

        // 🚨 CHANGEMENT MAJEUR ICI : 
        // On ne charge plus "cuves", on charge "pistolets", la "citerne" du pistolet, et "l'article" de la citerne.
        $pompes = Pompe::where("agency_id", $agencyId)
            ->with(['pistolets.citerne.article'])
            ->get();

        // Gestion des clients selon le rôle
        if ($user->role->name !== "direction") {
            $clients = Client::where("agency_id", $agencyId)->with("category")->get();
        } else {
            $clients = Client::all();
        }

        return Inertia("Fuel/MagFuelCiterne", compact(
            "clients", 
            "stocks", 
            "agencies", 
            "articles", 
            "citernesMobiles", 
            "pompes", 
            "cuvesFixes"
        ));
    }
}