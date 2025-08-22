<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\ArticleCategoryPrice;
use App\Models\ClientCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PriceController extends Controller
{
    //
    public function index(){

        $prices= ArticleCategoryPrice::with("article","agency","category")->paginate(15);;
        $clientCategories =  ClientCategory::get();
        $articles = Article::where("type","!=","matiere_premiere")->get();
        $agencies = Agency::all();
        if(Auth::user()->role->name != "direction"){
        $prices= ArticleCategoryPrice::with("article","agency","category")->where("agency_id",Auth::user()->agency_id)->paginate(15);

        $clientCategories = ClientCategory::get();
        $articles = Article::where("type","!=","matiere_premiere")->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->get();
    }
        return inertia("Clients/Price",compact("prices", "clientCategories", "articles", "agencies"));
    }
   
public function store(Request $request)
{
    $request->validate([
        "article_id" => [
            "required",
            Rule::unique('article_category_prices')->where(function ($query) use ($request) {
                return $query->where('client_category_id', $request->client_category_id)
                             ->where('agency_id', $request->agency_id);
            }),
        ],
        "client_category_id" => "required",
        "agency_id" => "required",
        "price" => "required|numeric",
        "consigne_price" => "numeric",
    ]);

    $price = new ArticleCategoryPrice();
    $price->article_id =  $request->article_id;
    $price->client_category_id = $request->client_category_id;
    $price->agency_id = $request->agency_id;
    $price->price = $request->price;
    $price->consigne_price = $request->consigne_price;
    $price->save();

    return back()->with("success", "Price created successfully");
}

    public function update(Request $request,$idprice){
        $request->validate([
            "article_id"=>"required",
            "client_category_id"=>"required",
            "agency_id"=>"required",
            "price"=>"required|numeric",
            "consigne_price"=>"numeric",
        ]);

        $price = ArticleCategoryPrice::where("id",$idprice)->first();
        $price->article_id =  $request->article_id;
        $price->client_category_id = $request->client_category_id;
        $price->agency_id = $request->agency_id;
        $price->price = $request->price;
        $price->consigne_price = $request->consigne_price;
        $price->save();
        return back ()->with("success","price created successfully");
    }
    public function delete($idprice){
        $price = ArticleCategoryPrice::findOrFail($idprice);
        $price->delete();
        return back()->with("warning","prix supprimee");
    }
}
