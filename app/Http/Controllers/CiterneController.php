<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Citerne;
use App\Models\Entreprise;
use App\Models\Stock;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CiterneController extends Controller
{
    //
    public function index(){
        $citernes = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise","agency","article")->paginate(15);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();
        $products = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","matiere_premiere")->get();
        return Inertia("Direction/Citerne",compact("citernes","agencies","entreprises","products"));
        }

    public function store(Request $request){

        $request->validate([
            "name"=>"required|string|unique:citernes,name",
            "type"=>"string|required",
            "product_type"=>"string|required",
           "capacity_liter"=>"numeric|nullable",
            "capacity_kg"=>"numeric|nullable",
            "current_product_id"=>"required",
            "agency_id"=>"required",
        ]);
        $article = Article::where("id",$request->current_product_id)->first();
        if(!$article){
            return back()->with("error","this article was not found");
        }else{
            try{
            Db::beginTransaction();
            $citerne = new Citerne();
            $citerne->name = $request->name;
            $citerne->type = $request->type;
            $citerne->product_type = $request->product_type;
            $citerne->capacity_liter= $request->capacity_liter;
            $citerne->capacity_kg = $request->capacity_kg;
            $citerne->current_product_id = $request->current_product_id;
            $citerne->agency_id = $request->agency_id;
            $citerne->entreprise_id =Auth::user()->entreprise_id;
            $citerne->save();
            Stock::create([
                "article_id"=> $article->id,
                "agency_id"=>$request->agency_id,
                "storage_type"=>"citerne ".$request->product_type,
                "quantity"=>0,
                "citerne_id"=>$citerne->id,
                "entreprise_id"=>Auth::user()->entreprise_id,
            ]);
            Db::commit();
            return back()->with("success","citerne and stock created successfully");
        }catch(Exception $e){
            Db::rollBack();
            dd($e);
            return back()->with("error","can't create the stock contact the maintenance team");
        }
        }
        
    }

    public function update(Request $request,$idCit){

        $request->validate([
            "name"=>"required|string",
            "type"=>"string|required",
            "product_type"=>"string|required",
           "capacity_liter"=>"numeric|nullable",
            "capacity_kg"=>"numeric|nullable",
            "current_product_id"=>"required",
            "agency_id"=>"required",
        ]);
        $article = Article::where("id",$request->current_product_id)->first();
        if(!$article){
            return back()->with("error","this article was not found");
        }else{
            try{
            Db::beginTransaction();
            $citerne =Citerne::where("id",$idCit)->first();
            $citerne->name = $request->name;
            $citerne->type = $request->type;
            $citerne->product_type = $request->product_type;
            $citerne->capacity_liter= $request->capacity_liter;
            $citerne->capacity_kg = $request->capacity_kg;
            $citerne->current_product_id = $request->current_product_id;
            $citerne->agency_id = $request->agency_id;
            $citerne->entreprise_id =Auth::user()->entreprise_id;
            $citerne->save();
        
            Db::commit();
            return back()->with("success","citerne and stock created successfully");
        }catch(Exception $e){
            Db::rollBack();
            dd($e);
            return back()->with("error","can't create the stock contact the maintenance team");
        }
        }
        
    }
}
