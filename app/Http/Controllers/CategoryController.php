<?php

namespace App\Http\Controllers;

use App\Models\ClientCategory;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    //
    public function index(){
        $clientCategories = ClientCategory::paginate(15);
        return inertia("Clients/Category",compact("clientCategories"));
    }
    public function store(Request $request){
        $request->validate([
            "name"=>"required | string | min:3",
            "description"=>"required| string",
        ]);
        $category = new ClientCategory();
        $category->name = $request->name;
        $category->description = $request->description;
        $category->save();
        return back()->with("info","categorie creee avec success");
    }

    public function update(Request $request,$idCat){
        $request->validate([
            "name"=>"required | string | min:3",
            "description"=>"required| string",
        ]);
        $category = ClientCategory::findOrFail($idCat);
        $category->name = $request->name;
        $category->description = $request->description;
        $category->save();
        return back()->with("info","categorie creee avec success");
    }
    public function destroy($idCat){
        
        $category = ClientCategory::findOrFail($idCat);
        $category->delete();
        return back()->with("warning","categorie creee avec success");
        
    }
}
