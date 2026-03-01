<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Productsale;
use App\Models\Productsaleitem;
use App\Models\Productstock;
use App\Models\Boutique;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    /**
     * Affiche le tableau de bord des statistiques (KPIs).
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // ATTENTION : Adaptez cette ligne selon comment vous gérez vos rôles
        // Si vous utilisez Spatie : $isDirecteur = $user->hasRole('directeur');
        // Si c'est une colonne 'role' : $isDirecteur = $user->role === 'directeur';
        // Ici, j'utilise une variable booléenne générique pour l'exemple
        $isDirecteur = $user->role === 'directeur'; // À adapter à votre logique

        // --- 1. GESTION DES FILTRES ET DES DROITS ---
        $boutiqueId = null;

        if ($isDirecteur) {
            // Le directeur peut voir toutes les boutiques ou filtrer par une boutique précise
            $boutiqueId = $request->input('boutique_id'); 
        } else {
            // Le contrôleur/magasinier est forcé de ne voir QUE sa propre boutique
            $boutiqueId = $user->boutique_id; 
        }

        // Filtres de dates (Par défaut : Le mois en cours)
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // --- 2. REQUÊTES DE BASE (Pour éviter la répétition de code) ---
        $salesQuery = Productsale::whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                                 ->whereIn('status', ['completed', 'COMPLETED']); // Sécurité sur le statut

        if ($boutiqueId) {
            $salesQuery->where('boutique_id', $boutiqueId);
        }

        // --- 3. CALCUL DES KPI's ---
        $totalRevenue = (clone $salesQuery)->sum('total_ttc');
        $totalTransactions = (clone $salesQuery)->count();
        $averageOrderValue = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        // Requête Stock (Alerte sur les stocks à 5 ou moins)
        $stockQuery = Productstock::where('available_qty', '<=', 5);
        if ($boutiqueId) {
            $stockQuery->where('boutique_id', $boutiqueId);
        }
        $lowStockCount = $stockQuery->count();

        // --- 4. DONNÉES POUR LES GRAPHIQUES ---
        
        // A. Évolution du Chiffre d'Affaires par jour
        $revenueByDay = (clone $salesQuery)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_ttc) as total'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // B. Top 5 des produits les plus vendus (en quantité et en valeur)
        // Utilisation de Jointures SQL pour des performances optimales
        $topProductsQuery = DB::table('productsaleitems')
            ->join('productsales', 'productsaleitems.sale_id', '=', 'productsales.id')
            ->join('products', 'productsaleitems.product_id', '=', 'products.id')
            ->whereBetween('productsales.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->whereIn('productsales.status', ['completed', 'COMPLETED']);

        if ($boutiqueId) {
            $topProductsQuery->where('productsales.boutique_id', $boutiqueId);
        }

        $topSellingProducts = $topProductsQuery
            ->select(
                'products.designation', 
                DB::raw('SUM(productsaleitems.qty) as total_qty'), 
                DB::raw('SUM(productsaleitems.sub_total) as total_revenue')
            )
            ->groupBy('products.id', 'products.designation')
            ->orderByDesc('total_revenue') // Classement par revenu généré
            ->limit(5)
            ->get();

        // --- 5. CHARGEMENT DES LISTES POUR LES FILTRES ---
        $boutiques = [];
        if ($isDirecteur) {
            $boutiques = Boutique::select('id', 'name')->orderBy('name')->get();
        }

        // --- 6. ENVOI À INERTIA / REACT ---
        return Inertia::render('DirBoutique/StatisticsIndex', [
            'isDirecteur' => $isDirecteur,
            'boutiques'   => $boutiques,
            'filters'     => [
                'boutique_id' => (int) $boutiqueId,
                'start_date'  => $startDate,
                'end_date'    => $endDate,
            ],
            'kpis' => [
                'totalRevenue'      => $totalRevenue,
                'totalTransactions' => $totalTransactions,
                'averageOrderValue' => $averageOrderValue,
                'lowStockCount'     => $lowStockCount,
            ],
            'charts' => [
                'revenueByDay'       => $revenueByDay,
                'topSellingProducts' => $topSellingProducts,
            ]
        ]);
    }
}