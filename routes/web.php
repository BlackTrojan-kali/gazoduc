<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Middleware\SuperAdminMiddleWare;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EntrepriseController;

//auth routes
Route::get('/login',[AuthController::class,"loginPage"] )->name("login");
Route::post('/login',[AuthController::class,"login"] )->name("login");
Route::get('/logout',[AuthController::class,"logout"] )->name("logout");

//super admins routes
Route::middleware(SuperAdminMiddleWare::class)->group(function(){
    Route::get("/",[SuperAdminController::class,"dashboard"])->name("dashboard");
    Route::post("/store-company",[EntrepriseController::class,"store"])->name("createCompany");
    Route::put("/archive-company/{idCom}",[EntrepriseController::class,"artchive"])->name("company.archive");
});