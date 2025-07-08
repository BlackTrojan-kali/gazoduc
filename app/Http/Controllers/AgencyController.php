<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\City;
use App\Models\Entreprise;
use App\Models\Licence;
use App\Models\Region;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    //
    public function index(){
        $agencies = Agency::with("entreprise","licence","region","city")->orderBy("created_at","desc")->paginate(15);
        $entreprises= Entreprise::all();
        $licences = Licence::all();
        $regions = Region::all();
        $cities = City::all();
        return Inertia("Agency",["agencies"=>$agencies,"entreprises"=>$entreprises,"licences"=>$licences,
        "regions"=>$regions,"cities"=>$cities
    ]);
    }
    public function store(Request $request){
        $request->validate([
            "entreprise_id"=>"required",
            "licence_id"=>"required",
            "region_id"=>"required",
            "city_id"=>"required",
            "name"=>"string|required|unique:agencies,name",
            "address"=>"string| nullable",
        ]);
        $agency = new Agency();
        $agency->entreprise_id = $request->entreprise_id;
        $agency->licence_id = $request->licence_id;
        $agency->region_id = $request->region_id;
        $agency->city_id = $request->city_id;
        $agency->name = $request->name;
        $agency->address=$request->address;
        $agency->save();
        return back()->with("success","agence cree avec success");
    }

    public function update(Request $request,$idAg){
        $request->validate([
            "entreprise_id"=>"required",
            "licence_id"=>"required",
            "region_id"=>"required",
            "city_id"=>"required",
            "name"=>"string|required",
            "address"=>"string| nullable",
        ]);
        $agency = Agency::where("id",$idAg)->first();
        $agency->entreprise_id = $request->entreprise_id;
        $agency->licence_id = $request->licence_id;
        $agency->region_id = $request->region_id;
        $agency->city_id = $request->city_id;
        $agency->name = $request->name;
        $agency->address=$request->address;
        $agency->save();
        return back()->with("success","agence cree avec success");
    }
}
