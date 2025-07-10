<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Entreprise;
use App\Models\Licence;
use App\Models\Subscription;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubController extends Controller
{
    //
    public function index(){
        $subs = Subscription::with("entreprise","licence")->orderBy("created_at","desc")->paginate(15);
        $licences = Licence::all();
        $entreprises = Entreprise::all();
        return Inertia("Souscription",compact("subs","licences","entreprises"));
    }
   // Dans votre SubscriptionController.php


public function store(Request $request)
{
    $request->validate([
        "entreprise_id" => "required|exists:entreprises,id",
        "licence_id" => 'required|exists:licences,id',
        "price" => "numeric|required",
        "nombre_agence" => "numeric|nullable", // Peut être nullable si vous le calculez après
        "date_souscription" => "date|required",
        "date_expiration" => "date|required|after:date_souscription",
        "is_active" => "required|boolean",
    ]);

    $agencies = Agency::where("entreprise_id", $request->entreprise_id)->get();

    $subs = new Subscription();
    $subs->entreprise_id = $request->entreprise_id;
    $subs->licence_id = $request->licence_id;
    $subs->price = $request->price;
    // Calculer nombre_agence basé sur le nombre réel d'agences trouvées
    $subs->nombre_agence = count($agencies);
    $subs->date_souscription = $request->date_souscription;
    $subs->date_expiration = $request->date_expiration;
    $subs->is_active = $request->is_active;
    $subs->save();

    // RETIREZ TOUTE LA LOGIQUE DE GÉNÉRATION ET DE RETOUR DU PDF D'ICI
    // (Les lignes suivantes doivent être supprimées de cette fonction store)
    // $price = $request->price;
    // $nbre_agence = count($agencies);
    // $total = $price * $nbre_agence;
    // $pdf = Pdf::loadView('factures.licencePDFView', compact('agencies', "price", "subs", "entreprise", "licence", "total"));
    // return $pdf->download('facture-' . $subs->id . '.pdf');


    // À LA PLACE, RETOURNEZ SIMPLEMENT UNE RÉPONSE JSON AVEC L'ID DE LA SOUSCRIPTION
    return back()->with("success","souscription reussiee");
}
public function downloadInvoice(Subscription $subscription)
{
    // Récupérer les données nécessaires pour la facture
    // Assurez-vous que les relations sont chargées ou récupérez-les ici
    $entreprise = $subscription->entreprise;
    $licence = $subscription->licence;
    $agencies = Agency::where("entreprise_id", $subscription->entreprise_id)->get();

    // Recalculer le prix total si nécessaire pour la facture
    $price = $subscription->price; // Utilisez le prix enregistré dans la souscription
    $nbre_agence = $subscription->nombre_agence; // Utilisez le nombre enregistré
    $total = $price * $nbre_agence;

    // Générer le PDF
    // Assurez-vous que 'factures.licencePDFView' est le bon chemin de votre vue Blade
    $pdf = Pdf::loadView('factures.licencePDFView', compact('agencies', "price", "subscription", "entreprise", "licence", "total"));

    // Retourner le PDF pour le téléchargement
    return $pdf->download('facture-' . $subscription->id . '.pdf');
}
    public function renew(Request $request,$idsub){
      
        $currentDate = Carbon::now();
        $start = Carbon::now();
        $newExpirationDate = $currentDate->addDays(30);
        $subscription =Subscription::where("id",$idsub)->first();
        $subscription->date_souscription =$currentDate->toDateString(); 
        $subscription->date_expiration = $newExpirationDate->toDateString();
        $subscription->is_active = true;
        $subscription->save();
       
        $entreprise = $subscription->entreprise;
    $price = $subscription->price;
            $licence = $subscription->licence;
              //$total = $price * $nbre_agence;
         $agencies = Agency::where("entreprise_id", $subscription->entreprise_id)->get();
    $pdf = Pdf::loadView('factures.licencePDFView', compact('agencies', "price", "subscription","start",'newExpirationDate', "entreprise", "licence"));

    // Retourner le PDF pour le téléchargement
    return $pdf->download('facture-' . $subscription->id . '.pdf');

    }
    
}
