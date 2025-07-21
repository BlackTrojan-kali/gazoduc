<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Citerne;
use App\Models\Entreprise;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MagasinController extends Controller
{
    //
    public function index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type",Auth::user()->role->name)
        ->with("article")
        ->get();  
         $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","!=","matiere_premiere")->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
        
        return Inertia("Magasin/MagIndex",compact("stocks","articles","agencies"));
    }

    //
    public function citerne_index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type","citerne gaz")
        ->with("article","citerne")
        ->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();
        $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","matiere_premiere")->get();
        $citernesMobiles = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->where("type","mobile")->with("entreprise","agency","article")->get();
         $citernesFixes = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->where("type","fixed")->with("entreprise","agency","article")->get();
        
        return Inertia("Magasin/MagCiterne",compact("stocks","agencies","articles","citernesMobiles","citernesFixes"));
    }
}
