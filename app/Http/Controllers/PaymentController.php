<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Bank;
use App\Models\Client;
use App\Models\Facture;
use App\Models\Payment;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    //
    public function index(){

        $payments = Payment::paginate(15);
        $clients = Client::all();
        $agencies = Agency::all();
        $banks = Bank::all();
        if(Auth::user()->role->name !="direction"){
            $payments = Payment::where("agency_id",Auth::user()->agency_id)->with("agency","bank","client")->paginate(15);
            $agencies = Agency::where("id",Auth::user()->agency_id)->get();
            $sales = Facture::where("agency_id",Auth::user()->agency_id)->where("status","pending")->with("client")->get();
        }
        return inertia("Commercial/ComPayment",compact("payments","banks","agencies","clients","sales"));
    }
     public function store(Request $request)
    {
        // 1. Validation des données de la requête.
        // On s'assure que le montant total du versement correspond bien à la somme des montants des factures sélectionnées.

     $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'client_id' => 'required',
            "bank_id"=>"required",
            "amount"=>"required|numeric",
            "notes"=>"required| string",
            "amount_notes"=>"required |numeric",
            'type' => ['required', 'string'], // <-- Nouveau champ de validation
        ]);

        $sales = $request->input("sales");
       if(count($sales)==0){
            return back()->with("error","aucune facture selectionnee");
          }
        try {
            // 2. Démarre une transaction de base de données pour garantir l'atomicité.
            DB::beginTransaction();

            // 3. Crée le nouveau versement dans la table 'payments'.
            $payment = Payment::create([
                "user_id"=>Auth::user()->id,
                "agency_id"=>Auth::user()->agency_id,
                "bank_id"=>$request->bank_id,
                "client_id"=>$request->client_id,
                "amout"=>$request->amount,
                "type"=>$request->type,
                "notes"=>$request->notes,
                "amout_notes"=>$request->amount_notes,
            
            ]);
            // 4. Parcourt chaque facture sélectionnée pour l'associer au versement et mettre à jour son statut.
  
         
            foreach ($sales as $invoiceData) {
            
                $facture = Facture::find($invoiceData["id"]);

                if ($facture) {
                    // 4a. Crée l'entrée dans la table pivot `facture_payments`.
                    // 'attach' est une méthode Eloquent pour les relations many-to-many.
                    $payment->factures()->attach($facture->id, [
                        'amount' => $request->amount
                    ]);

                    // 4b. Met à jour le statut de la facture à "paid".
                    $facture->status = 'paid';
                    $facture->save();
                }
            }

            // 5. Valide la transaction si toutes les opérations ont réussi.
            DB::commit();

            // 6. Redirige avec un message de succès (pour Inertia).
            return back()->with('success', 'Versement enregistré et factures mises à jour avec succès, monsieur!');

        } catch (Exception $e) {
            // 7. En cas d'erreur, annule toutes les opérations.
            DB::rollBack();

            // Enregistre l'erreur pour le débogage.
            Log::error('Erreur lors du traitement du versement : ' . $e->getMessage());

            // 8. Retourne une erreur à l'utilisateur.
            return back()->with('error','Une erreur est survenue lors de l\'enregistrement du versement. Veuillez réessayer.' . $e->getMessage());
        }
    }
}
