<?php

use App\Http\Controllers\AgencyController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\bankController;
use App\Http\Controllers\BrouteController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CiterneController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommercialController;
use App\Http\Controllers\DepotageController;
use App\Http\Controllers\DirectionController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Middleware\SuperAdminMiddleWare;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EntrepriseController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\LicenceController;
use App\Http\Controllers\MagasinController;
use App\Http\Controllers\MouvementController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\receptionController;
use App\Http\Controllers\RegionalController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\ReleveController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SubController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehiculeController;
use App\Http\Middleware\CommercialMiddleware;
use App\Http\Middleware\DirectionMiddleware;
use App\Http\Middleware\IsAdminMiddleware;
use App\Http\Middleware\isAuthenticatedMiddleware;
use App\Http\Middleware\MagasinMiddleware;
use App\Http\Middleware\ProductionMiddleware;
use App\Http\Middleware\RegionaMiddleware;
use App\Models\Mouvement;

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
   //subscriptions

Route::get('/subscriptions/{subscription}/invoice', [SubController::class, 'downloadInvoice'])->name('subs.downloadInvoice');
    Route::get("/subs",[SubController::class,"index"])->name("subs");
    Route::post("/subs",[SubController::class,"store"])->name("subs.store");
    Route::get("/subs/{idSub}",[SubController::class,"renew"])->name("subs.renew");
});

Route::middleware(DirectionMiddleware::class)->group(function(){
    //direction routes
    Route::get("/director/index",[DirectionController::class,"index"])->name("director.index");
    //articles routes
    Route::get("/director/articles",[ArticleController::class,"index"])->name("articles.index");
    Route::post("/director/articles-store",[ArticleController::class,"store"])->name("articles.store");
    Route::put("/director/articles-update/{idAr}",[ArticleController::class,"update"])->name("articles.update");
    Route::delete("/director/articles-delete/{idAr}",[ArticleController::class,"delete"])->name("articles.delete");
    //stock routes
    Route::post('/stocks/create-for-article/{idAr}', [StockController::class, 'createForArticle'])->name('stocks.createForArticle');
    //citernes routes
    Route::get('/citernes/index', [CiterneController::class, 'index'])->name('citernes.index');
    Route::post('/citernes/store', [CiterneController::class, 'store'])->name('citernes.store');
    Route::put('/citernes/uptate/{idCit}', [CiterneController::class, 'update'])->name('citernes.update');
    //banks routes
    Route::get("/banks/index",[bankController::class,"index"])->name("banks.index");
    Route::post("/banks/store",[bankController::class,"store"])->name("banks.store");
    Route::put("/banks/update/{idBank}",[bankController::class,"update"])->name("banks.update");
    Route::put("/banks/archive/{idBank}",[bankController::class,"archive"])->name("banks.archive");
    
});
//magasinier middleware
Route::middleware(MagasinMiddleware::class)->group(function(){
   //magasinier citernes routes
    Route::get("/magasin-index",[MagasinController::class,"index"])->name("magasin.index"); 
   Route::get("/magasin-citernes",[MagasinController::class,"citerne_index"])->name("magasin.citerne_index"); 
   Route::post("/magasin-citernes-depotage",[CiterneController::class,"depotage"])->name("magasin.depotage");
   Route::post("/magasin-citerne-releve/{stock}",[CiterneController::class,"releve"])->name("magasin.releve");
   //mouvement
});

//common routes to all users
Route::middleware(isAuthenticatedMiddleware::class)->group(function(){

   Route::post("/magasin-citernes-reception",[CiterneController::class,"reception"])->name("magasin.reception");
   //releves routes
        Route::get("/releves",[ReleveController::class,"index"])->name("releves.index");
        Route::get("/releves-export",[ReleveController::class,"export"])->name("releves.export");
        //Depotage routes
        Route::get("/depotages",[DepotageController::class,"index"])->name("depotages.index");
        Route::get("/depotages-export",[DepotageController::class,"export"])->name("depotages.export");
        Route::delete("/depotages/{idDep}",[DepotageController::class,"delete"])->name("depotages.delete");
        //receptions routes
        Route::get("/receptions",[receptionController::class,"index"])->name("receptions.index");
        Route::delete("/receptions/{idRec}",[receptionController::class,"delete"])->name("receptions.delete");
        Route::get("/receptions-pdf",[receptionController::class,"export"])->name("receptions.export");

   Route::post("/magasin-move",[MouvementController::class,"store"])->name("magasin.move.store");
   Route::get("/magasin-moves/{type}",[MouvementController::class,"moves"])->name("magasin.moves");
   Route::delete("/magasin-move-delete/{idmov}",[MouvementController::class,"delete"])->name("magasin.move.delete");
    Route::get('/movements/generate-report', [MouvementController::class, 'generateReport'])->name('movements.generateReport');
    //production
        Route::get("/prod-history-pdf",[ProductionController::class,"export"])->name("prod.export");
    Route::get("/prod-history",[ProductionController::class,"prod_history"])->name("prod.hist");
    //clients routes
    Route::get("/client-index",[ClientController::class,"index"])->name("client.index");
    Route::post("/client-store",[ClientController::class,"store"])->name("client.store");
    Route::put("/client-update/{idCli}",[ClientController::class,"update"])->name("client.update");
    Route::delete("/client-delete/{idCli}",[ClientController::class,"destroy"])->name("client.destroy");
    //clients cats
    Route::get("/client-cat",[CategoryController::class,"index"])->name("cat.index");
    Route::post("/client-cat-store",[CategoryController::class,"store"])->name("cat.store");
    Route::put("/client-cat-update/{idCat}",[CategoryController::class,"update"])->name("cat.update");
    Route::delete("/client-cat-delete/{idCat}",[CategoryController::class,"destroy"])->name("cat.delete");
    //clients price
    Route::get("/client-price",[PriceController::class,"index"])->name("price.index");
    Route::post("/client-price-store",[PriceController::class,"store"])->name("price.store");
    Route::put("/client-price-update/{idprice}",[PriceController::class,"update"])->name("price.update");
    Route::delete("/client-price-delete/{idprice}",[PriceController::class,"delete"])->name("price.delete");
    //invoice route
    Route::get('/factures/{facture}/print', [FactureController::class, 'printFacture'])->name('factures.print');
    Route::get('/sales/export-pdf', [FactureController::class, 'exportPdf'])->name('sales.export.pdf');
    Route::get('/sales/items', [FactureController::class, 'sales'])->name('sales.items');
    Route::get('/facture-items/export-item-pdf', [FactureController::class, 'exportItemPdf'])->name('facture-items.export.pdf');
    Route::delete('/factures/delete/{idFac}', [FactureController::class, 'delete'])->name('factures.delete');
    //payment routes
    Route::get("/payment-index",[PaymentController::class,"index"])->name("payment.index");
    Route::get("/payment-export",[PaymentController::class,"exportPaymentsToPdf"])->name("payments.export");
  //vehicules routes
    Route::get("/vehicules-index",[VehiculeController::class,"index"])->name("vehicule.index");
    Route::post("/vehicles-store",[VehiculeController::class,"store"])->name("vehicle.store");
    Route::put("/vehicles-update/{Vid}",[VehiculeController::class,"update"])->name("vehicle.update");
    Route::put("/vehicles-archive/{Vid}",[VehiculeController::class,"archive"])->name("vehicle.archive");
  //drivers routes
    Route::get("/drivers-index",[DriverController::class,"index"])->name("driver.index");
    Route::post("/drivers-store",[DriverController::class,"store"])->name("drivers.store");
    Route::put("/drivers-update/{Cid}",[DriverController::class,"update"])->name("drivers.update");
    Route::put("/drivers-archive/{Cid}",[DriverController::class,"archive"])->name("drivers.archive");
    //roadbill routes
    Route::get("/broute-index",[BrouteController::class,"index"])->name("broutes.index");
    Route::post("/broute-store",[BrouteController::class,"store"])->name("broutes.store");
    Route::get('/broute/{id}/download-pdf', [BrouteController::class, 'downloadPdf'])->name('broutes.download-pdf');
    Route::delete('/roadbills/{id}', [BrouteController::class, 'destroy'])->name('broutes.destroy');
});
Route::middleware(CommercialMiddleware::class)->group(function(){
    //commercial routes
    Route::get("/commercial-page-index",[CommercialController::class,"index"])->name("compage.index");
    Route::get("/commercial-page-sales",[CommercialController::class,"sales"])->name("compage.sales");
    Route::post("/commercial-page-sales-store",[CommercialController::class,"store"])->name("compage.store");
    //payment routes
    Route::post("/payment-store",[PaymentController::class,"store"])->name("payments.store");
    Route::post("/payment-associate/",[PaymentController::class,"associate"])->name("payments.associate");
    Route::post('/payments/disassociate', [PaymentController::class, 'disassociate'])->name('payments.disassociate');
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');
});
Route::middleware(IsAdminMiddleware::class)->group(function(){
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
    Route::post("/store-commercial",[UserController::class,"store_commercial"])->name("commercial.store");
    Route::put("/update-production/{idceo}",[UserController::class,"update_commercial"])->name("commercial.update");
    Route::put("/archived-commercial/{idceo}",[UserController::class,"archive_commercial"])->name("commercial.archive");
  
});
Route::middleware(RegionaMiddleware::class)->group(function(){
    Route::get("/controlleur-index",[RegionalController::class,"index"])->name("controlleur.index");
    Route::get("/controlleur-citerne",[RegionalController::class,"citerne_index"])->name("controlleur.citerne");
    Route::get("/controlleur-sales",[RegionalController::class,"sales"])->name("controlleu.sales");
    Route::get("/controlleur-payment",[RegionalController::class,"payments"])->name("controlleur.payments");
    Route::get("/controlleur-factures",[RegionalController::class,"factures"])->name("controlleur.factures");
});
//production middleware
Route::middleware(ProductionMiddleware::class)->group(function(){
    //production citernes routes
    Route::get("/production-dashboard",[ProductionController::class,"index"])->name("prod.index");
    Route::get("/production-citernes",[ProductionController::class,"citerne_index"])->name("prod.citerne");
    Route::post("/producttion-produced",[ProductionController::class,"produce"])->name("prod.produce");
    Route::delete("/production-delete/{idProd}",[ProductionController::class,"delete"])->name("prodMove.delete");
    
}); 