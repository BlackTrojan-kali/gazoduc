<?php

namespace App\Http\Controllers;

use App\Models\Notification;
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
        //redirection en fonction du role
        switch(Auth::user()->role->name){
            case "super_administrateur":
            Notification::create([
            "user_id"=>Auth::user()->id,
            "notification_type"=>"admin_auth",
            "message"=>"a super admin logged in",
            "is_read"=>false,
            
        ]);
        return redirect()->route("dashboard")->with("success","authentification reussie");
        break;
            case "direction":
                   Notification::create([
            "user_id"=>Auth::user()->id,
            "notification_type"=>"Director_auth",
            "message"=>"director logged in",
            "is_read"=>false,
        ]);
        return redirect()->route("director.index")->with("success","authentification reussie");
        default:
        return back()->with("error","role invalide");
    }
    }
    public function logout(){
        
        Notification::create([
            "user_id"=>Auth::user()->id,
            "notification_type"=>"admin_auth",
            "message"=>Auth::user()->first_name." logged out",
            "is_read"=>false,
        ]);
        Auth::logout();
        return redirect()->route("login")->with("warning","vous vous etes deconnecte");
    }
}
