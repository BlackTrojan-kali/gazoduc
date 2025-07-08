<?php

namespace App\Http\Controllers;

use App\Models\Entreprise;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    //
    public function dashboard(){
        $entreprises = Entreprise::with("agency","subscription")->get();
        return Inertia("Dashboard",["entreprises"=>$entreprises]);
    }
   
}
