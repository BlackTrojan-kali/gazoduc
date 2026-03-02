<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\Boutiquepayment;
use App\Models\Chauffeur;
use App\Models\City;
use App\Models\Product;
use App\Models\ProductMove;
use App\Models\Productsale;
use App\Models\Producttransfert;
use App\Models\Region;
use App\Models\Vehicule;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DirBoutiqueController extends Controller
{
    //
    public function index(){
        $cities= City::all();
        $regions= Region::all();
        $boutiques = Boutique::with("region","city")->get();
        return Inertia("DirBoutique/DirBoutiqueIndex",compact("cities","boutiques","regions"));
    }
    /**
     * Affiche l'historique global des mouvements (Multi-tenant: Contrôleur vs Directeur).
     */
    public function history(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::user();
        $isDirecteur = $user->role->name === 'direction';

        // 1. Base de la requête avec les relations nécessaires
        $query = ProductMove::query()
            ->with([
                'product:id,designation,sku',   // Le produit concerné
                'boutique:id,name',             // La boutique où ça s'est passé
                'user:id,first_name,last_name'  // Qui a fait l'action
            ]);

        // --- SÉCURITÉ MULTI-TENANT ---
        // Le contrôleur ne peut voir que les mouvements (Entrées/Sorties) de sa propre boutique
        if (!$isDirecteur) {
            $query->where('boutique_id', $user->boutique_id);
        }

        // 2. Filtre Global (Recherche texte)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('product', function($subQ) use ($search) {
                    $subQ->where('designation', 'like', "%{$search}%")
                         ->orWhere('sku', 'like', "%{$search}%");
                })
                ->orWhereHas('user', function($subQ) use ($search) {
                    $subQ->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%");
                })
                ->orWhere('label', 'like', "%{$search}%"); // Recherche aussi dans le motif
            });
        }

        // 3. Filtre par Boutique (Spécifique pour le Directeur)
        if ($request->filled('boutique_id') && $isDirecteur) {
            $query->where('boutique_id', $request->boutique_id);
        }

        // 4. Filtre par Type (Entrée / Sortie)
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // 5. Filtre par Période
        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        // 6. Exécution : Tri par défaut (plus récent) et Pagination
        $moves = $query->latest()
                       ->paginate(20)
                       ->withQueryString(); // Garde les filtres lors du changement de page

        // 7. Données pour les filtres (Liste des boutiques)
        // Optimisation : On ne charge la liste complète des boutiques que si c'est le directeur
        $boutiques = $isDirecteur ? \App\Models\Boutique::select('id', 'name')->orderBy('name')->get() : [];
        
        // Petit conseil d'optimisation : Si vous avez des milliers de produits, 
        // Product::all() risque d'être lourd pour la RAM. À terme, il vaudra mieux 
        // utiliser une API de recherche asynchrone côté React (Select avec recherche).
        $products = Product::all(); 

        return Inertia::render('DirBoutique/History/GlobalIndex', [
            'moves'       => $moves,
            'boutiques'   => $boutiques, // Pour le menu déroulant "Filtrer par boutique"
            'isDirecteur' => $isDirecteur, // Renvoi au front-end pour masquer le select Boutique
            'filters'     => $request->only(['search', 'boutique_id', 'type', 'date_start', 'date_end']),
            'products'    => $products
        ]);
    }
    public function export_history(Request $request)
    {
        // 1. Construction de la requête (Copie conforme des filtres de la vue history)
        $query = ProductMove::query()
            ->with(['product', 'boutique', 'user']);

        // Filtre Boutique (Si vide = toutes)
        if ($request->filled('boutique_id')) {
            $query->where('boutique_id', $request->boutique_id);
        }

        // Filtre Produit (Si vide = tous)
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filtre Date
        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        $moves = $query->orderBy('created_at', 'desc')->get();

        // 2. Export Excel
        if ($request->format === 'excel') {
            return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\GlobalMovesExport($moves), 'rapport_global_mouvements.xlsx');
        }

        // 3. Export PDF
        $boutiqueName = $request->filled('boutique_id') 
            ? Boutique::find($request->boutique_id)->name 
            : 'TOUTES LES BOUTIQUES';

        $data = [
            'title'     => 'Rapport Global des Mouvements',
            'boutique'  => $boutiqueName,
            'date_range'=> "Du {$request->date_start} au {$request->date_end}",
            'moves'     => $moves
        ];

        // Utilisez la même vue PDF que précédemment, ou une version "Paysage" si beaucoup de colonnes
        $pdf = Pdf::loadView('boutique_pdf.moves_history_global', $data);
        $pdf->setPaper('a4', 'landscape'); // Paysage recommandé pour le mode "Global"

        return $pdf->download('rapport_global_' . date('Ymd_Hi') . '.pdf');
    }

   /**
     * Historique global des transferts avec filtres avancés (Région, Chauffeur, Véhicule).
     */
    public function transferHistory(Request $request)
    {
        $user = Auth::user();
        $isDirecteur = $user->role->name === 'direction';

        // 1. Construction de la requête de base
        $query = Producttransfert::query()
            ->with([
                'boutiqueDeparture.region', 
                'boutiqueArrival.region',
                'vehicule:id,type,licence_plate',
                'chauffeur:id,name',
                'userEmitting:id,first_name,last_name',
                'items.product' 
            ]);

        // --- SÉCURITÉ MULTI-TENANT ---
        // Le contrôleur ne voit que les transferts qui PARTENT ou qui ARRIVENT dans SA boutique
        if (!$isDirecteur) {
            $query->where(function($q) use ($user) {
                $q->where('boutique_departure_id', $user->boutique_id) // Remplacez par le vrai nom de votre colonne si différent
                  ->orWhere('boutique_arrival_id', $user->boutique_id);
            });
        }

        // 2. Filtre par RÉGION (Départ OU Arrivée) - Uniquement pour Directeur ou si pertinent
        if ($request->filled('region_id')) {
            $regionId = $request->region_id;
            $query->where(function($q) use ($regionId) {
                $q->whereHas('boutiqueDeparture', function($subQ) use ($regionId) {
                    $subQ->where('region_id', $regionId);
                })
                ->orWhereHas('boutiqueArrival', function($subQ) use ($regionId) {
                    $subQ->where('region_id', $regionId);
                });
            });
        }

        // 3. Filtre par CHAUFFEUR
        if ($request->filled('chauffeur_id')) {
            $query->where('chauffeur_id', $request->chauffeur_id);
        }

        // 4. Filtre par VÉHICULE
        if ($request->filled('vehicule_id')) {
            $query->where('vehicule_id', $request->vehicule_id);
        }

        // 5. Filtre par PÉRIODE
        if ($request->filled('date_start')) {
            $query->whereDate('departure_date', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('departure_date', '<=', $request->date_end);
        }

        // 6. Filtre par STATUT 
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Exécution
        $transfers = $query->orderBy('departure_date', 'desc')
                           ->paginate(15)
                           ->withQueryString();

        // 7. Données pour les listes déroulantes (Filtres)
        $regions = Region::select('id', 'name')->orderBy('name')->get();
        $chauffeurs = Chauffeur::where('archived', false)->select('id', 'name')->orderBy('name')->get();
        $vehicules = Vehicule::where('archived', false)->select('id', 'type', 'licence_plate')->orderBy('type')->get();

        return Inertia::render('DirBoutique/History/GlobalTransferIndex', [
            'transfers'   => $transfers,
            'regions'     => $regions,
            'chauffeurs'  => $chauffeurs,
            'vehicules'   => $vehicules,
            'isDirecteur' => $isDirecteur,
            'filters'     => $request->only(['region_id', 'chauffeur_id', 'vehicule_id', 'date_start', 'date_end', 'status'])
        ]);
    }
    
    /**
     * Historique Global des Ventes (Toutes boutiques ou filtré)
     */
    public function salesHistory(Request $request)
    {
        $user = Auth::user();
        $isDirecteur = $user->role->name === 'direction';

        $query = Productsale::with(['boutique', 'user', 'customer', 'items'])
            ->orderBy('created_at', 'desc');

        // --- SÉCURITÉ MULTI-TENANT ---
        if (!$isDirecteur) {
            $query->where('boutique_id', $user->boutique_id);
        }

        // --- FILTRES ---

        // 1. Boutique (Spécifique ou Toutes - Pour le Directeur uniquement)
        if ($request->filled('boutique_id') && $isDirecteur) {
            $query->where('boutique_id', $request->boutique_id);
        }

        // 2. Dates
        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        // 3. Recherche (Code facture, Client, Vendeur)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('facture_code', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('user', fn($u) => $u->where('first_name', 'like', "%{$search}%"));
            });
        }

        // Calculs des totaux pour l'affichage rapide (Cards)
        $statsQuery = clone $query;
        $totalRevenue = $statsQuery->sum('total_ttc');
        $totalSalesCount = $statsQuery->count();

        $sales = $query->paginate(20)->withQueryString();

        // On ne charge la liste des boutiques que si c'est le directeur
        $boutiques = $isDirecteur ? Boutique::orderBy('name')->get(['id', 'name']) : [];

        return Inertia::render('DirBoutique/History/GlobalSalesHistory', [
            'sales'       => $sales,
            'boutiques'   => $boutiques,
            'isDirecteur' => $isDirecteur,
            'filters'     => $request->only(['search', 'date_start', 'date_end', 'boutique_id']),
            'stats'       => [
                'total_revenue' => $totalRevenue,
                'count'         => $totalSalesCount
            ]
        ]);
    }

    /**
     * Historique Global des Versements (Toutes boutiques ou filtré)
     */
    public function paymentsHistory(Request $request)
    {
        $user = Auth::user();
        $isDirecteur = $user->role->name === 'direction';

        // On utilise la relation via User -> Boutique
        $query = Boutiquepayment::with(['user.boutique', 'productSales'])
            ->orderBy('created_at', 'desc');

        // --- SÉCURITÉ MULTI-TENANT ---
        if (!$isDirecteur) {
            // Le versement est lié à l'utilisateur qui l'a fait. 
            // On vérifie que cet utilisateur appartient à la boutique du contrôleur.
            $query->whereHas('user', function($q) use ($user) {
                $q->where('boutique_id', $user->boutique_id);
            });
        }

        // --- FILTRES ---

        // 1. Boutique (Via User - Pour le Directeur uniquement)
        if ($request->filled('boutique_id') && $isDirecteur) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('boutique_id', $request->boutique_id);
            });
        }

        // 2. Dates
        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        // 3. Recherche
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('amount', 'like', "%{$search}%");
            });
        }

        $totalAmount = (clone $query)->sum('amount');
        $payments = $query->paginate(20)->withQueryString();

        $boutiques = $isDirecteur ? Boutique::orderBy('name')->get(['id', 'name']) : [];

        return Inertia::render('DirBoutique/History/GlobalPaymentHistory', [
            'payments'    => $payments,
            'boutiques'   => $boutiques,
            'isDirecteur' => $isDirecteur,
            'filters'     => $request->only(['search', 'date_start', 'date_end', 'boutique_id']),
            'stats'       => ['total_amount' => $totalAmount]
        ]);
    }
    /**
     * Génération PDF Rapport Ventes (Global ou Spécifique)
     */
    public function downloadSalesReport(Request $request)
    {
        $request->validate([
            'date_start' => 'required|date',
            'date_end'   => 'required|date|after_or_equal:date_start',
            'boutique_id'=> 'nullable|exists:boutiques,id' // Nullable = Toutes les boutiques
        ]);

        $startDate = Carbon::parse($request->date_start)->startOfDay();
        $endDate = Carbon::parse($request->date_end)->endOfDay();

        $query = Productsale::with(['boutique', 'user', 'items.product'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed');

        $boutiqueName = "TOUTES LES BOUTIQUES";

        if ($request->filled('boutique_id')) {
            $query->where('boutique_id', $request->boutique_id);
            $boutiqueName = Boutique::find($request->boutique_id)->name;
        }

        $sales = $query->orderBy('created_at', 'desc')->get();
        
        // Groupement par boutique si rapport global
        $groupedSales = $request->filled('boutique_id') ? null : $sales->groupBy('boutique.name');

        $totalRevenue = $sales->sum('total_ttc');

        $pdf = Pdf::loadView('boutique_pdf.global_sales_report', [
            'sales' => $sales,
            'groupedSales' => $groupedSales, // Si défini, on affiche par groupe
            'boutique_name' => $boutiqueName,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_revenue' => $totalRevenue,
            'generated_at' => now()
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('Rapport_Ventes.pdf');
    }

    /**
     * Génération PDF Rapport Versements (Global ou Spécifique)
     */
    public function downloadPaymentsReport(Request $request)
    {
        $request->validate([
            'date_start' => 'required|date',
            'date_end'   => 'required|date|after_or_equal:date_start',
            'boutique_id'=> 'nullable|exists:boutiques,id'
        ]);

        $startDate = Carbon::parse($request->date_start)->startOfDay();
        $endDate = Carbon::parse($request->date_end)->endOfDay();

        $query = Boutiquepayment::with(['user.boutique', 'productSales'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        $boutiqueName = "TOUTES LES BOUTIQUES";

        if ($request->filled('boutique_id')) {
            $query->whereHas('user', fn($q) => $q->where('boutique_id', $request->boutique_id));
            $boutiqueName = Boutique::find($request->boutique_id)->name;
        }

        $payments = $query->orderBy('created_at', 'desc')->get();
        $totalAmount = $payments->sum('amount');

        $pdf = Pdf::loadView('boutique_pdf.global_payments_report', [
            'payments' => $payments,
            'boutique_name' => $boutiqueName,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_amount' => $totalAmount,
            'generated_at' => now()
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('Rapport_Versements.pdf');
    }
}
