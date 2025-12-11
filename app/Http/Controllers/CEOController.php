<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Client;
use App\Models\Subscription;
use App\Models\Facture; // NOUVEL IMPORT pour les calculs de CA
use App\Models\Payment;
use App\Models\Stock;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB; // Ajouté pour les requêtes Raw/Agrégation

class CEOController extends Controller
{
    /**
     * Affiche le tableau de bord du Boss/CEO avec un résumé de l'inventaire global et les statistiques financières consolidées.
     */
    public function index()
    {
        // 1. Inventaire global
        $articlesWithTotalStock = Article::query()
            ->select(['id', 'code', 'name', 'unit'])
            ->withSum('stock', 'quantity')
            ->having('stock_sum_quantity', '>', 0)
            ->orderBy('name')
            ->get();

        // --- 2. Calcul du statut de la licence (Jours Restants) ---
        $licenseDaysRemaining = 0;
        
        $activeSubscription = Subscription::where('is_active', true)
            ->orderBy('date_expiration', 'desc')
            ->first();

        if ($activeSubscription) {
            $expirationDate = Carbon::parse($activeSubscription->date_expiration);
            // 'false' assure que la différence est négative si la date d'expiration est passée.
            $diffInDays = Carbon::now()->diffInDays($expirationDate, false); 
            $licenseDaysRemaining = max(0, $diffInDays);
        }

        // --- 3. Nombre total de clients ---
        $totalClients = Client::count();

        // --- 4. Calcul du Chiffre d'Affaires (CA) consolidé (Logique intégrée) ---
        $currency = 'F';
        
        // CA de l'année en cours (toutes agences confondues)
        $ca_current_year = Facture::query()
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('total_amount');

        // CA du mois en cours (toutes agences confondues)
        $ca_current_month = Facture::query()
            ->whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->sum('total_amount');
            
        // CA du mois dernier pour le calcul de la croissance MoM
        $last_month_revenue = Facture::query()
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->sum('total_amount');

        // Calcul du taux de croissance MoM
        $growthRate = 'N/A';
        if ($last_month_revenue == 0) {
            $growthRate = $ca_current_month > 0 ? '+100%' : 'N/A';
        } else {
            $growth = (($ca_current_month - $last_month_revenue) / $last_month_revenue) * 100;
            $growthRate = number_format($growth, 1) . '%';
        }
        
        // Formatage pour l'affichage dans la vue React
        $monthlyRevenueFormatted =  number_format($ca_current_month, 0, ',', ' ') . ' ' . $currency;
        $yearlyRevenueFormatted = number_format($ca_current_year, 0, ',', ' ') . ' ' . $currency;
        $activeUser = User::where("role_id","!=",1)->count();

        // Les données passées à la vue 'BossIndex'
        $dashboardData = [
            'stats' => [
                // Stats Financières (CA Annuel et Mensuel)
                'monthlyRevenue' => $monthlyRevenueFormatted, 
                'yearlyRevenue' => $yearlyRevenueFormatted, // Le CA annuel consolidé
                'growthRate' => $growthRate,
                
                // Stats Opérationnelles
                'licenseDaysRemaining' => $licenseDaysRemaining, 
                'totalClients' => $totalClients, 

                // Stats Dummy (à remplacer par votre logique métier réelle)
                'activeUsers' =>$activeUser, 
                'completedProjects' => 85,
                'weeklyAppointments' => 12,
            ],
            'inventorySummary' => $articlesWithTotalStock,
        ];

        return Inertia::render('Boss/BossIndex', $dashboardData);
    }
    
    /**
     * Nouvelle fonction pour afficher les chiffres d'affaires consolidés (Mensuel, Agence, Type).
     */
    public function sales()
    {
        $currentYear = Carbon::now()->year;

        // --- 1️⃣ Graphiques mensuels : CA ventes et consignes par mois ---
        $monthlyData = Facture::select(
                DB::raw('MONTH(created_at) as month'),
                'invoice_type',
                DB::raw('SUM(total_amount) as total')
            )
            ->whereYear('created_at', $currentYear)
            ->groupBy('month', 'invoice_type')
            ->orderBy('month')
            ->get()
            ->groupBy('invoice_type');

        // Organisation des données pour le graphique
        $months = collect(range(1, 12))->map(fn($m) => Carbon::create()->month($m)->format('M'));

        $monthlySalesChart = $months->map(function ($monthName, $index) use ($monthlyData) {
            $monthNumber = $index + 1;
            return [
                'month' => $monthName,
                'vente' => $monthlyData->get(Facture::TYPE_VENTE)?->firstWhere('month', $monthNumber)->total ?? 0,
                'consigne' => $monthlyData->get(Facture::TYPE_CONSIGNE)?->firstWhere('month', $monthNumber)->total ?? 0,
            ];
        });

        // --- 2️⃣ Tableaux : CA ventes et consignes par agence et par mois ---
        $byAgencyAndMonth = Facture::select(
                'agency_id',
                DB::raw('MONTH(created_at) as month'),
                'invoice_type',
                DB::raw('SUM(total_amount) as total')
            )
            ->whereYear('created_at', $currentYear)
            ->groupBy('agency_id', 'month', 'invoice_type')
            ->with('agency:id,name')
            ->get();

        // Séparer ventes et consignes
        $ventesByAgency = $byAgencyAndMonth->where('invoice_type', Facture::TYPE_VENTE);
        $consignesByAgency = $byAgencyAndMonth->where('invoice_type', Facture::TYPE_CONSIGNE);

        // Format simplifié pour la vue
        $ventesTable = $ventesByAgency->groupBy('agency_id')->map(function ($records) {
            $agencyName = optional($records->first()->agency)->name ?? 'Non défini';
            $monthlyTotals = collect(range(1, 12))->map(function ($m) use ($records) {
                return $records->firstWhere('month', $m)->total ?? 0;
            });
            return [
                'agency' => $agencyName,
                'monthlyTotals' => $monthlyTotals,
            ];
        })->values();

        $consignesTable = $consignesByAgency->groupBy('agency_id')->map(function ($records) {
            $agencyName = optional($records->first()->agency)->name ?? 'Non défini';
            $monthlyTotals = collect(range(1, 12))->map(function ($m) use ($records) {
                return $records->firstWhere('month', $m)->total ?? 0;
            });
            return [
                'agency' => $agencyName,
                'monthlyTotals' => $monthlyTotals,
            ];
        })->values();

        // Envoi des données à React
        return Inertia::render('Boss/CA', [
            'charts' => [
                'monthlySales' => $monthlySalesChart,
            ],
            'tables' => [
                'ventes' => $ventesTable,
                'consignes' => $consignesTable,
            ],
            'year' => $currentYear,
        ]);
    }
public function paymentReport()
{
    $year = now()->year;

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
            SUM(payments.amout) as total_versement,
            SUM(payments.amout_notes) as total_notes,
            SUM(factures.total_amount) as total_facture,
            (SUM(payments.amout) + SUM(payments.amout_notes) - SUM(factures.total_amount)) as ecart
        ')->where("payments.is_fuel","!=",1)
        ->whereYear('payments.created_at', $year)
        ->groupBy('year', 'month', 'payments.type', 'bank_name', 'agency_name')
        ->orderBy('month')
        ->get();

    // Regrouper les résultats par mois pour affichage graphique ou tableau
    $grouped = $report->groupBy('month')->map(function ($items) {
        return [
            'details' => $items,
            'totals' => [
                'versements' => $items->sum('total_versement'),
                'notes' => $items->sum('total_notes'),
                'factures' => $items->sum('total_facture'),
                'ecart' => $items->sum('ecart'),
            ]
        ];
    });

    return inertia('Boss/PaymentReport', [
        'year' => $year,
        'report' => $report,
        'grouped' => $grouped,
    ]);
}
public function articlesConsolidated()
{
    $year = Carbon::now()->year;

    $data = DB::table('facture_items')
        ->join('factures', 'facture_items.facture_id', '=', 'factures.id')
        ->join('agencies', 'factures.agency_id', '=', 'agencies.id')
        ->join('articles', 'facture_items.article_id', '=', 'articles.id') // 🔹 Nouvelle jointure
        ->selectRaw('
            YEAR(factures.created_at) as year,
            MONTH(factures.created_at) as month,
            agencies.name as agency_name,
            factures.invoice_type,
            articles.name as article_name, -- 🔹 Récupération du nom de l’article
            COUNT(DISTINCT facture_items.article_id) as articles_count,
            SUM(facture_items.quantity) as total_quantity
        ')
        ->whereYear('factures.created_at', $year)
        ->groupBy('year', 'month', 'agency_name', 'factures.invoice_type', 'articles.name') // 🔹 Ajout de articles.name au groupBy
        ->orderBy('month')
        ->get();

    // 🔹 Regrouper par mois avec totaux globaux
    $grouped = $data->groupBy('month')->map(function ($items) {
        return [
            'details' => $items,
            'totals' => [
                'quantity' => $items->sum('total_quantity'),
                'articles' => $items->sum('articles_count'),
            ],
        ];
    });

    return inertia('Boss/ArticleConsolidated', [
        'year' => $year,
        'report' => $data,
        'grouped' => $grouped,
    ]);
}    
/******************************************************************************************** */
/*|                           FUEL PART FUEL PART FUEL PART FUEL PART                        |*/
/******************************************************************************************** */
public function choose_fuel(){
    return Inertia("SelectCeoLicence");
}

public function fuel_index()
{
    $year = Carbon::now()->year;

    // 🔹 Récupération des ventes consolidées
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
        ->groupBy('year', 'month', 'agency_name', 'articles.name')
        ->orderBy('month')
        ->get();

    // 🔹 Regrouper par mois pour l'affichage
    $grouped = $data->groupBy('month')->map(function ($items) {
        return [
            'details' => $items,
            'totals' => [
                'quantity' => $items->sum('total_quantity'),
                'revenue' => $items->sum('total_revenue'),
            ],
        ];
    });

    // 🔹 Retour vers la vue Inertia
    return Inertia::render('BossFuel/FuelConsolidated', [
        'year' => $year,
        'report' => $data,
        'grouped' => $grouped,
    ]);
}

public function fuel_stock_consolidated()
{
    $data = Stock::query()
        ->join('articles', 'stocks.article_id', '=', 'articles.id')
        ->selectRaw('
            articles.name as article_name,
            SUM(stocks.quantity) as total_quantity,
            SUM(stocks.theorical_quantity) as total_theorical_quantity
        ')
        ->where('stocks.storage_type', 'carburant')
        ->groupBy('articles.name')
        ->orderBy('articles.name')
        ->get();

    return Inertia::render('BossFuel/FuelStockConsolidated', [
        'report' => $data,
    ]);
}

public function fuel_payments_consolidated()
{
    $year = Carbon::now()->year;

    // 🔹 Récupère uniquement les versements de carburant non liés à des factures
    $data = Payment::query()
        ->join('agencies', 'payments.agency_id', '=', 'agencies.id')
        ->leftJoin('facture_payments', 'payments.id', '=', 'facture_payments.payment_id')
        ->selectRaw('
            YEAR(payments.created_at) as year,
            MONTH(payments.created_at) as month,
            SUM(payments.amout) as total_amount,
            COUNT(payments.id) as total_payments
        ')
        ->whereYear('payments.created_at', $year)
        ->where('payments.is_fuel', 1)
        ->whereNull('facture_payments.payment_id') // Exclure les versements associés à une facture
        ->groupBy('year', 'month')
        ->orderBy('month')
        ->get();

    // 🔹 Regroupe et formate pour l’affichage React
    $formatted = $data->map(function ($item) {
        return [
            'month' => $item->month,
            'month_name' => ucfirst(Carbon::create()->month($item->month)->locale('fr')->monthName),
            'total_amount' => (float) $item->total_amount,
            'total_payments' => (int) $item->total_payments,
        ];
    });

    return Inertia::render('BossFuel/FuelPaymentConsolidated', [
        'year' => $year,
        'report' => $formatted,
    ]);
}
}