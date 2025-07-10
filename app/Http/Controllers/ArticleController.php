<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ArticleController extends Controller
{
    //

    public function index(){
        $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->orderBy("created_at","desc")->paginate(15);
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();
        return Inertia("Direction/Articles",compact("articles","entreprises"));
    }
    public function store(Request $request){
        $request->validate([
            "code"=>"string| required|unique:articles,code",
            "name"=>"string| min:2|required",
            "type"=>"string|required",
            "unit"=>"string|required",
            "entreprise_id"=>"required",
            "weight_per_unit"=>"nullable|numeric",
        ]);
        $article = new Article();
        $article->code = $request->code;
        $article->name = $request->name;
        $article->type = $request->type;
        $article->unit = $request->unit;
        $article->entreprise_id = $request->entreprise_id;
        $article->weight_per_unit = $request->weight_per_unit;
        $article->save();
        return back()->with("success","article created successfully");
    }
    
    public function update(Request $request,$idAr){
        $request->validate([
            "code"=>"string| required",
            "name"=>"string| min:2|required",
            "type"=>"string|required",
            "unit"=>"string|required",
            "entreprise_id"=>"required",
            "weight_per_unit"=>"nullable|numeric",
        ]);
        $article = Article::where("id",$idAr)->first();
        $article->code = $request->code;
        $article->name = $request->name;
        $article->type = $request->type;
        $article->unit = $request->unit;
        $article->entreprise_id = $request->entreprise_id;
        $article->weight_per_unit = $request->weight_per_unit;
        $article->save();
        return back()->with("info","article created successfully");
    }
    public function delete($idAr){
        $article = Article::where("id",$idAr)->first();
        $article->delete();
        return back()->with("warning","article deleted succesfully");
    }
}
