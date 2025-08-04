<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Citerne;
use App\Models\CiterneReading;
use App\Models\Depotage;
use App\Models\Entreprise;
use App\Models\Stock;
use App\Models\Reception;
use App\Models\Releve;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CiterneController extends Controller
{
    //
    public function index(){
        $citernes = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise","agency","article")->paginate(15);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();
        $products = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","matiere_premiere")->get();
        return Inertia("Direction/Citerne",compact("citernes","agencies","entreprises","products"));
        }

    public function store(Request $request){

        $request->validate([
            "name"=>"required|string|unique:citernes,name",
            "type"=>"string|required",
            "product_type"=>"string|required",
           "capacity_liter"=>"numeric|nullable",
            "capacity_kg"=>"numeric|nullable",
            "current_product_id"=>"required",
            "agency_id"=>"required",
        ]);
        $article = Article::where("id",$request->current_product_id)->first();
        if(!$article){
            return back()->with("error","this article was not found");
        }else{
            try{
            Db::beginTransaction();
            $citerne = new Citerne();
            $citerne->name = $request->name;
            $citerne->type = $request->type;
            $citerne->product_type = $request->product_type;
            $citerne->capacity_liter= $request->capacity_liter;
            $citerne->capacity_kg = $request->capacity_kg;
            $citerne->current_product_id = $request->current_product_id;
            $citerne->agency_id = $request->agency_id;
            $citerne->entreprise_id =Auth::user()->entreprise_id;
            $citerne->save();
            if($citerne->type == "fixed"){
            Stock::create([
                "article_id"=> $article->id,
                "agency_id"=>$request->agency_id,
                "storage_type"=>$request->product_type,
                "quantity"=>0,
                "citerne_id"=>$citerne->id,
                "entreprise_id"=>Auth::user()->entreprise_id,
            ]);}
            Db::commit();
            return back()->with("success","citerne and stock created successfully");
        }catch(Exception $e){
            Db::rollBack();
            dd($e);
            return back()->with("error","can't create the stock contact the maintenance team");
        }
        }
        
    }

    public function update(Request $request,$idCit){

        $request->validate([
            "name"=>"required|string",
            "type"=>"string|required",
            "product_type"=>"string|required",
           "capacity_liter"=>"numeric|nullable",
            "capacity_kg"=>"numeric|nullable",
            "current_product_id"=>"required",
            "agency_id"=>"required",
        ]);
        $article = Article::where("id",$request->current_product_id)->with("stock")->first();
        if(!$article){
            return back()->with("error","this article was not found");
        }else{
            try{
            Db::beginTransaction();
            $citerne =Citerne::where("id",$idCit)->first();
            $citerne->name = $request->name;
            $citerne->type = $request->type;
            $citerne->stock->storage_type = $request->product_type;
            $citerne->stock->save();
            $citerne->product_type = $request->product_type;
            $citerne->capacity_liter= $request->capacity_liter;
            $citerne->capacity_kg = $request->capacity_kg;
            $citerne->current_product_id = $request->current_product_id;
            $citerne->agency_id = $request->agency_id;
            $citerne->entreprise_id =Auth::user()->entreprise_id;
            $citerne->save();
        
            Db::commit();
            return back()->with("success","citerne and stock created successfully");
        }catch(Exception $e){
            Db::rollBack();
            dd($e);
            return back()->with("error","can't create the stock contact the maintenance team");
        }
        }
        
    }
    public function reception(Request $request){
        $request->validate([
            "citerne_mobile_id"=>"required",
           "article_id"=>"required",
           "received_quantity"=>"numeric | required",
           "destination_agency_id"=>"required",
           "recorded_id_user"=>"required",
           "origin"=>"string|required", 
        ]);

    $reception = new Reception();
    $reception->citerne_mobile_id = $request->citerne_mobile_id;
    $reception->article_id = $request->article_id;
    $reception->received_quantity = $request->received_quantity;
    $reception->destination_agency_id= $request->destination_agency_id;
    $reception->recorded_id_user= $request->recorded_id_user;
    $reception->origin = $request->origin;
    $reception->save();
    return back()->with("success","reception enregistree");
    }
public function depotage(Request $request)
{
    $request->validate([
        "citerne_mobile_id" => "required|exists:citernes,id", // Ajout de la validation 'exists'
        "article_id" => "required|exists:articles,id",             // Ajout de la validation 'exists'
        "quantity" => "required|numeric|min:0.01",                 // 'min:0.01' pour éviter des quantités négatives ou nulles
        "agency_id" => "required|exists:agencies,id",               // Ajout de la validation 'exists'
        "citerne_fixe_id" => "required|exists:citernes,id",   // Ajout de la validation 'exists', assurez-vous du nom de table
        "recorded_by_user_id" => "required|exists:users,id",        // Ajout de la validation 'exists'
    ]);

    try {
        DB::beginTransaction();

        // 1. Enregistrement du dépotage
        $depotage = new Depotage();
        $depotage->citerne_mobile_id = $request->citerne_mobile_id;
        $depotage->article_id = $request->article_id;
        $depotage->quantity = $request->quantity;
        $depotage->agency_id = $request->agency_id;
        $depotage->citerne_fixe_id = $request->citerne_fixe_id;
        $depotage->recorded_by_user_id = $request->recorded_by_user_id;
        $depotage->save();

        // 2. Mise à jour du stock de la citerne fixe de destination
        // Assurez-vous que 'citerne_id' est la colonne correcte pour lier le stock à la citerne
        $stockFixe = Stock::where("citerne_id", $request->citerne_fixe_id)
                          ->where("article_id", $request->article_id) // Important: Filtrer aussi par article
                          ->first();


        // Récupérer la capacité maximale de la citerne fixe
        // Nous chargeons la relation 'citerne' ici pour être sûr d'avoir la capacité à jour
        $citerneFixe = $stockFixe->citerne ?? Citerne::find($request->citerne_fixe_id); // Fallback si non déjà chargé
        $maxCapacityKg = $citerneFixe ? $citerneFixe->capacity_kg : 0;

        $newTotalQuantity = $stockFixe->quantity + $request->quantity;

        if ($maxCapacityKg > 0 && $newTotalQuantity > $maxCapacityKg) {
            DB::rollBack();
            return back()->with("error", "La citerne de destination sera pleine ou dépassera sa capacité maximale après ce dépotage.");
        }

        $stockFixe->quantity += $request->quantity;
        $stockFixe->theorical_quantity = $stockFixe->quantity; // stock fixe deviens le nouveau stock initial
        $stockFixe->save();

        // 3. Mise à jour du stock de la citerne mobile source
       

      
        // 4. Validation et message de succès
        DB::commit(); // Le commit doit être la dernière étape réussie de la transaction
        return back()->with("success", "Dépotage enregistré avec succès !");

    } catch (\Exception $e) { // Utilisez \Exception pour attraper toutes les exceptions
        DB::rollBack();
        Log::error("Erreur lors du dépotage: " . $e->getMessage() . " sur la ligne " . $e->getLine() . " dans " . $e->getFile());
        return back()->with("error", "Une erreur est survenue lors de l'enregistrement du dépotage. Veuillez réessayer.");
    }
}
// app/Http/Controllers/StockController.php (rappel)
public function releve(Request $request, Stock $stock)
{
    $validatedData = $request->validate([
        'theorical_quantity' => ['required', 'numeric', 'min:0'], // Assurez-vous que ce champ peut être envoyé
        'quantity' => ['required', 'numeric', 'min:0'],           // Assurez-vous que ce champ peut être envoyé
    ]);

    try {
        $stock->load('citerne'); // S'assurer que la relation citerne est chargée

        // Vous pouvez ajouter une logique pour ne valider la capacité que si 'quantity' est le champ modifié,
        // ou simplement toujours valider la 'quantity' par rapport à la capacité.
        if ($stock->citerne && $validatedData['quantity'] > $stock->citerne->capacity_kg) {
            return back()->with('error' ,'La quantité relevée ne peut pas dépasser la capacité maximale de la citerne.')
                         ->withInput();
        }
        DB::beginTransaction();
        $stock->update([
            'theorical_quantity' => $validatedData['theorical_quantity'],
            'quantity' => $validatedData['quantity'],
        ]);
        $releve = new CiterneReading();
        $releve->citerne_id = $stock->citerne_id;
        $releve->stock_id = $stock->id;
        $releve->agency_id = Auth::user()->agency_id;
        $releve->user_id = Auth::user()->id;
        $releve->theorical_quantity = $request->theorical_quantity;
        $releve->measured_quantity = $request->quantity;
        $releve->difference = $releve->measured_quantity - $request->theorical_quantity;
        $releve->save();
        DB::commit();
        return back()->with('success', 'Stock de citerne mis à jour avec succès.');

    } catch (\Exception $e) {
        Log::error("Erreur lors de la mise à jour du stock de citerne (ID: {$stock->id}): " . $e->getMessage());
        return back()->with('error', 'Une erreur est survenue lors de la mise à jour du stock.');
    }
}
}
