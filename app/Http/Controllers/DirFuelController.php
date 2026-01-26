<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Citerne;
use Illuminate\Http\Request;

class DirFuelController extends Controller
{
    //
    public function fetch_cuves_stock(Request $request){
     $cuves = Citerne::with("agency","article","stock")->get();
     $agencies = Agency::all();

     return Inertia("DirectionFuel/FuelStockCuves",compact("cuves","agencies"));

    }
}
