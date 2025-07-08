<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    //
    public function index(){
        $regions = Region::with("city")->get();
        return Inertia("Region",["regions"=>$regions]);
    }
    public function store(Request $request){
        $request->validate([
            "name"=>"string| required|min:2",
        ]);
        $region = new Region();
        $region->name = $request->name;
        $region->save();
        return back()->withSuccess("region created successfully");
    }
    public function edit(Request $request,$idRegion){
        $region = Region::where("id",$idRegion)->first();
        $region->name = $request->name;
        $region->save();
        return back()->with("info","region edited successfully ");
    }
}
