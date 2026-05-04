<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Entreprise;
use App\Models\Licence;
use App\Models\Subscription;
use App\Models\SubscribeHistory; // NE PAS OUBLIER CETTE LIGNE
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubController extends Controller
{
    /**
     * 1. AFFICHER LES SOUSCRIPTIONS
     */
    public function index()
    {
        $subs = Subscription::with("entreprise.agencies", "licence")->orderBy("created_at", "desc")->paginate(15);
        $licences = Licence::all();
        $entreprises = Entreprise::all();
        return Inertia("Souscription", compact("subs", "licences", "entreprises"));
    }

    /**
     * 2. CRÉER UNE NOUVELLE SOUSCRIPTION
     */
    public function store(Request $request)
    {
        $request->validate([
            "entreprise_id" => "required|exists:entreprises,id",
            "licence_id" => 'required|exists:licences,id',
            "price" => "numeric|required",
            "date_souscription" => "date|required",
            "date_expiration" => "date|required|after:date_souscription",
            "is_active" => "required|boolean",
        ]);

        $agencies = Agency::where("entreprise_id", $request->entreprise_id)->get();
        $licence = Licence::findOrFail($request->licence_id);

        $subs = new Subscription();
        $subs->entreprise_id = $request->entreprise_id;
        $subs->licence_id = $request->licence_id;
        $subs->price = $request->price;
        $subs->nombre_agence = count($agencies); // Calcul automatique
        $subs->date_souscription = $request->date_souscription;
        $subs->date_expiration = $request->date_expiration;
        $subs->is_active = $request->is_active;
        $subs->save();

        // --- GESTION INTELLIGENTE : HISTORISATION ---
        SubscribeHistory::create([
            'subs_id' => $subs->id,
            'new_price' => $subs->price,
            'new_number_of_agencies' => $subs->nombre_agence,
            'licence_name_at_time' => $licence->name,
            'action_type' => 'creation' // Trace la création
        ]);

        return back()->with("success", "Souscription réussie.");
    }

    /**
     * 3. METTRE À JOUR (Upgrade / Downgrade de licence)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            "licence_id" => 'required|exists:licences,id',
            "price" => "numeric|required",
        ]);

        $sub = Subscription::findOrFail($id);
        $licence = Licence::findOrFail($request->licence_id);
        
        $oldPrice = $sub->price;
        $oldLicenceId = $sub->licence_id;

        // Déterminer l'action
        $actionType = ($oldLicenceId == $request->licence_id) ? 'modification_prix' : 'changement_licence';

        $sub->licence_id = $request->licence_id;
        $sub->price = $request->price;
        $sub->save();

        // --- GESTION INTELLIGENTE : HISTORISATION ---
        SubscribeHistory::create([
            'subs_id' => $sub->id,
            'old_price' => $oldPrice,
            'new_price' => $sub->price,
            'old_number_of_agencies' => $sub->nombre_agence,
            'new_number_of_agencies' => $sub->nombre_agence,
            'licence_name_at_time' => $licence->name,
            'action_type' => $actionType
        ]);

        return back()->with("success", "Souscription mise à jour avec succès.");
    }

    /**
     * 4. RENOUVELER UNE SOUSCRIPTION (Prolonger le temps)
     */
    public function renew(Request $request, $id)
    {
        // On récupère le nombre de mois ou de jours à ajouter (par défaut 1 mois si non fourni)
        $monthsToAdd = $request->input('months', 1); 

        $subscription = Subscription::with('licence')->findOrFail($id);
        $currentExpiration = Carbon::parse($subscription->date_expiration);

        // Si l'abonnement est déjà expiré, on repart d'aujourd'hui. Sinon, on ajoute à la date d'expiration prévue.
        if ($currentExpiration->isPast()) {
            $newExpirationDate = Carbon::now()->addMonths($monthsToAdd);
        } else {
            $newExpirationDate = $currentExpiration->addMonths($monthsToAdd);
        }

        // Attention : On NE MODIFIE PAS la date_souscription pour garder l'ancienneté du client.
        $subscription->date_expiration = $newExpirationDate->toDateString();
        $subscription->is_active = true;
        $subscription->save();

        // --- GESTION INTELLIGENTE : HISTORISATION ---
        SubscribeHistory::create([
            'subs_id' => $subscription->id,
            'old_price' => $subscription->price,
            'new_price' => $subscription->price, // Le prix reste le même pour un simple renouvellement
            'old_number_of_agencies' => $subscription->nombre_agence,
            'new_number_of_agencies' => $subscription->nombre_agence,
            'licence_name_at_time' => $subscription->licence->name,
            'action_type' => 'renouvellement'
        ]);

        // Note avec Inertia : Il vaut mieux retourner un message de succès et laisser
        // l'utilisateur cliquer sur un bouton "Télécharger la facture" séparément.
        return back()->with("success", "Abonnement renouvelé jusqu'au " . $newExpirationDate->format('d/m/Y'));
    }

    /**
     * 5. DÉSACTIVER / ANNULER UNE SOUSCRIPTION
     */
    public function cancel($id)
    {
        $subscription = Subscription::with('licence')->findOrFail($id);
        
        $subscription->is_active = false;
        $subscription->save();

        SubscribeHistory::create([
            'subs_id' => $subscription->id,
            'licence_name_at_time' => $subscription->licence->name,
            'action_type' => 'annulation'
        ]);

        return back()->with("success", "Souscription désactivée.");
    }

   /**
     * 6. TÉLÉCHARGER LA FACTURE
     */
    public function downloadInvoice($id)
    {
        // On charge la souscription avec ses relations
        $subscription = Subscription::with(['entreprise', 'licence'])->findOrFail($id);
        
        $entreprise = $subscription->entreprise;
        $licence = $subscription->licence;
        
        // Récupération sécurisée des agences de l'entreprise
        $agencies = Agency::where("entreprise_id", $entreprise->id)->get();

        $price = $subscription->price; 
        
        // --- NOUVEAU : Récupération des dates pour la vue Blade ---
        $start = $subscription->date_souscription;
        $newExpirationDate = $subscription->date_expiration;

        // Génération du PDF avec TOUTES les variables requises par la vue
        $pdf = Pdf::loadView('factures.licencePDFView', compact(
            'agencies', 
            'price', 
            'subscription', 
            'entreprise', 
            'licence', 
            'start', 
            'newExpirationDate'
        ));

        // Formatage du nom du fichier pour éviter les erreurs avec les espaces dans le nom de l'entreprise
        $fileName = 'facture-' . \Illuminate\Support\Str::slug($entreprise->name) . '-' . $subscription->id . '.pdf';

        return $pdf->download($fileName);
    }
}