<?php

namespace App\Http\Controllers;

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
        return Inertia("Magasin/MagIndex",compact("stocks"));
    }

    //
    public function citerne_index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type","citerne gaz")
        ->with("article","citerne")
        ->get();
        return Inertia("Magasin/MagCiterne",compact("stocks"));
    }
}
