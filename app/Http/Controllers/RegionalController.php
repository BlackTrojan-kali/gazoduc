<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
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
    public function sales(){
        
    }
}
