<?php

namespace App\Http\Controllers;

use App\Models\Vehicule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VehiculeController extends Controller
{
    //
    public function index(){
        $vehicles = Vehicule::paginate(15);
        return inertia("Transferts/Vehicule",compact("vehicles"));
    }
    public function store(Request $request){
        $request->validate([
            "licence_plate"=>"string|required |min:4|unique:vehicules,licence_plate",
            "type"=>"string| required",
            "capacity_liters"=>"numeric|nullable",
            "owner_type"=>"string |required",
        ]);
        $vehicle = new Vehicule();
        $vehicle->licence_plate = $request->licence_plate;
        $vehicle->type= $request->type;
        $vehicle->capacity_liters = $request->capacity_liters;
        $vehicle->owner_type = $request->owner_type;
        $vehicle->save();
        return back()->with("success","vehicule enregistre avec success");
    }
    public function update(Request $request,$Vid){
        $request->validate([
            "licence_plate"=>"string|required |min:4",
            "type"=>"string| required",
            "capacity_liters"=>"numeric|nullable",
            "owner_type"=>"string |required",
        ]);
        $vehicle = Vehicule::findOrFail($Vid);
        $vehicle->licence_plate = $request->licence_plate;
        $vehicle->type= $request->type;
        $vehicle->capacity_liters = $request->capacity_liters;
        $vehicle->owner_type = $request->owner_type;
        $vehicle->save();
        return back()->with("info","vehicule ,modifie avec success");
    }
    public function archive($Vid){
        $vehicle = Vehicule::findOrFail($Vid);
        $vehicle->archived = !$vehicle->archived;
        $vehicle->save();
        return back()->with("warning","vehicule ,archive avec success");
    }
}
