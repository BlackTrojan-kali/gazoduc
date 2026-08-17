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
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CiterneController extends Controller
{
    //
    public function index(){
        $citernes = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->where("type","!=","carburant")->with("entreprise","agency","article")->paginate(25);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();
        $products = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","matiere_premiere")->get();
        
        return Inertia("Direction/Citerne",compact("citernes","agencies","entreprises","products"));
        }

    public function store(Request $request)
    {
        $request->validate([
            "name" => "required|string|unique:citernes,name",
            "type" => "string|required",
            "product_type" => "string|required",
            "capacity_liter" => "numeric|nullable",
            "capacity_kg" => "numeric|nullable",
            "current_product_id" => "required",
            "agency_id" => "required",
        ]);

        $article = Article::where("id", $request->current_product_id)->first();
        if (!$article) {
            return back()->with("error", "this article was not found");
        } else {
            try {
                DB::beginTransaction();
                $citerne = new Citerne();
                $citerne->name = $request->name;
                $citerne->type = $request->type;
                $citerne->product_type = $request->product_type;
                $citerne->capacity_liter = $request->capacity_liter;
                $citerne->capacity_kg = $request->capacity_kg;
                $citerne->current_product_id = $request->current_product_id;
                $citerne->agency_id = $request->agency_id;
                $citerne->entreprise_id = Auth::user()->entreprise_id;
                $citerne->save();
                
                // La création du stock a été retirée de cette fonction.
                // Elle est maintenant gérée par la nouvelle méthode generateStock.

                DB::commit();
                return back()->with("success", "Citerne created successfully");
            } catch (Exception $e) {
                DB::rollBack();
                // dd($e); // Désactivé pour ne pas exposer d'informations sensibles en production
                return back()->with("error", "Can't create the citerne, contact the maintenance team");
            }
        }
    }

    /**
     * Generate a new stock entry for a specific citerne.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
       public function generateStock(Request $request)
    {

        $citerne = Citerne::find($request->input("citerne_id"));
        $article = Article::find($request->input("article_id"));

        if (!$citerne || !$article) {
            return back()->with("error", "Citerne or article not found.");
        }

        try {
            DB::beginTransaction();

            // Vérifier si une entrée de stock existe déjà pour cette citerne et cet article
            $existingStock = Stock::where('citerne_id', $citerne->id)
                                  ->where('article_id', $article->id)
                                  ->first();

            if ($existingStock) {
                DB::rollBack();
                return back()->with("error", "Un stock existe déjà pour cette citerne et cet article.");
            }

            Stock::create([
                "article_id" => $article->id,
                "agency_id" => $citerne->agency_id,
                "storage_type" => $citerne->product_type,
                "quantity" => 0,
                "citerne_id" => $citerne->id,
            ]);

            DB::commit();
            return back()->with("success", "Stock generated successfully for citerne: {$citerne->name}");
        } catch (Exception $e) {
            DB::rollBack();
            dd($e);
            return back()->with("error", "An error occurred while generating the stock. Please contact the maintenance team.");
        }
    }
public function update(Request $request, $idCit)
{
    // 1. Validation renforcée
    $request->validate([
        "name" => "required|string",
        "type" => "string|required",
        "product_type" => "string|required",
        "capacity_liter" => "numeric|nullable",
        "capacity_kg" => "numeric|nullable",
        "current_product_id" => "required|exists:articles,id",
        "agency_id" => "required|exists:agencies,id",
        
        // Nouveaux champs IoT
        "total_height_cm" => "nullable|numeric|min:0",
        "diameter_cm" => "nullable|numeric|min:0",
        // Le token doit être unique, mais on ignore l'ID de la citerne actuelle lors de la modif
        "sensor_token" => [
            "nullable", 
            "string", 
            Rule::unique('citernes')->ignore($idCit)
        ],
    ]);

    try {
        DB::beginTransaction();

        // 2. Récupération de la citerne (avec sécurité)
        $citerne = Citerne::with('stock')->findOrFail($idCit);

        // Optionnel : Vérifier que la citerne appartient bien à l'entreprise de l'utilisateur
        if($citerne->entreprise_id !== Auth::user()->entreprise_id){
             abort(403, "Action non autorisée sur cette ressource.");
        }

        // 3. Mise à jour des propriétés standards
        $citerne->name = $request->name;
        $citerne->type = $request->type; // ex: 'fixed', 'mobile'
        $citerne->product_type = $request->product_type; // ex: 'produit_petrolier'
        $citerne->capacity_liter = $request->capacity_liter;
        $citerne->capacity_kg = $request->capacity_kg;
        $citerne->current_product_id = $request->current_product_id;
        $citerne->agency_id = $request->agency_id;
        
        // 4. Mise à jour des propriétés IoT (Sondes)
        $citerne->sensor_token = $request->sensor_token;
        $citerne->total_height_cm = $request->total_height_cm;
        $citerne->diameter_cm = $request->diameter_cm;

        $citerne->save();

        // 5. Mise à jour intelligente du Stock lié
        // Si la citerne a un stock associé, on met à jour ses infos clés pour rester synchro
        if ($citerne->stock) {
            $citerne->stock->article_id = $request->current_product_id; // Si le produit de la cuve change
            $citerne->stock->agency_id = $request->agency_id; // Si la cuve change d'agence
            
            // Votre logique spécifique :
            if ($citerne->type == "fixe") {
                 // Attention : Assurez-vous que 'product_type' correspond bien à ce que la table stocks attend
                 // $citerne->stock->storage_type = $request->product_type; 
            }
            
            $citerne->stock->save();
        } else {
            // Optionnel : Créer le stock s'il n'existe pas ?
            // Cela dépend de votre logique métier.
        }

        DB::commit();

        return back()->with("success", "La citerne et sa configuration IoT ont été mises à jour avec succès, monsieur.");

    } catch (\Exception $e) {
        DB::rollBack();
        // Log l'erreur pour le développeur, mais retourne un message propre à l'utilisateur
        Log::error("Erreur mise à jour Citerne : " . $e->getMessage());
        
        return back()->with("error", "Impossible de mettre à jour la citerne. Veuillez contacter le support technique.");
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
           "licence"=>"string|nullable",
        ]);

    $reception = new Reception();
    $reception->type= $request->licence;
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
        "citerne_mobile_id" => "required|exists:vehicules,id",
        "article_id" => "required|exists:articles,id",
        "quantity" => "required|numeric|min:0.01",
        "agency_id" => "required|exists:agencies,id",
        "citerne_fixe_id" => "required|exists:citernes,id",
        "recorded_by_user_id" => "required|exists:users,id",
        "licence" => "string|nullable",
    ]);

    // --- 1. SÉCURITÉ IOT (Ajout demandé) ---
    // On récupère la citerne avant de commencer quoi que ce soit
    $citerneFixe = Citerne::findOrFail($request->citerne_fixe_id);

    // Vérification : Si la citerne a un token de sonde (donc connectée), on bloque le manuel.
    if (!empty($citerneFixe->sensor_token)) {
        return back()->with("error", "Opération refusée : Cette cuve est connectée à une sonde ultrasonique. Le remplissage sera détecté automatiquement par le système IoT.");
    }

    try {
        DB::beginTransaction();

        // 2. Enregistrement du dépotage
        $depotage = new Depotage();
        $depotage->type = $request->licence;
        $depotage->citerne_mobile_id = $request->citerne_mobile_id;
        $depotage->article_id = $request->article_id;
        $depotage->quantity = $request->quantity;
        $depotage->agency_id = $request->agency_id;
        $depotage->citerne_fixe_id = $request->citerne_fixe_id;
        $depotage->recorded_by_user_id = $request->recorded_by_user_id;
        $depotage->save();

        // 3. Mise à jour du stock de la citerne fixe de destination
        $stockFixe = Stock::where("citerne_id", $request->citerne_fixe_id)
                          ->where("article_id", $request->article_id)
                          ->first();

        // Si le stock n'existe pas encore pour cet article dans cette citerne, on pourrait le créer, 
        // mais ici on suppose qu'il existe ou on gère l'erreur.
        if (!$stockFixe) {
             // Optionnel : Créer le stock si inexistant ou renvoyer une erreur
             // throw new \Exception("Aucun stock trouvé pour cet article dans cette cuve.");
        }

        $article = Article::find($request->article_id);

        // Récupération de la capacité (on utilise l'objet $citerneFixe récupéré au début)
        if ($article->type != "produit_petrolier") {
            $maxCapacity = $citerneFixe->capacity_kg;
        } else {
            $maxCapacity = $citerneFixe->capacity_liter;
        }

        // Vérification de débordement
        $currentQty = $stockFixe ? $stockFixe->quantity : 0;
        $newTotalQuantity = $currentQty + $request->quantity;

        if ($maxCapacity > 0 && $newTotalQuantity > $maxCapacity) {
            DB::rollBack();
            return back()->with("error", "La citerne de destination débordera ! Capacité max : " . $maxCapacity . ", Quantité après ajout : " . $newTotalQuantity);
        }

        // Mise à jour effective
        if ($stockFixe) {
            $stockFixe->quantity += $request->quantity;
            $stockFixe->theorical_quantity = $stockFixe->quantity;
            $stockFixe->save();
        }

        // 4. Mise à jour du stock de la citerne mobile (Camion)
        // (Logique à implémenter selon votre modèle Vehicule/Stock mobile)
        // $stockMobile = ...;
        // $stockMobile->quantity -= $request->quantity;
        // $stockMobile->save();

        DB::commit();
        return back()->with("success", "Dépotage manuel enregistré avec succès !");

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error("Erreur lors du dépotage : " . $e->getMessage());
        return back()->with("error", "Une erreur est survenue : " . $e->getMessage());
    }
}
// app/Http/Controllers/StockController.php (rappel)
public function releve(Request $request, Stock $stock)
{

    $validatedData = $request->validate([
        'theorical_quantity' => ['required', 'numeric', 'min:0'], // Assurez-vous que ce champ peut être envoyé
        'quantity' => ['required', 'numeric', 'min:0'],           // Assurez-vous que ce champ peut être envoyé
    
           "licence"=>['string','nullable'],
    ]);

    try {
        $stock->load('citerne'); // S'assurer que la relation citerne est chargée

        // Vous pouvez ajouter une logique pour ne valider la capacité que si 'quantity' est le champ modifié,
        // ou simplement toujours valider la 'quantity' par rapport à la capacité.
        if($stock->citerne->type == "gaz"){
        if ($stock->citerne && $validatedData['quantity'] > $stock->citerne->capacity_kg) {
            return back()->with('error' ,'La quantité relevée ne peut pas dépasser la capacité maximale de la citerne.')
                         ->withInput();
        }}else{
            if ($stock->citerne && $validatedData['quantity'] > $stock->citerne->capacity_liter) {
                return back()->with('error' ,'La quantité relevée ne peut pas dépasser la capacité maximale de la citerne.')
                             ->withInput();
            }   
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
        $releve->type = $request->licence;
        $releve->save();
        DB::commit();
        return back()->with('success', 'Stock de citerne mis à jour avec succès.');

    } catch (\Exception $e) {
        Log::error("Erreur lors de la mise à jour du stock de citerne (ID: {$stock->id}): " . $e->getMessage());
        return back()->with('error', 'Une erreur est survenue lors de la mise à jour du stock.');
    }
}
/********************************************************************************** */
    /*|                     FUEL PART  FUEL PART  FUEL PART  FUEL PART                | */
    /*********************************************************************************** */
  //
    public function fuel_index(){
        $citernes = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->where("type","carburant")->with("entreprise","agency","article")->paginate(350);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();
        $products = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","produit_petrolier")->get();
        return Inertia("DirectionFuel/FuelCiterne",compact("citernes","agencies","entreprises","products"));
        }


}
