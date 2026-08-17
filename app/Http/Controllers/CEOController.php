<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Client;
use App\Models\Facture;
use App\Models\Payment;
use App\Models\Stock;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CEOController extends Controller
{
    /**
     * TABLEAU DE BORD GLOBAL (Focus Principal + Résumé)
     */
    public function index()
    {
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;
        $lastMonth = Carbon::now()->subMonth();

        // --- 1. Inventaire Global ---
        // Relation 'stock' (hasMany) -> agrégat 'stock_sum_quantity'
        $articlesWithTotalStock = Article::query()
            ->select(['id', 'code', 'name', 'unit'])
            ->withSum('stock', 'quantity')
            ->having('stock_sum_quantity', '>', 0)
            ->orderBy('name')
            ->get();

        // --- 2. Statut Licence ---
        $licenseDaysRemaining = 0;
        $activeSubscription = Subscription::where('is_active', true)
            ->whereDate('date_expiration', '>', now())
            ->orderBy('date_expiration', 'desc')
            ->first();

        if ($activeSubscription) {
            $licenseDaysRemaining = Carbon::now()->diffInDays($activeSubscription->date_expiration, false);
            $licenseDaysRemaining = max(0, (int)$licenseDaysRemaining);
        }

        // --- 3. Métriques Clients & Utilisateurs ---
        $totalClients = Client::count();
        // On compte les utilisateurs actifs (hors SuperAdmin)
        $activeUsers = User::where('role_id', '!=', 1)->count(); 

        // --- 4. KPIs Financiers (Factures uniquement) ---
        $ca_current_year = Facture::whereYear('created_at', $currentYear)->sum('total_amount');
        
        $ca_current_month = Facture::whereYear('created_at', $currentYear)
            ->whereMonth('created_at', $currentMonth)
            ->sum('total_amount');

        $ca_last_month = Facture::whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->sum('total_amount');

        // Calcul Croissance MoM
        if ($ca_last_month == 0) {
            $growthRate = $ca_current_month > 0 ? '+100%' : '0%';
        } else {
            $growth = (($ca_current_month - $ca_last_month) / $ca_last_month) * 100;
            $growthRate = ($growth > 0 ? '+' : '') . number_format($growth, 1) . '%';
        }

        return Inertia::render('Boss/BossIndex', [
            'stats' => [
                'monthlyRevenue' => number_format($ca_current_month, 0, ',', ' ') . ' F',
                'yearlyRevenue' => number_format($ca_current_year, 0, ',', ' ') . ' F',
                'growthRate' => $growthRate,
                'licenseDaysRemaining' => $licenseDaysRemaining,
                'totalClients' => $totalClients,
                'activeUsers' => $activeUsers,
                // Correction : On compte toutes les factures car 'payment_status' n'existe pas
                'completedProjects' => Facture::count(), 
                'weeklyAppointments' => 0, 
            ],
            'inventorySummary' => $articlesWithTotalStock,
        ]);
    }

    /**
     * ANALYSE DÉTAILLÉE DU CHIFFRE D'AFFAIRES (Ventes vs Consignes)
     */
    public function sales()
    {
        $currentYear = Carbon::now()->year;

        // --- 1. Graphique Mensuel ---
        $monthlyRaw = Facture::selectRaw('
                MONTH(created_at) as month,
                invoice_type,
                SUM(total_amount) as total
            ')
            ->whereYear('created_at', $currentYear)
            ->groupBy('month', 'invoice_type')
            ->get();

        $monthlySalesChart = collect(range(1, 12))->map(function ($m) use ($monthlyRaw) {
            return [
                'month' => Carbon::create()->month($m)->locale('fr')->shortMonthName,
                'vente' => $monthlyRaw->where('month', $m)->where('invoice_type', 'vente')->sum('total'),
                'consigne' => $monthlyRaw->where('month', $m)->where('invoice_type', 'consigne')->sum('total'),
            ];
        });

        // --- 2. Tableaux par Agence ---
        $agencyRaw = Facture::selectRaw('
                agency_id,
                MONTH(created_at) as month,
                invoice_type,
                SUM(total_amount) as total
            ')
            ->whereYear('created_at', $currentYear)
            ->with('agency:id,name')
            ->groupBy('agency_id', 'month', 'invoice_type')
            ->get();

        $formatByAgency = function ($type) use ($agencyRaw) {
            return $agencyRaw->where('invoice_type', $type)
                ->groupBy('agency_id')
                ->map(function ($rows) {
                    $agencyName = $rows->first()->agency->name ?? 'Inconnu';
                    $totals = collect(range(1, 12))->map(fn($m) => $rows->where('month', $m)->sum('total'));
                    return [
                        'agency' => $agencyName,
                        'monthlyTotals' => $totals,
                        'totalYear' => $totals->sum()
                    ];
                })->values();
        };

        return Inertia::render('Boss/CA', [
            'charts' => [
                'monthlySales' => $monthlySalesChart,
            ],
            'tables' => [
                'ventes' => $formatByAgency('vente'), 
                'consignes' => $formatByAgency('consigne'), // Assurez-vous que 'consigne' correspond à votre valeur en BDD
            ],
            'year' => $currentYear,
        ]);
    }

    /**
     * RAPPORT DE TRÉSORERIE (Versements vs Factures liées)
     */
    public function paymentReport()
    {
        $year = now()->year;

        // Utilisation stricte des champs 'amout' et 'amout_notes' du modèle Payment
        $report = DB::table('payments')
            ->join('banks', 'banks.id', '=', 'payments.bank_id')
            ->join('agencies', 'agencies.id', '=', 'payments.agency_id')
            ->leftJoin('facture_payments', 'facture_payments.payment_id', '=', 'payments.id')
            ->leftJoin('factures', 'factures.id', '=', 'facture_payments.facture_id')
            ->selectRaw('
                YEAR(payments.created_at) as year,
                MONTH(payments.created_at) as month,
                payments.type,
                banks.name as bank_name,
                agencies.name as agency_name,
                SUM(COALESCE(payments.amout, 0)) as total_versement,
                SUM(COALESCE(payments.amout_notes, 0)) as total_notes,
                SUM(COALESCE(factures.total_amount, 0)) as total_facture,
                (SUM(COALESCE(payments.amout, 0)) + SUM(COALESCE(payments.amout_notes, 0)) - SUM(COALESCE(factures.total_amount, 0))) as ecart
            ')
            ->where('payments.is_fuel', '!=', 1) // On exclut le carburant
            ->whereYear('payments.created_at', $year)
            ->groupByRaw('year, month, payments.type, bank_name, agency_name')
            ->orderBy('month')
            ->get();

        $grouped = $report->groupBy('month')->map(function ($items) {
            return [
                'month_label' => Carbon::create()->month($items->first()->month)->locale('fr')->monthName,
                'details' => $items,
                'totals' => [
                    'versements' => $items->sum('total_versement'),
                    'notes' => $items->sum('total_notes'),
                    'factures' => $items->sum('total_facture'),
                    'ecart' => $items->sum('ecart'),
                ]
            ];
        });

        return Inertia::render('Boss/PaymentReport', [
            'year' => $year,
            'grouped' => $grouped,
        ]);
    }

    /**
     * RAPPORT CONSOLIDÉ DES VENTES ARTICLES
     */
    public function articlesConsolidated()
    {
        $year = Carbon::now()->year;

        $data = DB::table('facture_items')
            ->join('factures', 'facture_items.facture_id', '=', 'factures.id')
            ->join('agencies', 'factures.agency_id', '=', 'agencies.id')
            ->join('articles', 'facture_items.article_id', '=', 'articles.id')
            ->selectRaw('
                YEAR(factures.created_at) as year,
                MONTH(factures.created_at) as month,
                agencies.name as agency_name,
                factures.invoice_type,
                articles.name as article_name,
                articles.code as article_code,
                COUNT(DISTINCT facture_items.article_id) as articles_count_distinct,
                SUM(facture_items.quantity) as total_quantity
            ')
            ->whereYear('factures.created_at', $year)
            ->groupByRaw('year, month, agency_name, factures.invoice_type, articles.name, articles.code')
            ->orderBy('month')
            ->get();

        $grouped = $data->groupBy('month')->map(function ($items) {
            return [
                'month_name' => Carbon::create()->month($items->first()->month)->locale('fr')->monthName,
                'details' => $items,
                'totals' => [
                    'quantity' => $items->sum('total_quantity'),
                    'lines_count' => $items->count(), 
                ],
            ];
        });

        return Inertia::render('Boss/ArticleConsolidated', [
            'year' => $year,
            'grouped' => $grouped,
        ]);
    }

    /* -------------------------------------------------------------------------- */
    /* MODULE CARBURANT                                                           */
    /* -------------------------------------------------------------------------- */

    public function choose_fuel()
    {
        return Inertia::render("SelectCeoLicence");
    }

    public function fuel_index()
    {
        $year = Carbon::now()->year;

        $data = DB::table('fuel_sales')
            ->join('articles', 'fuel_sales.article_id', '=', 'articles.id')
            ->join('agencies', 'fuel_sales.agency_id', '=', 'agencies.id')
            ->selectRaw('
                YEAR(fuel_sales.created_at) as year,
                MONTH(fuel_sales.created_at) as month,
                agencies.name as agency_name,
                articles.name as article_name,
                SUM(fuel_sales.quantity) as total_quantity,
                SUM(fuel_sales.total_price) as total_revenue
            ')
            ->whereYear('fuel_sales.created_at', $year)
            ->groupByRaw('year, month, agency_name, articles.name')
            ->orderBy('month')
            ->orderBy('agency_name')
            ->get();

        $grouped = $data->groupBy('month')->map(function ($items) {
            return [
                'month_name' => Carbon::create()->month($items->first()->month)->locale('fr')->monthName,
                'details' => $items,
                'totals' => [
                    'quantity' => $items->sum('total_quantity'),
                    'revenue' => $items->sum('total_revenue'),
                ],
            ];
        });

        return Inertia::render('BossFuel/FuelConsolidated', [
            'year' => $year,
            'grouped' => $grouped,
        ]);
    }

    public function fuel_stock_consolidated()
    {
        $data = Stock::query()
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->join('agencies', 'stocks.agency_id', '=', 'agencies.id')
            ->selectRaw('
                agencies.name as agency_name,
                articles.name as article_name,
                SUM(stocks.quantity) as total_quantity,
                SUM(stocks.theorical_quantity) as total_theorical_quantity,
                (SUM(stocks.quantity) - SUM(stocks.theorical_quantity)) as gap
            ')
            ->where('stocks.storage_type', 'carburant') 
            ->groupBy('agencies.name', 'articles.name')
            ->orderBy('agencies.name')
            ->get();

        return Inertia::render('BossFuel/FuelStockConsolidated', [
            'report' => $data,
        ]);
    }

    public function fuel_payments_consolidated()
    {
        $year = Carbon::now()->year;

        // Utilisation du champ 'amout'
        $data = Payment::query()
            ->join('agencies', 'payments.agency_id', '=', 'agencies.id')
            ->leftJoin('facture_payments', 'payments.id', '=', 'facture_payments.payment_id')
            ->selectRaw('
                YEAR(payments.created_at) as year,
                MONTH(payments.created_at) as month,
                agencies.name as agency_name,
                SUM(payments.amout) as total_amount,
                COUNT(payments.id) as count_payments
            ')
            ->whereYear('payments.created_at', $year)
            ->where('payments.is_fuel', 1)
            ->whereNull('facture_payments.payment_id') 
            ->groupByRaw('year, month, agency_name')
            ->orderBy('month')
            ->get();

        $grouped = $data->groupBy('month')->map(function ($items) {
            return [
                'month' => $items->first()->month,
                'month_name' => Carbon::create()->month($items->first()->month)->locale('fr')->monthName,
                'agencies_details' => $items,
                'total_amount' => $items->sum('total_amount'),
                'total_payments' => $items->sum('count_payments'),
            ];
        });

        return Inertia::render('BossFuel/FuelPaymentConsolidated', [
            'year' => $year,
            'report' => $grouped,
        ]);
    }
}