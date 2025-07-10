<?php

use App\Http\Controllers\AgencyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Middleware\SuperAdminMiddleWare;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EntrepriseController;
use App\Http\Controllers\LicenceController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\SubController;
use App\Http\Controllers\UserController;
use App\Models\Agency;

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
    Route::get("/licences",[LicenceController::class,"index"])->name("licences");
    Route::post("/store-licence",[LicenceController::class,"store"])->name("licences.store");
    Route::put("/edit-licence/{idLic}",[LicenceController::class,"edit"])->name("licences.edit");
    //agencies routes
    Route::get("/agencies",[AgencyController::class,"index"])->name("agencies");
    Route::post("/store-agency",[AgencyController::class,"store"])->name("agencies.store");
    Route::put("/edit-agency/{idLic}",[AgencyController::class,"update"])->name("agencies.update");
    //ceos routes
    Route::get("/ceos",[UserController::class,"index_ceo"])->name("ceos");
    Route::post("/store-ceos",[UserController::class,"store_ceo"])->name("ceos.store");
    Route::put("/update-ceos/{idceo}",[UserController::class,"update_ceo"])->name("ceos.update");
   // Route::get("/archive-ceos",[UserController::class,"i_ceo"])->name("ceos");
    //direction routes
    Route::get("/direction",[UserController::class,"index_direction"])->name("direction");
    Route::post("/store-direction",[UserController::class,"store_direction"])->name("direction.store");
    Route::put("/update-direction/{idceo}",[UserController::class,"update_direction"])->name("direction.update");
    Route::put("/archived-direction/{idceo}",[UserController::class,"archive_direction"])->name("direction.archive");
    //regional routes
    Route::get("/regional",[UserController::class,"index_regional"])->name("regional");
    Route::post("/store-regional",[UserController::class,"store_regional"])->name("regional.store");
    Route::put("/update-regional/{idceo}",[UserController::class,"update_regional"])->name("regional.update");
    Route::put("/archived-regional/{idceo}",[UserController::class,"archive_regional"])->name("regional.archive");
        //regional routes
    Route::get("/magasin",[UserController::class,"index_magasin"])->name("magasin");
    Route::post("/store-magasin",[UserController::class,"store_magasin"])->name("magasin.store");
    Route::put("/update-magasin/{idceo}",[UserController::class,"update_magasin"])->name("magasin.update");
    Route::put("/archived-magasin/{idceo}",[UserController::class,"archive_magasin"])->name("magasin.archive");

        //regional routes
    Route::get("/production",[UserController::class,"index_production"])->name("production");
    Route::post("/store-production",[UserController::class,"store_production"])->name("production.store");
    Route::put("/update-production/{idceo}",[UserController::class,"update_production"])->name("production.update");
    Route::put("/archived-production/{idceo}",[UserController::class,"archive_production"])->name("production.archive");
        //commercial routes
    Route::get("/commercial",[UserController::class,"index_commercial"])->name("commercial");
    Route::post("/store-commercial",[UserController::class,"store_commercial"])->name("production.commercial");
    Route::put("/update-production/{idceo}",[UserController::class,"update_commercial"])->name("production.commercial");
    Route::put("/archived-commercial/{idceo}",[UserController::class,"archive_commercial"])->name("production.commercial");
    //subscriptions

Route::get('/subscriptions/{subscription}/invoice', [SubController::class, 'downloadInvoice'])->name('subs.downloadInvoice');
    Route::get("/subs",[SubController::class,"index"])->name("subs");
    Route::post("/subs",[SubController::class,"store"])->name("subs.store");
    Route::get("/subs/{idSub}",[SubController::class,"renew"])->name("subs.renew");
});