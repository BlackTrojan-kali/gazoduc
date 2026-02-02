<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductMove;
use App\Models\Productsale;
use App\Models\UnassociatedFacture;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ComBoutiqueController extends Controller
{
    /**
     * Affiche le stock du commercial (Service: 'comptoir')
     * Uniquement pour la boutique de l'utilisateur connecté.
     */
    public function index(Request $request)
{
    // On charge la relation 'counter' pour accéder au 'transfer_point' sans refaire de requête
    $user = Auth::user();

    // 1. Récupération des clients
    $customers = Customer::orderBy('name')->get(['id', 'name']);

    // 2. Info Caisse
    $userCounterId = $user->counter_id; 

    // --- NOUVEAU : CALCULS STATISTIQUES ---

    // A. Somme totale des ventes de la journée (pour cette boutique)
    $totalSalesToday = ProductSale::where('boutique_id', $user->boutique_id)
        ->whereDate('created_at', Carbon::today()) // Filtre sur la date d'aujourd'hui (00:00 à 23:59)
        ->sum('total_ttc');

    // B. Somme totale des factures non associées (en attente de versement)
    // On récupère d'abord le tableau d'IDs stocké dans le JSON
    $unassociatedRecord = UnassociatedFacture::first();
    $unassociatedIds = $unassociatedRecord ? ($unassociatedRecord->product_sales_id ?? []) : [];
    
    // On somme le total_ttc de ces factures spécifiques
    $unassociatedTotal = 0;
    if (!empty($unassociatedIds)) {
        $unassociatedTotal = Productsale::whereIn('id', $unassociatedIds)->sum('total_ttc');
    }
    // C. Point de transfert (Seuil de versement)
    // On sécurise avec ?? 0 au cas où l'utilisateur n'a pas de caisse ou la valeur est null
    $transferPoint = $user->counter->transfert_point ?? 0;


    // A. On récupère la ligne unique des factures non associées
    $unassociated = UnassociatedFacture::first();
    
    // B. On extrait les IDs (tableau vide si pas d'enregistrement)
    $idsToProcess = $unassociated ? ($unassociated->product_sales_id ?? []) : [];

    // C. On récupère les VRAIS objets Ventes correspondant à ces IDs
    $salesToAssociate = ProductSale::with('customer')
        ->whereIn('id', $idsToProcess)
        ->orderBy('created_at', 'desc')
        ->get();
    // 3. Récupération des stocks (Code existant)
    $query = ProductStock::with('product.category')
        ->where('boutique_id', $user->boutique_id)
        ->where('service', 'comptoir');

    if ($request->filled('search')) {
        $search = $request->input('search');
        $query->whereHas('product', function($q) use ($search) {
            $q->where('designation', 'like', '%' . $search . '%')
                ->orWhere('sku', 'like', '%' . $search . '%')
                ->orWhere('barcode', 'like', '%' . $search . '%');
        });
    }

    $stocks = $query->paginate(15)->withQueryString();

    return Inertia::render('ComBoutique/ComBoutiqueIndex', [
        'stocks'        => $stocks,
        'filters'       => $request->only(['search']),
        'customers'     => $customers,
        'userCounterId' => $userCounterId,
        
        'salesToAssociate' => $salesToAssociate, // On passe ça à la modale
        // ... autres props
        // On envoie les nouvelles stats groupées dans un objet pour plus de propreté
        'stats' => [
            'total_sales_today'  => $totalSalesToday,
            'unassociated_total' => $unassociatedTotal,
            'transfer_point'     => $transferPoint,
        ]
    ]);
}
    /**
     * Enregistre un mouvement de sortie (Retour Magasin ou Perte).
     */
  public function store(Request $request)
{
    // 1. Validation
    $validated = $request->validate([
        'product_id'  => 'required|exists:products,id',
        'qty'         => 'required|numeric|min:0.01',
        'destination' => 'required|string|in:Magasin,Perte',
        'label'       => 'nullable|string|max:255',
    ]);

    $user = Auth::user();

    try {
        DB::transaction(function () use ($validated, $user) {
            
            // --- ÉTAPE A : GESTION DU COMPTOIR (SORTIE) ---

            // 2. Verrouillage du stock 'comptoir'
            $stockComptoir = ProductStock::where([
                'product_id'  => $validated['product_id'],
                'boutique_id' => $user->boutique_id,
                'service'     => 'comptoir'
            ])->lockForUpdate()->first();

            // 3. Vérification du Stock Disponible
            $currentQty = $stockComptoir ? $stockComptoir->available_qty : 0;

            if ($currentQty < $validated['qty']) {
                throw new \Exception("Stock insuffisant au comptoir. Disponible : $currentQty");
            }

            // 4. Débit du Stock Comptoir
            $stockComptoir->decrement('available_qty', $validated['qty']);
            $stockComptoir->refresh(); // Mise à jour pour l'historique

            // 5. Enregistrement du Mouvement SORTIE (Comptoir)
            ProductMove::create([
                'product_id'      => $validated['product_id'],
                'boutique_id'     => $user->boutique_id,
                'user_id'         => $user->id,
                'qty'             => $validated['qty'],
                'type'            => 'sortie',
                'departure'       => 'Comptoir',
                'destination'     => $validated['destination'], // 'Magasin' ou 'Perte'
                'label'           => $validated['label'] ?? 'Sortie comptoir',
                'remaining_stock' => $stockComptoir->available_qty
            ]);

            // --- ÉTAPE B : GESTION DU MAGASIN (ENTRÉE) SI APPLICABLE ---

            if ($validated['destination'] === 'Magasin') {
                
                // 6. Récupération ou Création du stock 'Magasin'
                // Note : On ne lock pas ici car firstOrCreate gère mal le lock atomique, 
                // mais pour une incrémentation le risque est minime.
                $stockMagasin = ProductStock::firstOrCreate(
                    [
                        'product_id'  => $validated['product_id'],
                        'boutique_id' => $user->boutique_id,
                        'service'     => 'magasin'
                    ],
                    ['available_qty' => 0]
                );

                // 7. Crédit du Stock Magasin
                $stockMagasin->increment('available_qty', $validated['qty']);
                $stockMagasin->refresh(); // IMPORTANT : Pour avoir la valeur exacte après incrément

                // 8. Enregistrement du Mouvement ENTRÉE (Magasin)
                // C'est ici qu'on assure la traçabilité complète
                ProductMove::create([
                    'product_id'      => $validated['product_id'],
                    'boutique_id'     => $user->boutique_id,
                    'user_id'         => $user->id,
                    'qty'             => $validated['qty'],
                    'type'            => 'entree', // Type inverse
                    'departure'       => 'Comptoir', // D'où ça vient
                    'destination'     => 'Magasin',  // Où ça va
                    'label'           => 'Retour interne depuis le Comptoir',
                    'remaining_stock' => $stockMagasin->available_qty // Stock du MAGASIN après mouvement
                ]);
            }

        });

        return redirect()->back()->with('success', 'Mouvement enregistré et stocks mis à jour.');

    } catch (\Exception $e) {
        return redirect()->back()->withErrors(['error' => $e->getMessage()]);
    }
}
}