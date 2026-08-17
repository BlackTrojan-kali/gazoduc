<?php

namespace App\Http\Controllers;

    use App\Models\BoutiquePayment;
use App\Models\ProductSale;
use App\Models\UnassociatedFacture; // Import du modèle tampon
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductPaymentController extends Controller
{
    //

// 1. MÉTHODE POUR AFFICHER LA PAGE (Passer les données à la modale)
/**
     * Affiche l'historique des versements avec filtres.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // On récupère les paiements liés à la boutique de l'utilisateur (via le User ou le Counter)
        // On charge la relation 'productSales' pour voir quelles factures ont été payées
        $query = BoutiquePayment::with(['user', 'counter', 'productSales.customer'])
            ->where('user_id', $user->id) // Ou ->where('counter_id', $user->counter_id) selon votre logique métier
            ->orderBy('created_at', 'desc');

        // 1. Filtre Recherche (Référence ou Montant)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('amount', 'like', "%{$search}%")
                  ->orWhere('label', 'like', "%{$search}%");
            });
        }

        // 2. Filtre Date
        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        $payments = $query->paginate(20)->withQueryString();

        return Inertia::render('ComBoutique/PaymentsHistory', [
            'payments' => $payments,
            'filters'  => $request->only(['search', 'date_start', 'date_end']),
        ]);
    }

// 2. MÉTHODE POUR ENREGISTRER LE VERSEMENT
public function store(Request $request)
{
    $validated = $request->validate([
        'amount'         => 'required|numeric|min:1',
        'counter_id'     => 'nullable|exists:counters,id',
        'reference'      => 'nullable|string',
        'label'          => 'nullable|string',
        'selected_sales' => 'required|array|min:1', // Obligatoire de sélectionner
        'selected_sales.*' => 'exists:productsales,id',
    ]);

    DB::transaction(function () use ($validated) {
        $user = Auth::user();

        // A. Création du Versement
        $payment = BoutiquePayment::create([
            'counter_id'   => $validated['counter_id'] ?? $user->counter_id,
            'user_id'      => $user->id,
            'amount'       => $validated['amount'],
            'label'        => $validated['label'] ?? 'Règlement factures en attente',
            'label_amount' => $validated['amount'],
            'reference'    => $validated['reference'],
        ]);

        // B. Lier les ventes au paiement (Table pivot)
        $payment->productSales()->attach($validated['selected_sales']);

        // C. Mettre à jour le statut des ventes (Optionnel : marquer comme payé)
        // ProductSale::whereIn('id', $validated['selected_sales'])->update(['payment_status' => 'paid']);

        // ---------------------------------------------------------
        // D. NETTOYAGE DE LA TABLE UNASSOCIATED (Cœur de votre demande)
        // ---------------------------------------------------------
        
        // 1. Verrouiller la ligne pour éviter les conflits
        $unassociated = UnassociatedFacture::lockForUpdate()->first();

        if ($unassociated) {
            // Récupérer les IDs actuels en base
            $currentIds = $unassociated->product_sales_id ?? [];
            
            // Les IDs qu'on vient de traiter/payer
            $processedIds = $validated['selected_sales'];

            // On retire les IDs traités du tableau original (différence de tableaux)
            $remainingIds = array_diff($currentIds, $processedIds);

            // Mise à jour avec les IDs restants (array_values pour réindexer proprement [0,1,2...])
            $unassociated->update([
                'product_sales_id' => array_values($remainingIds)
            ]);
        }
        // ---------------------------------------------------------
    });

    return redirect()->back()->with('success', 'Versement effectué et factures associées retirées de la liste d\'attente.');
}
/**
     * Génère le PDF des versements sur une période.
     */
    public function downloadReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $user = Auth::user();
        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();

        // Récupération des données pour le PDF
        $payments = BoutiquePayment::with(['user', 'productSales'])
            ->where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get();

        $totalPeriod = $payments->sum('amount');

        // Génération PDF
        $pdf = Pdf::loadView('boutique_pdf.payments_history', [
            'payments'     => $payments,
            'start_date'   => $startDate,
            'end_date'     => $endDate,
            'total_period' => $totalPeriod,
            'generated_by' => $user,
            'boutique'     => $user->boutique ?? null // Si relation existe
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('Rapport_Versements_' . $startDate->format('dmY') . '.pdf');
    }

}
