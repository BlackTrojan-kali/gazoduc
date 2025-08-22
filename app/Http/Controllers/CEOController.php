<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Client;
use App\Models\Facture;
use App\Models\Payment;
use App\Models\Stock;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CEOController extends Controller
{
  public function index()
    {
        // 1. Informations pour les versements consolidés (individuels) paginés
        $individualConsolidatedPayments = Payment::with('client', 'factures')
            ->orderBy('created_at', 'desc')
            ->paginate(13);

        $individualConsolidatedPayments->through(function ($payment) {
            // CORRECTION: La valeur totale du versement est la somme de 'amout' et 'amout_notes'
            $totalPaymentValue = $payment->amout + $payment->amout_notes;

            // La somme des montants totaux des factures associées
            $totalFactureAmount = $payment->factures->sum('total_amount');
            
            // Calcul de la différence
            $difference = $totalPaymentValue - $totalFactureAmount;

            return [
                'client_name' => $payment->client->name ?? 'N/A',
                'payment_date' => Carbon::parse($payment->created_at)->format('Y-m-d'),
                'payment_month_year' => Carbon::parse($payment->created_at)->format('Y-m'),
                'payment_value' => $totalPaymentValue, // Utilisez la nouvelle somme ici
                'total_associated_sales' => $totalFactureAmount,
                'difference' => $difference,
            ];
        });

        // 2. Statistiques consolidées des versements par mois paginées
        $allPaymentsForMonthlyAggregation = Payment::with('factures')->get();

        $tempIndividualPayments = $allPaymentsForMonthlyAggregation->map(function ($payment) {
            // CORRECTION: La valeur totale du versement est la somme de 'amout' et 'amout_notes'
            $totalPaymentValue = $payment->amout + $payment->amout_notes;

            $totalFactureAmount = $payment->factures->sum('total_amount');
            $difference = $totalPaymentValue - $totalFactureAmount;
            return [
                'payment_month_year' => Carbon::parse($payment->created_at)->format('Y-m'),
                'payment_value' => $totalPaymentValue, // Utilisez la nouvelle somme ici
                'total_associated_sales' => $totalFactureAmount,
                'difference' => $difference,
            ];
        });

        $monthlyConsolidatedPayments = $tempIndividualPayments->groupBy('payment_month_year')->map(function ($monthlyPayments, $monthYear) {
            return [
                'month_year' => $monthYear,
                'total_payment_value_month' => $monthlyPayments->sum('payment_value'),
                'total_associated_sales_month' => $monthlyPayments->sum('total_associated_sales'),
                'total_difference_month' => $monthlyPayments->sum('difference'),
            ];
        })->sortByDesc('month_year');

        $perPage = 5;
        $currentPage = \Illuminate\Pagination\LengthAwarePaginator::resolveCurrentPage();
        $currentItems = $monthlyConsolidatedPayments->slice(($currentPage - 1) * $perPage, $perPage)->values();
        $monthlyConsolidatedPaymentsPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $currentItems,
            $monthlyConsolidatedPayments->count(),
            $perPage,
            $currentPage,
            ['path' => \Illuminate\Pagination\LengthAwarePaginator::resolveCurrentPath()]
        );

        // 3. Informations pour les cartes du tableau de bord (restent inchangées)
        $stocks = Stock::with("article", "agency")->get();
        $clients = Client::all();
        $licenceData = Auth::user()->load("entreprise.subscription.licence");
        $subscription = $licenceData->entreprise->subscription;
        $daysRemaining = null;
        if ($subscription && $subscription->date_expiration) {
            $expirationDate = Carbon::parse($subscription->date_expiration);
            $daysRemaining = Carbon::now()->diffInDays($expirationDate, false);
        }
        $globalStockByArticle = $stocks->groupBy('article.name')->map(function ($items) {
            return $items->sum('quantity');
        });

        // 4. Retourner les données à la vue Inertia
        return Inertia("Boss/BossIndex", [
            "consolidatedPayments" => $individualConsolidatedPayments,
            "monthlyConsolidatedPayments" => $monthlyConsolidatedPaymentsPaginator,
            "clientsCount" => $clients->count(),
            "globalStockByArticle" => $globalStockByArticle->toArray(),
            "daysRemainingForLicence" => $daysRemaining,
        ]);
    }
  public function sales(Request $request)
    {
        // 1. Statistiques consolidées des ventes par mois (pour le graphique)
        // Récupérer toutes les factures, peu importe le type, pour le CA global mensuel
        $monthlySalesData = Facture::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month_year, SUM(total_amount) as total_ca')
                                ->groupBy('month_year')
                                ->orderBy('month_year', 'asc') // Trie par mois croissant pour le graphique
                                ->get();

        // Formater les données pour le graphique (si nécessaire, sinon le frontend peut le faire)
        $chartData = $monthlySalesData->map(function ($item) {
            return [
                'month' => Carbon::createFromFormat('Y-m', $item->month_year)->translatedFormat('F Y'), // Ex: "août 2023"
                'total_ca' => (int) $item->total_ca, // Assurez-vous que c'est un entier ou float
            ];
        });


        // 2. Statistiques globales par agence (pour le tableau avec filtres)
        // Récupérer les filtres de la requête
        $filterAgencyId = $request->input('agency_id');
        $filterInvoiceType = $request->input('invoice_type'); // 'Vente', 'Consigne', ou null pour tous

        $agencySalesQuery = Facture::query();

        if ($filterAgencyId) {
            $agencySalesQuery->where('agency_id', $filterAgencyId);
        }
        if ($filterInvoiceType) {
            $agencySalesQuery->where('invoice_type', $filterInvoiceType);
        }

        $agencySales = $agencySalesQuery->with('agency')
                                        ->selectRaw('agency_id, invoice_type, SUM(total_amount) as total_ca')
                                        ->groupBy('agency_id', 'invoice_type')
                                        ->get()
                                        ->map(function ($item) {
                                            return [
                                                'agency_name' => $item->agency->name ?? 'Agence Inconnue',
                                                'invoice_type' => $item->invoice_type,
                                                'total_ca' => (int) $item->total_ca,
                                            ];
                                        });

        // Pour le filtre côté frontend, il est utile d'envoyer la liste des agences et des types d'invoice
        $agencies = Agency::select('id', 'name')->get();
        $invoiceTypes = ['Vente', 'Consigne']; // Ou récupérer dynamiquement si d'autres types existent


        return Inertia("Boss/CA", [
            "monthlyChartData" => $chartData,
            "agencySalesData" => $agencySales,
            "agencies" => $agencies, // Liste des agences pour les filtres
            "invoiceTypes" => $invoiceTypes, // Types d'invoice pour les filtres
            "selectedAgencyId" => $filterAgencyId, // Pour maintenir l'état du filtre côté frontend
            "selectedInvoiceType" => $filterInvoiceType, // Pour maintenir l'état du filtre côté frontend
        ]);
    }
}
