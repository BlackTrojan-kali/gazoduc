<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\City;
use App\Models\Region;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DirBoutiqueController extends Controller
{
    //
    public function index(){
        $cities= City::all();
        $regions= Region::all();
        $boutiques = Boutique::with("region","city")->get();
        return Inertia("DirBoutique/DirBoutiqueIndex",compact("cities","boutiques","regions"));
    }
}
