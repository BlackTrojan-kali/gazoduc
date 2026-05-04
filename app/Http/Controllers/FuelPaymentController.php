<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\FuelPaymentsExport;
use App\Models\Agency;
use App\Models\Bank;
use App\Models\Client;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class FuelPaymentController extends Controller
{
    /**
     * Affiche la liste des paiements de carburant (is_fuel = true).
     */
    public function index()
    {
        $payments = Payment::where('is_fuel', true)
            ->with(['agency', 'bank', 'client'])
            ->latest()
            ->paginate(15);
    
        $agencies = Agency::all();
        $banks = Bank::all();
        $clients= Client::all();
          if(Auth::user()->role->name !=="direction"){
        $clients= Client::where("agency_id",Auth::user()->agency_id)->with("category")->get();
            
        } 
        if(Auth::user()->role->name != "direction"){
            $agencies = Agency::where("id",Auth::user()->agency_id)->get();

        }
        return Inertia('Fuel/FuelPaymentHistory', compact('payments','agencies','banks','clients'));
    }

    /**
     * Affiche le formulaire de création de paiement de carburant.
     */
    public function create()
    {
        // Ex: charger les agences, banques, clients si nécessaire
        // $agencies = Agency::all();
        // $banks = Bank::all();
        // $clients = Client::all();

        return Inertia::render('FuelPayments/Create', [
            // 'agencies' => $agencies,
            // 'banks' => $banks,
            // 'clients' => $clients,
        ]);
    }

    /**
     * Enregistre un nouveau paiement de carburant.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'amout' => 'required|numeric|min:0.01',
            'type' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'amout_notes' => 'nullable|string|max:1000',
            'bordereau' => 'nullable|string|max:255',
            'bank_id' => 'nullable|exists:banks,id',
            'client_id' => 'required|exists:clients,id',
        ]);
        dd($validatedData);

        try {
            Payment::create([
                'user_id' => AUth::user()->id,
                'is_fuel' => true,
                ...$validatedData,
            ]);

            return redirect()->route('fuel_payments.index')
                ->with('success', 'Le paiement de carburant a été enregistré avec succès.');
        } catch (\Exception $e) {
            Log::error("Erreur lors de la création d’un paiement de carburant : " . $e->getMessage());
            return redirect()->back()->withInput()
                ->with('error', 'Échec de l’enregistrement du paiement. Veuillez réessayer.');
        }
    }

    /**
     * Affiche les détails d’un paiement spécifique.
     */
    public function show(Payment $payment)
    {
        if (!$payment->is_fuel) {
            abort(404, "Ce paiement n'est pas un paiement de carburant.");
        }

        $payment->load(['agency', 'bank', 'client', 'factures']);

        return Inertia::render('FuelPayments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Met à jour un paiement de carburant existant.
     */
    public function update(Request $request, Payment $payment)
    {
        if (!$payment->is_fuel) {
            return redirect()->back()->with('error', 'Impossible de modifier un paiement non-carburant.');
        }

        $validatedData = $request->validate([
            'amout' => 'sometimes|required|numeric|min:0.01',
            'type' => 'sometimes|required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'amout_notes' => 'nullable|string|max:1000',
            'bordereau' => 'nullable|string|max:255',
            'agency_id' => 'sometimes|required|exists:agencies,id',
            'bank_id' => 'nullable|exists:banks,id',
            'client_id' => 'sometimes|required|exists:clients,id',
        ]);

        try {
            $payment->update($validatedData);

            return redirect()->route('fuel_payments.show', $payment->id)
                ->with('success', 'Paiement de carburant mis à jour avec succès.');
        } catch (\Exception $e) {
            Log::error("Erreur lors de la mise à jour du paiement {$payment->id} : " . $e->getMessage());
            return redirect()->back()->withInput()
                ->with('error', 'Échec de la mise à jour du paiement.');
        }
    }

    /**
     * Supprime un paiement de carburant.
     */
    public function destroy(Payment $payment)
    {
        if (!$payment->is_fuel) {
            return redirect()->back()->with('error', 'Ce paiement ne peut être supprimé via ce contrôleur.');
        }

        try {
            $id = $payment->id;
            $payment->delete();

            return redirect()->route('fuel_payments.index')
                ->with('success', "Paiement de carburant ID {$id} supprimé avec succès.");
        } catch (\Exception $e) {
            Log::error("Erreur lors de la suppression du paiement {$payment->id} : " . $e->getMessage());
            return redirect()->back()->with('error', 'Échec de la suppression du paiement.');
        }
    }

    /**
     * Exporte la liste des paiements de carburant au format PDF.
     */
    public function exportPdf()
    {
        $payments = Payment::where('is_fuel', true)
            ->with(['agency', 'bank', 'client'])
            ->latest()
            ->get();

        $pdf = Pdf::loadView('PDF/fuel_payments', compact('payments'));

        return $pdf->download('paiements_carburant.pdf');
    }

    /**
     * Exporte la liste des paiements de carburant au format Excel.
     */
    public function exportExcel()
    {
        return Excel::download(new FuelPaymentsExport, 'paiements_carburant.xlsx');
    }
}
