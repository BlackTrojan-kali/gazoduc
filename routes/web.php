<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia('Home');
});
//auth routes
Route::get('/login',[AuthController::class,"loginPage"] )->name("login");
