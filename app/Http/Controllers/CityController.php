<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Region;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CityController extends Controller
{
    public function index()
    {
        $regions = Region::all();
        $cities = City::with("region")->orderBy('created_at', 'desc')->paginate(20);
        return Inertia("city", ["cities" => $cities, "regions" => $regions]);
    }

    public function store(Request $request)
    {
        $request->validate([
            "name" => "string|required",
            "region_id" => "required|integer",
            "transport_cost_per_tonne" => "nullable|numeric" // NOUVEAU CHAMP
        ]);

        $city = new City();
        $city->name = $request->name;
        $city->region_id = $request->region_id;
        // On enregistre le coût, 0 par défaut s'il est vide
        $city->transport_cost_per_tonne = $request->transport_cost_per_tonne ?? 0; 
        $city->save();

        return back()->with("success", "Ville créée avec succès");
    }

    public function edit(Request $request, $idcity)
    {
        $request->validate([
            "name" => "string|required",
            "region_id" => "required|integer",
            "transport_cost_per_tonne" => "nullable|numeric" // NOUVEAU CHAMP
        ]);

        $city = City::where("id", $idcity)->firstOrFail();
        $city->name = $request->name;
        $city->region_id = $request->region_id;
        // Mise à jour du coût
        $city->transport_cost_per_tonne = $request->transport_cost_per_tonne ?? 0; 
        $city->save();

        return back()->with("success", "Ville modifiée avec succès");
    }
}