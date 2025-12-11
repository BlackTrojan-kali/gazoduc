<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Region;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CityController extends Controller
{
    //
    public function index(){
        $regions = Region::all();
        $cities = City::with("region")->orderBy('created_at', 'desc')->paginate(20);
        return Inertia("city",["cities"=>$cities,"regions"=>$regions]);
    }
    public function store(Request $request){
        $request->validate([
            "name"=>"string|required",
        ]);
        $city = new City();
        $city->name = $request->name;
        $city->region_id =$request->region_id;
        $city->save();
        return back()->with("success","city created successfully");
    }
    public function edit(Request $request,$idcity){
        $request->validate([
            "name"=>"string|required",
        ]);
        $city =City::where("id",$idcity)->first();
        $city->name = $request->name;
        $city->region_id =$request->region_id;
        $city->save();
        return back()->with("success","city created successfully");
    }
}
