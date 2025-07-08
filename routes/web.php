<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Middleware\SuperAdminMiddleWare;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EntrepriseController;
use App\Http\Controllers\licenceController;
use App\Http\Controllers\RegionController;


//auth routes
Route::get('/login',[AuthController::class,"loginPage"] )->name("login");
Route::post('/login',[AuthController::class,"login"] )->name("login");
Route::get('/logout',[AuthController::class,"logout"] )->name("logout");

//super admins routes
Route::middleware(SuperAdminMiddleWare::class)->group(function(){
    Route::get("/",[SuperAdminController::class,"dashboard"])->name("dashboard");
    Route::post("/store-company",[EntrepriseController::class,"store"])->name("createCompany");
    Route::put("/archive-company/{idCom}",[EntrepriseController::class,"artchive"])->name("company.archive");
    Route::post("/edit-company/{idCom}",[EntrepriseController::class,"edit"])->name("company.edit");
    //regions routes
    Route::get("/regions",[RegionController::class,"index"])->name("regions");
    Route::post("/store-region",[RegionController::class,"store"])->name("regions.store");
    Route::put("/edit-region/{idRegion}",[RegionController::class,"edit"])->name("regions.edit");
    //cities routes
    Route::get("/cities",[CityController::class,"index"])->name("cities");
    Route::post("/store-cities",[CityController::class,"store"])->name("cities.store");
    Route::put("/edit-cities/{idcity}",[CityController::class,"edit"])->name("cities.edit");
    //licences routes
    Route::get("/licences",[licenceController::class,"index"])->name("licences");
});