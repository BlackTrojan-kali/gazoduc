<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    //
    public function dashboard(){
        return Inertia("Dashboard");
    }
}
