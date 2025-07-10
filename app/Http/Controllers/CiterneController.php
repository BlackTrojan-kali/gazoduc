<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Citerne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CiterneController extends Controller
{
    //
    public function index(){
        $citernes = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->paginate(15);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->get();
        return Inertia("Direction/Citerne",compact("citernes","agencies"));
        }
}
