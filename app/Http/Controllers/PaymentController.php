<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Bank;
use App\Models\Client;
use App\Models\Facture;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
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
        if(Auth::user()->role->name !=="direction"){
        $clients= Client::where("agency_id",Auth::user()->agency_id)->with("category")->get();
            
        } 
        $agencies = Agency::all();
        $banks = Bank::all();
        if(Auth::user()->role->name !="direction"){
            $payments = Payment::where("agency_id",Auth::user()->agency_id)->with("agency","bank","client","factures")->paginate(15);
            $agencies = Agency::where("id",Auth::user()->agency_id)->get();
            $sales = Facture::where("agency_id",Auth::user()->agency_id)->where("status","pending")->with("client")->get();
        }
        return inertia("Commercial/ComPayment",compact("payments","banks","agencies","clients","sales"));
    }
   public function store(Request $request)
{
    // 1. Validation
    $validated = $request->validate([
        'client_id'         => 'required|exists:clients,id',
        'bank_id'           => 'required|exists:banks,id',
        'amount'            => 'required|numeric|min:0', 
        'type'              => 'required|string', 
        'notes'             => 'nullable|string',
        'amount_notes'      => 'nullable|numeric|min:0',
        'isComplement'      => 'boolean', // Important pour la logique
        'selected_sale_ids' => 'nullable|array',
        'selected_sale_ids.*' => 'exists:factures,id',
    ]);

    try {
        DB::beginTransaction();

        // 2. Création du Versement (Table 'payments')
        // Ce versement est créé dans tous les cas.
        $payment = Payment::create([
            "user_id"      => Auth::id(),
            "agency_id"    => Auth::user()->agency_id,
            "bank_id"      => $validated['bank_id'],
            "client_id"    => $validated['client_id'],
            "amout"        => $validated['amount'],
            "type"         => $validated['type'],
            "notes"        => $validated['notes'],
            "amout_notes"  => $validated['amount_notes'],
            "is_fuel"      => false,
            // On pourrait stocker le fait que c'est un complément dans une colonne si nécessaire
            // "is_deposit" => $request->boolean('isComplement'), 
        ]);

        // 3. LOGIQUE CONDITIONNELLE
        // On ne fait le lettrage (association aux factures) QUE SI ce n'est PAS un complément
        if (!$request->boolean('isComplement')) {
            
            // Calcul de la puissance de paiement (Cash + Justificatif)
            $montantVerse = floatval($validated['amount']);
            $montantJustifie = floatval($validated['amount_notes'] ?? 0);
            $remainingPayment = $montantVerse + $montantJustifie;

            $selectedInvoiceIds = $validated['selected_sale_ids'] ?? [];

            if (!empty($selectedInvoiceIds)) {
                $factures = Facture::whereIn('id', $selectedInvoiceIds)
                                   ->orderBy('created_at', 'asc')
                                   ->get();

                foreach ($factures as $facture) {
                    // Sécurité type
                    if ($facture->invoice_type !== $validated['type']) continue;
                    // Arrêt si fonds épuisés
                    if ($remainingPayment <= 0) break;

                    // A. Calcul du reste à payer sur la facture
                    $alreadyPaid = DB::table('facture_payments')
                                     ->where('facture_id', $facture->id)
                                     ->sum('amount');

                    $amountDue = $facture->total_amount - $alreadyPaid;

                    // Si facture déjà soldée, on passe
                    if ($amountDue <= 0.01) {
                        if ($facture->status !== 'paid') $facture->update(['status' => 'paid']);
                        continue;
                    }

                    // B. Distribution
                    $amountAllocated = min($remainingPayment, $amountDue);

                    // C. Association
                    $payment->factures()->attach($facture->id, [
                        'amount' => $amountAllocated
                    ]);

                    // D. Mise à jour statut facture
                    $newPaidTotal = $alreadyPaid + $amountAllocated;
                    if ($newPaidTotal >= ($facture->total_amount - 0.05)) {
                        $facture->status = 'paid';
                    } else {
                        $facture->status = 'partial';
                    }
                    $facture->save();

                    // E. Déduction
                    $remainingPayment -= $amountAllocated;
                }
            }
        } 
        // SINON (Si isComplement est VRAI) : 
        // On ne fait rien. Le paiement est enregistré "en l'air" (non lettré).
        // Il apparaîtra dans le solde du client mais ne soldera aucune facture spécifique.

        DB::commit();

        $message = $request->boolean('isComplement') 
            ? 'Versement complémentaire enregistré avec succès.' 
            : 'Règlement enregistré et factures mises à jour.';

        return back()->with('success', $message);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Erreur paiement: ' . $e->getMessage());
        return back()->with('error', 'Erreur système: ' . $e->getMessage());
    }
} 
    public function update(Request $request,$PID){
          $request->validate([
            'client_id' => 'required',
            "bank_id"=>"required",
            "amout"=>"required|numeric",
            "notes"=>"required| string",
            "amout_notes"=>"required |numeric",
            'type' => ['required', 'string'], // <-- Nouveau champ de validation
        ]);

        $payment = Payment::findOrFail($PID);
        $payment->user_id = Auth::user()->id;
        $payment->agency_id = Auth::user()->agency_id;
        $payment->bank_id = $request->bank_id;
        $payment->client_id = $request->client_id;
        $payment->amout = $request->amout;
        $payment->type = $request->type;
        $payment->notes = $request->notes;
        $payment->amout_notes = $request->amout_notes;
            
        $payment->save();
        return back()->with("info","versement updated successfully");
    }
    
    public function associate(Request $request)
    {
        // 1. Validation des données
       
        $request->validate([
            'invoices' => 'required|array',
            'invoices.*' => 'required|exists:factures,id',
        ]);
        $payment= $request->input("payment");
        $payment=  Payment::findOrFail($payment);
        // Assurez-vous que le versement a un client associé
        if (!$payment->client_id) {
            return back()->with('error', 'Le versement sélectionné n\'est pas associé à un client, monsieur.');
        }

        // On démarre une transaction pour s'assurer que toutes les opérations
        // réussissent ou qu'elles sont toutes annulées en cas d'erreur.
        DB::beginTransaction();

        try {
            $invoices = Facture::whereIn('id', $request->invoices)
                ->where('client_id', $payment->client_id)
                ->get();
                
            if ($invoices->isEmpty()) {
                return back()->with('error', 'Aucune facture valide trouvée pour le client de ce versement, monsieur.');
            }


            foreach ($invoices as $invoice) {
             
            
             
                    $invoice->status = 'paid';

                $invoice->save();

                // Enregistrement de l'association dans une table pivot (créer un enregistrement si nécessaire)
                // Assurez-vous d'avoir une relation 'invoices' sur le modèle Payment
                $payment->factures()->attach($invoice->id, [
                    'amount' => $invoice->total_amount,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }


            DB::commit();

            return back()->with('success', 'Les factures ont été associées au versement avec succès, monsieur.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erreur lors de l'association d'un versement : " . $e->getMessage());

            return back()->with('error', 'Une erreur est survenue lors de l\'association des factures. Veuillez réessayer, monsieur.'. $e->getMessage());
        }
    }
      public function disassociate(Request $request)
    {
        // 1. Validation des données
        $request->validate([
            'invoices' => 'required|array',
            'invoices.*' => 'required|exists:factures,id',
        ]);
        $payment = Payment::findOrFail($request["payment"]);
        // On démarre une transaction pour s'assurer que toutes les opérations
        // réussissent ou qu'elles sont toutes annulées en cas d'erreur.
        DB::beginTransaction();

        try {
            // Récupérer les factures à dissocier avec leur montant pivot
            $invoicesToDetach = $payment->factures()->whereIn('factures.id', $request->invoices)->get();
           

            foreach ($invoicesToDetach as $invoice) {
                
                // Si la facture était "payée" et qu'il y a un solde restant,
                // on la repasse en "en attente" ou "partiellement payée"
                if ($invoice->status === 'paid') {
                    $invoice->status = 'pending'; // ou 'pending' selon votre logique
                }
                
                $invoice->save();
                
            }

            // 4. Dissocier les factures du versement dans la table pivot
            $payment->factures()->detach($request->invoices);

            
            
            $payment->save();

            DB::commit();

            return back()->with('success', 'Les factures ont été dissociées du versement avec succès, monsieur.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erreur lors de la dissociation d'un versement : " . $e->getMessage());

            return back()->with('error', 'Une erreur est survenue lors de la dissociation des factures. Veuillez réessayer, monsieur.');
        }
    }
     public function destroy(Payment $payment)
    {
        // On démarre une transaction pour garantir la cohérence des données.
        DB::beginTransaction();

        try {
            // Récupérer toutes les factures associées à ce versement.
            // La relation 'invoices' doit être définie dans le modèle Payment.
            $invoices = $payment->factures;

            if (!Empty($invoices)) {
                foreach ($invoices as $invoice) {
                    $invoice->status = 'pending';
                    $invoice->save();
                }
                
                // Détacher les factures du versement dans la table pivot
                $payment->factures()->detach();
            }

            // Enfin, supprimer le versement.
            $payment->delete();

            DB::commit();

            return back()->with('success', 'Le versement a été supprimé et les factures associées ont été mises à jour, monsieur.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erreur lors de la suppression d'un versement : " . $e->getMessage());
            
            return back()->with('error', 'Une erreur est survenue lors de la suppression. Veuillez réessayer, monsieur.' . $e->getMessage());
        }
    }
    public function exportPaymentsToPdf(Request $request)
    {
        // Récupérer tous les filtres de la requête envoyés par le composant React
        $filters = $request->all();

        // Initialiser la requête Eloquent pour les versements.
        // On charge les relations 'factures', 'client' et 'bank'
        $query = Payment::with(['factures', 'client', 'bank']);
        
        // Appliquer les filtres de manière conditionnelle en fonction des paramètres reçus
        
        // Filtre par Agence (si l'ID de l'agence est fourni)
        $query->when($request->filled('agency_id'), function ($q) use ($request) {
            $q->where('agency_id', $request->input('agency_id'));
        });

        // Filtre par type de versement (si le type est fourni)
        $query->when($request->filled('invoice_type'), function ($q) use ($request) {
            $q->where('type', $request->input('invoice_type'));
        });

        // Filtre par Client (si l'ID du client est fourni)
        $query->when($request->filled('client_id'), function ($q) use ($request) {
            $q->where('client_id', $request->input('client_id'));
        });

        // Filtre par Banque (si l'ID de la banque est fourni)
        $query->when($request->filled('bank_id'), function ($q) use ($request) {
            $q->where('bank_id', $request->input('bank_id'));
        });

        // Filtre par la plage de dates si les deux dates sont fournies
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $start = Carbon::parse($request->input('start_date'))->startOfDay();
            $end = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->whereBetween('created_at', [$start, $end]);
        }
        
        // Exécuter la requête pour obtenir la liste des versements filtrés
        $versements = $query->get();
        
        // Générer le PDF en chargeant la vue Blade et en lui passant les données
    // Générer le PDF en mode paysage
    $pdf = Pdf::loadView('PDF.VersementPDFVIew', compact('versements', 'filters'))
              ->setPaper('a4', 'landscape');

        // Télécharger le fichier PDF avec un nom spécifique
        return $pdf->download('rapport_versements_factures.pdf');
    }

}
