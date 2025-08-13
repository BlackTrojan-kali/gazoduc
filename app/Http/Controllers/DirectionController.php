<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Request;

class DirectionController extends Controller
{
    //
    public function index(){
        $stocks = Stock::where("storage_type","!=","gaz")
        ->with("article",'agency')
        ->get();  
        return Inertia("Direction/DirIndex",compact("stocks"));
    }
}

