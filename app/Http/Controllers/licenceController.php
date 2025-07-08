<?php

namespace App\Http\Controllers;

use App\Models\Licence;
use Illuminate\Http\Request;

class licenceController extends Controller
{
    //
    public function index(){
        $licences = Licence::all();
        return Inertia("Licence",["licences"=>$licences]);
    }
}
