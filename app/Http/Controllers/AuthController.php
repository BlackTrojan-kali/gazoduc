<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    //
    public function loginPage(){
        return Inertia("auth/loginPage");
    }
    public function login(Request $request){
        $request->validate([
            "email"=>"email|required",
            "password"=>"string|min:4|required",
        ]);
        $credentials = ["email"=>$request->email,"password"=>$request->password];
        if(!Auth::attempt($credentials)){
            return back()->with("error","invalid credentials");
        }
        if(Auth::user()->archiver == 1){
            return back()->with("error","you are banned from the systeme");
            
        }
        //redirection en fonction du role
        switch(Auth::user()->role->name){
            case "super_administrateur":
           
        return redirect()->route("dashboard")->with("success","authentification reussie");
        break;
            case "direction":
           
           if (Auth::user()->entreprise->subscription->licence->name == "gaz et petrol"){
                 return redirect()->route("director.licence")->with("success","authentification reussie");
           }else{
           return redirect()->route("director.index")->with("success","authentification reussie");
           }
          case "magasin":
            if(Auth::user()->boutique_id){
               return redirect()->route("magasin.boutique.index")->with("info","veillez choisir une licence");
         
            }else{
           if (Auth::user()->entreprise->subscription->licence->name == "gaz et petrol"){
            return redirect()->route("magasin.licence")->with("info","veillez choisir une licence");
           }else{
           return redirect()->route("magasin.index")->with("success","authentification reussie");
           }}
           break;
         case "production":
                  
        return redirect()->route("prod.index")->with("success","authentification reussie");
        break;
         case "controleur":
                  
        return redirect()->route("controlleur.index")->with("success","authentification reussie");
        break;
         case "commercial":
                  
        return redirect()->route("compage.index")->with("success","authentification reussie");
        break;
         case "pdg":
            
               
           if (Auth::user()->entreprise->subscription->licence->name == "gaz et petrol"){
                 return redirect()->route("pdg.choose")->with("success","authentification reussie");
           }else{
           return redirect()->route("pdg.index")->with("success","authentification reussie");
           }
            break;
        default:
        return back()->with("error","role invalide");
    }
    }
    public function logout(){
        
        Auth::logout();
        return redirect()->route("login")->with("warning","vous vous etes deconnecte");
    }
}
