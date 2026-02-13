<?php

use App\Http\Controllers\AgencyController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\bankController;
use App\Http\Controllers\BoutiqueController;
use App\Http\Controllers\BrouteController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CEOController;
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
use App\Http\Controllers\FuelController as ControllersFuelController;
use App\Http\Controllers\LicenceController;
use App\Http\Controllers\MagasinController;
use App\Http\Controllers\MouvementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\receptionController;
use App\Http\Controllers\RegionalController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\ReleveController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\DirBoutiqueController;
use App\Http\Controllers\SubController;
use App\Http\Controllers\ClosureController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehiculeController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Middleware\CEOMiddleware;
use App\Http\Middleware\CommercialMiddleware;
use App\Http\Middleware\DirectionMiddleware;
use App\Http\Middleware\IsAdminMiddleware;
use App\Http\Middleware\isAuthenticatedMiddleware;
use App\Http\Middleware\MagasinMiddleware;
use App\Http\Middleware\ProductionMiddleware;
use App\Http\Middleware\RegionaMiddleware;
use App\Http\Middleware\isArchivedMiddleWare;
use App\Http\Middleware\ClosureMiddleware;
use App\Models\Mouvement;
use Illuminate\Http\Request;
use App\Http\Controllers\FuelPaymentController;
use App\Http\Controllers\PompeController;

use App\Http\Controllers\DirFuelController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductStockController;
use App\Http\Controllers\CounterController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\MagBoutiqueController;
use App\Http\Controllers\ProductTransfertController;

use App\Http\Controllers\ComBoutiqueController;
use App\Http\Controllers\ProductSalesController;
use App\Http\Controllers\ProductPaymentController;
//auth routes
Route::get('/login',[AuthController::class,"loginPage"] )->name("login");
Route::post('/login',[AuthController::class,"login"] )->name("login");
Route::post('/logout',[AuthController::class,"logout"] )->name("logout");

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

Route::middleware([DirectionMiddleware::class,isArchivedMiddleWare::class])->group(function(){
//Mouvements direction
Route::get('/direction/historique-global', [DirBoutiqueController::class, 'history'])
         ->name('direction.history');
Route::get('/direction/export-historique', [DirBoutiqueController::class, 'export_history'])
     ->name('direction.export_history');
     Route::get('/direction/transferts', [DirBoutiqueController::class, 'transferHistory'])
     ->name('direction.transfers');
         //BOUTIQUES ROUTES
    Route::get("/boutiques/index",[DirBoutiqueController::class,"index"])->name("boutiques.index");
    Route::post("/boutiques/store",[BoutiqueController::class,"store"])->name("boutiques.store");
    Route::put("/boutiques/update/{boutique}",[BoutiqueController::class,"update"])->name("boutiques.update");
    Route::delete("/boutiques/delete/{boutique}",[BoutiqueController::class,"destroy"])->name("boutiques.destroy");
    //BOUTIQUE PRODUCT CATEGORY
    Route::get("/product/category/index",[ProductCategoryController::class,"index"])->name("product.category.index");
    Route::post("/product/category/store",[ProductCategoryController::class,"store"])->name("product-categories.store");
    Route::put("/product/category/update/{category}",[ProductCategoryController::class,"update"])->name("product-categories.update");
    Route::delete("/product/category/delete/{category}",[ProductCategoryController::class,"destroy"])->name("product-categories.destroy");
    //BOUTIQUE PRODUCT
    Route::get("/product/index",[ProductController::class,"index"])->name("product.index");
    Route::post("/product/store",[ProductController::class,"store"])->name("products.store");
    Route::put("/product/update/{product}",[ProductController::class,"update"])->name("products.update");
    Route::delete("/product/delete/{product}",[ProductController::class,"destroy"])->name("products.destroy");
    Route::post("/product/all-stock",[ProductController::class,"initializeAllStocks"])->name("products.init-all-stocks");
    Route::post("/product/stock/{product}",[ProductController::class,"initializeProductStock"])->name("products.init-stock");
   //Boutique Product Stocks

    Route::get("/product/stocks-index",[ProductStockController::class,"index"])->name("product.stocks");
   //BOUTIQUE COUNTERS
    Route::get("/counters/index",[CounterController::class,"index"])->name("counters.index");
    Route::put('/counters/{counter}/transfert-point', [CounterController::class, 'updateTransfertPoint'])
         ->name('counters.update-transfert-point');
    //BOUTIQUE USER Routes
    Route::get("/boutique/users/index",[UserController::class,"index_boutique"])->name("boutique.users.index");
    Route::post("/boutique/users/store",[UserController::class,"store_boutique"])->name("boutique_users.store");
    Route::put("/boutique/users/update/{user}",[UserController::class,"update_boutique"])->name("boutique_users.update");
    Route::post("/boutique/users/delete/{user}",[UserController::class,"destroy_boutique"])->name("boutique_users.destroy");
    
    //pompes routes
    Route::get("/pompes/index",[PompeController::class,"index"])->name("pompes.index");
    Route::post("/pompes/store",[PompeController::class,"store"])->name("pompes.store");
    Route::put("/pompes/update/{pompe}",[PompeController::class,"update"])->name("pompes.update");
    Route::delete("/pompes/delete/{pompe}",[PompeController::class,"destroy"])->name("pompes.destroy");
    //associate pompe citerne
    Route::post('/pompes/{pompe}/associate-citernes', [PompeController::class, 'associateCiternes'])->name('pompes.associate-citernes');
    //dissociate pompe citerne
    Route::post('/pompes/{pompe}/dissociate-citernes', [PompeController::class, 'dissociateCiternes'])->name('pompes.dissociate-citernes');
    //direction routes
    Route::get("/director/index",[DirectionController::class,"index"])->name("director.index");
    //articles routes
    Route::get("/director/articles",[ArticleController::class,"index"])->name("articles.index");
    Route::post("/director/articles-store",[ArticleController::class,"store"])->name("articles.store");
    Route::put("/director/articles-update/{idAr}",[ArticleController::class,"update"])->name("articles.update");
    Route::delete("/director/articles-delete/{idAr}",[ArticleController::class,"delete"])->name("articles.destroy");
    //stock routes
    Route::post('/stocks/create-for-article/{idAr}', [StockController::class, 'createForArticle'])->name('stocks.createForArticle');
    //citernes routes
    Route::get('/citernes/index', [CiterneController::class, 'index'])->name('citernes.index');
    Route::post('/citernes/store', [CiterneController::class, 'store'])->name('citernes.store');
    Route::post('/citernes/generate-stock', [CiterneController::class, 'generateStock'])->name('citernes.generate-stock');
    Route::put('/citernes/uptate/{idCit}', [CiterneController::class, 'update'])->name('citernes.update');
    //banks routes
    Route::get("/banks/index",[bankController::class,"index"])->name("banks.index");
    Route::post("/banks/store",[bankController::class,"store"])->name("banks.store");
    Route::put("/banks/update/{idBank}",[bankController::class,"update"])->name("banks.update");
    Route::put("/banks/archive/{idBank}",[bankController::class,"archive"])->name("banks.archive");
    //closures routes
    Route::get("/closures/index",[ClosureController::class,"index"])->name("closures.index");
    Route::post("/closures/store",[ClosureController::class,"store"])->name("closures.store");
    Route::put("/closures/{idClosure}",[ClosureController::class,"update"])->name("closures.update");
    Route::delete("/closures/{idClosure}",[ClosureController::class,"destroy"])->name("closures.delete");
});
//magasinier middleware
Route::middleware([MagasinMiddleware::class,isArchivedMiddleWare::class,ClosureMiddleware::class])->group(function(){
   //magasinier citernes routes
    Route::get("/magasin-index",[MagasinController::class,"index"])->name("magasin.index"); 
   Route::get("/magasin-citernes",[MagasinController::class,"citerne_index"])->name("magasin.citerne_index"); 
   Route::post("/magasin-citernes-depotage",[CiterneController::class,"depotage"])->name("magasin.depotage");
   Route::post("/magasin-citerne-releve/{stock}",[CiterneController::class,"releve"])->name("magasin.releve");
   //mouvement
   //sale fuel
   Route::post("/magasin-post-sale-fuel",[ControllersFuelController::class,"store"])->name("fuel.store");

//select licence type
Route::get("/magasin-choose-licence",[MagasinController::class,"licence"])->name("magasin.licence");
//carburants routes 
Route::get('/fuel_citerne_index', [MagasinController::class, 'fuel_citerne_index'])->name('magasin.fuel_citerne_index');
//BOUTIQUES MAGASIN ROUTES
Route::get("/magasin-stock",[MagBoutiqueController::class,"index"])->name("magasin.boutique.index");
Route::post("/magasin-stock-move",[MagBoutiqueController::class,"store"])->name("magasin.boutique.store");


Route::get('/mag-boutique/trasfert/index', [ProductTransfertController::class, 'index'])
         ->name('mag-boutique.transferts');

Route::post('/mag-boutique/trasfert/store', [ProductTransfertController::class, 'store'])
         ->name('mag-boutique.tranfert.store');

Route::post('/mag-boutique/trasfert/receive/{id}', [ProductTransfertController::class, 'receive'])
         ->name('mag-boutique.transferts.receive');
Route::delete('/transfers/{id}', [ProductTransfertController::class, 'destroy'])
         ->name('transfers.destroy');

    // Impression
    Route::get('/transfers/{id}/print', [ProductTransfertController::class, 'print_waybill'])
         ->name('transfers.print_waybill');

});

//common routes to all users
Route::middleware([isAuthenticatedMiddleware::class,ClosureMiddleware::class])->group(function(){

//global boutique pdf routes
Route::get('/product-sales', [DirBoutiqueController::class, 'salesHistory'])->name('admin.reports.sales');
        Route::get('/product-sales/pdf', [DirBoutiqueController::class, 'downloadSalesReport'])->name('admin.reports.sales.pdf');
        
        Route::get('/product-payments', [DirBoutiqueController::class, 'paymentsHistory'])->name('admin.reports.payments');
        Route::get('/product-payments/pdf', [DirBoutiqueController::class, 'downloadPaymentsReport'])->name('admin.reports.payments.pdf');    

Route::delete("/magasin-stock-destroy/{id}",[MagBoutiqueController::class,"destroy"])->name("magasin.boutique.destroy");
//Move history
Route::get("/magasin-stock-history",[MagBoutiqueController::class,"history"])->name("magasin.boutique.history");
Route::get('/mag-boutique/export', [MagBoutiqueController::class, 'export_history'])
         ->name('mag-boutique.export_history');


// Route pour la mise à jour (PUT)
    Route::put('/customers/update/{customer}', [CustomerController::class, 'update'])->name('customers.update');

    // Route pour la suppression (DELETE)
    Route::delete('/customers/delete/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    
    // Import / Export
    Route::post('/customers/import', [CustomerController::class, 'import'])->name('customers.import');
    Route::get('/customers/template', [CustomerController::class, 'downloadTemplate'])->name('customers.download-template');
    
    // Pour l'export, on utilise souvent GET avec des query params, ou POST si beaucoup de filtres
    Route::get('/customers/export', [CustomerController::class, 'export'])->name('customers.export');    // Impression
    Route::get('/transfers/{id}/print', [ProductTransfertController::class, 'print_waybill'])
         ->name('transfers.print_waybill');
   Route::post("/magasin-citernes-reception",[CiterneController::class,"reception"])->name("magasin.reception");
   //choose licence
Route::get("/direction-choose-licence",[DirectionController::class,"licence"])->name("director.licence");
//payment fuel routes
Route::get('/fuel-payments', [FuelPaymentController::class, 'index'])->name('fuel_payments.index');
Route::get('/fuel-payments/create', [FuelPaymentController::class, 'create'])->name('fuel_payments.create');
Route::post('/fuel-payments', [FuelPaymentController::class, 'store'])->name('fuel_payments.store');
Route::get('/fuel-payments/{payment}', [FuelPaymentController::class, 'show'])->name('fuel_payments.show');
Route::put('/fuel-payments/{payment}', [FuelPaymentController::class, 'update'])->name('fuel_payments.update');
Route::delete('/fuel-payments/{payment}', [FuelPaymentController::class, 'destroy'])->name('fuel_payments.destroy');

// Exports
Route::get('/fuel-payments/export/pdf', [FuelPaymentController::class, 'exportPdf'])->name('fuel_payments.export_pdf');
Route::get('/fuel-payments/export/excel', [FuelPaymentController::class, 'exportExcel'])->name('fuel_payments.export_excel');
//fuel articles routes
Route::get('/fuel-articles', [ArticleController::class, 'fuel_index'])->name('fuel_article.index');
Route::get('/fuel-citernes', [CiterneController::class, 'fuel_index'])->name('fuel_citerne.index');

   //releves routes
        Route::get("/releves/{type}",[ReleveController::class,"index"])->name("releves.index");
        Route::get("/releves-export",[ReleveController::class,"export"])->name("releves.export");
        //Depotage routes
        Route::get("/depotages/{type}",[DepotageController::class,"index"])->name("depotages.index");
        Route::get("/depotages-export",[DepotageController::class,"export"])->name("depotages.export");
        Route::delete("/depotages/{idDep}",[DepotageController::class,"delete"])->name("depotages.delete");
        //receptions routes
        Route::get("/receptions/{type}",[receptionController::class,"index"])->name("receptions.index");
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
    Route::post("/client-import/",[ClientController::class,"import"])->name("client.import");
    Route::get("/client-export/",[ClientController::class,"export"])->name("client.export");
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
   Route::get('/prices/export/pdf', [PriceController::class, 'exportPdf'])
    ->name('prices.export.pdf');

    //invoice route
    Route::get('/factures/{facture}/print', [FactureController::class, 'printFacture'])->name('factures.print');
    Route::get('/sales/export-pdf', [FactureController::class, 'exportPdf'])->name('sales.export.pdf');
    Route::get('/sales/items', [FactureController::class, 'sales'])->name('sales.items');
    Route::get('/facture-items/export-item-pdf', [FactureController::class, 'exportItemPdf'])->name('facture-items.export.pdf');
    Route::delete('/factures/delete/{idFac}/{licence}', [FactureController::class, 'delete'])->name('factures.delete');
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
    Route::post('/roadbills/{roadbill}/validate',[BrouteController::class, 'validateRoadbill'])->name('broutes.validate');
    Route::get('/roadbills/export',[BrouteController::class, 'export'])->name('broutes.export');
    //sales rroutes
    Route::get("/controlleur-sales",[RegionalController::class,"sales"])->name("controlleu.sales");
    Route::get("/controlleur-payment",[RegionalController::class,"payments"])->name("controlleur.payments");
    Route::get("/controlleur-factures",[RegionalController::class,"factures"])->name("controlleur.factures");
    //notifications

Route::post('/notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');

 //commercial routes
 Route::get("/commercial-page-index",[CommercialController::class,"index"])->name("compage.index");
 Route::get("/commercial-page-sales",[CommercialController::class,"sales"])->name("compage.sales");
 Route::post("/commercial-page-sales-store",[CommercialController::class,"store"])->name("compage.store");
 //payment routes
 Route::post("/payment-store",[PaymentController::class,"store"])->name("payments.store");
 Route::put("/payment-update/{PID}",[PaymentController::class,"update"])->name("payments.update");
 Route::post("/payment-associate/",[PaymentController::class,"associate"])->name("payments.associate");
 Route::post('/payments/disassociate', [PaymentController::class, 'disassociate'])->name('payments.disassociate');
 Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');
//fuel sales routes

Route::get("/fuel-sales-hitory",[ControllersFuelController::class,"history"])->name("fuel.sales");
Route::get('/fuel-sales/export/pdf', [ControllersFuelController::class, 'export'])->name('fuel.export.pdf');
Route::get('/fuel-sales/export/excel', [ControllersFuelController::class, 'exportExcel'])->name('fuel.export.excel');
     //stock des cuves
    Route::get("/stock/cuves",[DirFuelController::class,"fetch_cuves_stock"])->name("fuel.stock.cuves");
Route::delete('/fuel-sales/delete/{idFuelSale}', [ControllersFuelController::class, 'delete'])->name('fuelsales.delete');


});
Route::middleware([CommercialMiddleware::class,isArchivedMiddleWare::class,ClosureMiddleware::class])->group(function(){
    Route::get("/com-boutique/index",[ComBoutiqueController::class,"index"])->name("commercial.boutique.index");
    
    Route::post("/com-boutique/move/store",[ComBoutiqueController::class,"store"])->name("comboutique.move_store");
  Route::post('/sales', [ProductSalesController::class, 'store'])->name('sales.store');
    Route::get('/sales/{id}/print', [ProductSalesController::class, 'print'])->name('sales.print');
    Route::get('/sales/history/pdf', [ProductSalesController::class, 'generateHistoryPdf'])->name('sales.history.pdf');
   Route::get('/sales/history', [ProductSalesController::class, 'history'])->name('sales.history');
   Route::post("/product/sales/payments",[ProductPaymentController::class,"store"])->name("product-sales.payment");

 Route::get('/product-payments/history', [ProductPaymentController::class, 'index'])->name('product.payments.history');
Route::get('/product-payments/report/pdf', [ProductPaymentController::class, 'downloadReport'])->name('product-payments.report.pdf');
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
Route::middleware([RegionaMiddleware::class,isArchivedMiddleWare::class])->group(function(){
    Route::get("/controlleur-index",[RegionalController::class,"index"])->name("controlleur.index");
    Route::get("/controlleur-citerne",[RegionalController::class,"citerne_index"])->name("controlleur.citerne");
});

//production middleware
Route::middleware([ProductionMiddleware::class,isArchivedMiddleWare::class,ClosureMiddleware::class])->group(function(){
    //production citernes routes
    Route::get("/production-dashboard",[ProductionController::class,"index"])->name("prod.index");
    Route::get("/production-citernes",[ProductionController::class,"citerne_index"])->name("prod.citerne");
    Route::post("/producttion-produced",[ProductionController::class,"produce"])->name("prod.produce");
    Route::delete("/production-delete/{idProd}",[ProductionController::class,"delete"])->name("prodMove.delete");
    
});

//ceo routes
Route::middleware(CEOMiddleware::class)->group(function(){
    Route::get("/ceo-index",[CEOController::class,"index"])->name("pdg.index");
    Route::get("/ceo-ca",[CEOController::class,"sales"])->name("pdg.ca");
    Route::get("/ceo-payment",[CEOController::class,"paymentReport"])->name("pdg.payment");
    Route::get("/ceo-articles",[CEOController::class,"articlesConsolidated"])->name("pdg.articles");
    Route::get("/ceo-choose",[CEOController::class,"choose_fuel"])->name("pdg.choose");
    Route::get("/ceo-fuel-index",[CEOController::class,"fuel_index"])->name("pdg.fuel_index");
    Route::get("/ceo-fuel-stock",[CEOController::class,"fuel_stock_consolidated"])->name("pdg.fuel_stock");
    Route::get("/ceo-fuel-payments",[CEOController::class,"fuel_payments_consolidated"])->name("pdg.fuel_payments");
});