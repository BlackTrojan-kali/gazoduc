<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AuthController extends Controller
{
    //
    public function loginPage(){
        return Inertia("auth/loginPage");
    }
}
