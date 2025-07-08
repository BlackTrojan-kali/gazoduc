<?php

namespace App\Http\Controllers;

use App\Models\Licence;
use Illuminate\Http\Request;

class licenceController extends Controller
{
    //
    public function index(){
        $licences = Licence::orderBy('created_at', 'desc')->paginate(15);
        return Inertia("Licence",["licences"=>$licences]);
    }
    public function store(Request $request){
        $request->validate([
            "name"=>"string|required",
            "type"=>"string | required",
            "description"=>"string| nullable",
        ]);

            $licence = new Licence();
            $licence->name = $request->name;
            $licence->type = $request->type;
            $licence->description = $request->description;
            $licence->save();
            return back()->with("success","licence created successfully");
    }
    public function edit(Request $request,$idLic){
        $request->validate([
            "name"=>"string|required",
            "type"=>"string | required",
            "description"=>"string| nullable",
        ]);

            $licence = Licence::where("id",$idLic)->first();
            $licence->name = $request->name;
            $licence->type = $request->type;
            $licence->description = $request->description;
            $licence->save();
            return back()->with("success","licence created successfully");
    }
}
