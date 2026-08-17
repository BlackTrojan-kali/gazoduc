<?php

namespace App\Http\Controllers;

use App\Models\Chauffeur;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    //
    public function index(){
        $drivers = Chauffeur::paginate(15);
        return inertia("Transferts/Drivers",compact("drivers"));
    }
    public function store(Request $request){
        $request->validate([
            "name" =>"string|required|unique:chauffeurs,name",
            "licence_number"=>"string| required",
            "licence_expiry"=>"date|required",
            "phone_number"=>"numeric|nullable",
            "address"=>"string|nullable"
        ]);
        $driver = new Chauffeur();
        $driver->name = $request->name;
        $driver->licence_number = $request->licence_number;
        $driver->licence_expiry = $request->licence_expiry;
        $driver->phone_number = $request->phone_number;
        $driver->address = $request->address;
        $driver->save();
        return back()->with("success","driver created successfully");
    }
    public function update(Request $request,$Cid){
        $request->validate([
            "name" =>"string|required",
            "licence_number"=>"string| required",
            "licence_expiry"=>"date|required",
            "phone_number"=>"numeric|nullable",
            "address"=>"string|nullable"
        ]);
        $driver = Chauffeur::findOrFail($Cid);
        $driver->name = $request->name;
        $driver->licence_number = $request->licence_number;
        $driver->licence_expiry = $request->licence_expiry;
        $driver->phone_number = $request->phone_number;
        $driver->address = $request->address;
        $driver->save();
        return back()->with("info","driver updated successfully");
    }
    public function archive($Cid){
        $driver = Chauffeur::findOrFail($Cid);
        $driver->archived = !$driver->archived;
        $driver->save();

        return back()->with("warning","driver archived successfully");
    }
}
