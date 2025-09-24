<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Citerne;
use App\Models\Entreprise;
use App\Models\Stock;
use App\Models\Vehicule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MagasinController extends Controller
{
    // Original index function
    public function index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type",Auth::user()->role->name)
        ->with("article")
        ->get();  
         $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","!=","matiere_premiere")->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
        
        return Inertia("Magasin/MagIndex",compact("stocks","articles","agencies"));
    }

    // Original citerne_index function
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

    // New index function for fuel logic
    public function fuel_index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type",Auth::user()->role->name)
        ->with("article")
        ->get();  
         $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","!=","matiere_premiere")->where("type","!=","produit_petrolier")->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
        $fuel = true;
        
        return Inertia("Fuel/MagFuelIndex",compact("stocks","articles","agencies", "fuel"));
    }

    // New citerne_index function for fuel logic
    public function fuel_citerne_index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->Where("storage_type","carburant")
        ->with("article","citerne")
        ->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();
        $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","produit_petrolier")->get();
        $citernesMobiles = Vehicule::where("archived",0)->where("type","Camion-citerne")->get();
         $cuvesFixes = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->where("type","carburant")->with("entreprise","agency","article")->get();
       
         $fuel = true;
        
        return Inertia("Fuel/MagFuelCiterne",compact("stocks","agencies","articles","citernesMobiles","cuvesFixes", "fuel"));
    }
}
