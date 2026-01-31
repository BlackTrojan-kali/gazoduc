<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\Chauffeur;
use App\Models\City;
use App\Models\Product;
use App\Models\ProductMove;
use App\Models\Producttransfert;
use App\Models\Region;
use App\Models\Vehicule;
use Illuminate\Http\Request;
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
     * Affiche l'historique global de tous les mouvements (Toutes boutiques confondues).
     */
    public function history(Request $request)
    {
        // 1. Base de la requête avec les relations nécessaires
        $query = ProductMove::query()
            ->with([
                'product:id,designation,sku',   // Le produit concerné
                'boutique:id,name',             // La boutique où ça s'est passé
                'user:id,first_name,last_name'  // Qui a fait l'action
            ]);

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
        if ($request->filled('boutique_id')) {
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
        $boutiques = Boutique::select('id', 'name')->orderBy('name')->get();
        $products = Product::all();
        return Inertia::render('DirBoutique/History/GlobalIndex', [
            'moves'     => $moves,
            'boutiques' => $boutiques, // Pour le menu déroulant "Filtrer par boutique"
            'filters'   => $request->only(['search', 'boutique_id', 'type', 'date_start', 'date_end']),
            "products" =>$products
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
            ? \App\Models\Boutique::find($request->boutique_id)->name 
            : 'TOUTES LES BOUTIQUES';

        $data = [
            'title'     => 'Rapport Global des Mouvements',
            'boutique'  => $boutiqueName,
            'date_range'=> "Du {$request->date_start} au {$request->date_end}",
            'moves'     => $moves
        ];

        // Utilisez la même vue PDF que précédemment, ou une version "Paysage" si beaucoup de colonnes
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('boutique_pdf.moves_history_global', $data);
        $pdf->setPaper('a4', 'landscape'); // Paysage recommandé pour le mode "Global"

        return $pdf->download('rapport_global_' . date('Ymd_Hi') . '.pdf');
    }

    /**
     * Historique global des transferts avec filtres avancés (Région, Chauffeur, Véhicule).
     */
    public function transferHistory(Request $request)
    {
        // 1. Construction de la requête de base
        $query = ProductTransfert::query()
            ->with([
                'boutiqueDeparture.region', // Important pour le filtre et l'affichage
                'boutiqueArrival.region',
                'vehicule:id,type,licence_plate',
                'chauffeur:id,name',
                'userEmitting:id,first_name,last_name',
                'items.product' // Pour compter le nombre d'articles
            ]);

        // 2. Filtre par RÉGION (Départ OU Arrivée)
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

        // 6. Filtre par STATUT (Optionnel mais utile)
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
            'transfers'  => $transfers,
            'regions'    => $regions,
            'chauffeurs' => $chauffeurs,
            'vehicules'  => $vehicules,
            'filters'    => $request->only(['region_id', 'chauffeur_id', 'vehicule_id', 'date_start', 'date_end', 'status'])
        ]);
    }
}
