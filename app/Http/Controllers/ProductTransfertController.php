<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\Chauffeur;
use App\Models\Product;
use App\Models\ProductMove;
use App\Models\ProductStock;
use App\Models\ProductTransfert;
use App\Models\ProductTransfertItem;
use App\Models\User; // Pour valider le receveur
use App\Models\Vehicule;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductTransfertController extends Controller
{
  public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->boutique_id) {
            return redirect()->back()->with('error', "Aucune boutique assignée.");
        }

        // --- 1. LISTE DES TRANSFERTS (Pour le tableau) ---
        // On récupère les transferts "PENDING" où ma boutique est impliquée
        $transfers = ProductTransfert::query()
            
            ->where(function($q) use ($user) {
                $q->where('boutique_departure_id', $user->boutique_id)
                  ->orWhere('boutique_arrival_id', $user->boutique_id);
            })
            ->with([
                // Respect strict de vos migrations pour les sélections
                'vehicule:id,licence_plate,type', 
                'chauffeur:id,name,phone_number',
                'boutiqueDeparture:id,name',
                'boutiqueArrival:id,name',
                'items.product:id,designation,sku' // Pour la prévisualisation rapide
            ])
            ->orderBy('arrival_date', 'asc') // Les plus urgents en premier
            ->paginate(10);

        // --- 2. DONNÉES POUR LA MODALE DE CRÉATION ---
        
        // A. Destinations possibles (Toutes sauf la mienne)
        $otherBoutiques = Boutique::where('id', '!=', $user->boutique_id)
            ->orderBy('name')
            ->get(['id', 'name']);

        // B. Logistique (Non archivés)
        // Note : On utilise 'type' et 'licence_plate' comme demandé
        $vehicules = Vehicule::where('archived', false)
            ->orderBy('type')
            ->get(['id', 'type', 'licence_plate']);

        // Note : On utilise 'name' comme demandé
        $chauffeurs = Chauffeur::where('archived', false)
            ->orderBy('name')
            ->get(['id', 'name']);
        
        // C. Réceptionnaires potentiels (Utilisateurs autres que moi)
        $users = User::where('id', '!=', $user->id)
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        // D. Produits avec le stock DISPONIBLE dans MA boutique (Départ)
        // C'est crucial pour empêcher de transférer ce qu'on n'a pas.
        $products = Product::with(['stocks' => function($q) use ($user) {
                $q->where('boutique_id', $user->boutique_id)
                  ->where('service', 'magasin');
            }])
            ->orderBy('designation')
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'designation' => $product->designation,
                    'sku' => $product->sku,
                    // On extrait la quantité directement pour le frontend
                    'stock_magasin' => $product->stocks->first() ? $product->stocks->first()->available_qty : 0
                ];
            });

        return Inertia::render('MagBoutique/TransferIndex', [
            'transfers'    => $transfers,
            'userBoutique' => $user->boutique,
            'modalData'    => [
                'boutiques'  => $otherBoutiques,
                'vehicules'  => $vehicules,
                'chauffeurs' => $chauffeurs,
                'users'      => $users,
                'products'   => $products,
            ]
        ]);
    }
/* CRÉATION DU TRANSFERT
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'boutique_arrival_id' => 'required|exists:boutiques,id|different:boutique_departure_id',
            'departure_date'      => 'required|date',
            // 'arrival_date'     => RETIRÉ
            'vehicule_id'         => 'required|exists:vehicules,id',
            'chauffeur_id'        => 'required|exists:chauffeurs,id',
            'items'               => 'required|array|min:1',
            'items.*.product_id'  => 'required|exists:products,id',
            'items.*.qty'         => 'required|numeric|min:0.1',
        ]);
        $boutiqueDepartureId = $user->boutique_id;

        try {
            DB::transaction(function () use ($validated, $user, $boutiqueDepartureId) {
                
                // 1. Création Transfert
                $transfert = ProductTransfert::create([
                    'vehicule_id'           => $validated['vehicule_id'],
                    'chauffeur_id'          => $validated['chauffeur_id'],
                    'boutique_departure_id' => $boutiqueDepartureId,
                    'boutique_arrival_id'   => $validated['boutique_arrival_id'],
                    'departure_date'        => $validated['departure_date'],
                    'arrival_date'          => null, // Sera défini à la réception (via la méthode receive)
                    'status'                => 'pending',
                    'user_emitting_id'      => $user->id,
                    'user_receiving_id'     => null, 
                ]);

                // 2. Traitement des Articles (SORTIE DE STOCK & HISTORIQUE)
                foreach ($validated['items'] as $item) {
                    
                    // A. Vérification et Verrouillage Stock
                    $stock = ProductStock::where([
                        'product_id'  => $item['product_id'],
                        'boutique_id' => $boutiqueDepartureId,
                        'service'     => 'magasin'
                    ])->lockForUpdate()->first();

                    if (!$stock || $stock->available_qty < $item['qty']) {
                        throw ValidationException::withMessages([
                            'items' => "Stock insuffisant pour le produit ID {$item['product_id']}."
                        ]);
                    }

                    // B. DÉBIT DU STOCK DÉPART (Immédiat)
                    $stock->decrement('available_qty', $item['qty']);

                    // C. Historique Mouvement (Sortie)
                    // C'est ce qui crée la trace dans l'historique de la boutique émettrice
                    $move = ProductMove::create([
                        'product_id'  => $item['product_id'],
                        'boutique_id' => $boutiqueDepartureId,
                        'user_id'     => $user->id,
                        'qty'         => $item['qty'],
                        'type'        => 'sortie',
                        'departure'   => 'Magasin',
                        'destination' => 'Transfert #' . $transfert->id,
                        'label'       => 'Transfert vers Boutique ' . $validated['boutique_arrival_id'],
                    ]);

                    // D. Item Transfert
                    ProductTransfertItem::create([
                        'product_id'  => $item['product_id'],
                        'tranfert_id' => $transfert->id,
                        'move_id'     => $move->id,
                        'qty'         => $item['qty'],
                    ]);
                }
            });

            return redirect()->back()->with('success', 'Transfert créé et stock débité.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
    /**
     * RÉCEPTION DU TRANSFERT
     * - Status: finished
     * - User Receiving: Auth::id()
     * - Action Stock: CRÉDIT boutique arrivée
     */
    public function receive(Request $request, $id)
    {
        $user = Auth::user();
        
        try {
            DB::transaction(function () use ($id, $user) {
                // Verrouillage du transfert
                $transfert = ProductTransfert::with('items')->lockForUpdate()->findOrFail($id);

                if ($transfert->status !== 'pending') {
                    throw new \Exception("Ce transfert a déjà été traité.");
                }

                if ($transfert->boutique_arrival_id !== $user->boutique_id) {
                    throw new \Exception("Vous n'êtes pas autorisé à réceptionner ce transfert.");
                }

                // 1. Mise à jour Stock Arrivée (ENTRÉE)
                foreach ($transfert->items as $item) {
                    // Création ou récupération du stock dans la boutique d'arrivée
                    $stockArrivee = ProductStock::firstOrCreate(
                        [
                            'product_id'  => $item->product_id,
                            'boutique_id' => $user->boutique_id,
                            'service'     => 'magasin'
                        ],
                        ['available_qty' => 0]
                    );

                    $stockArrivee->increment('available_qty', $item->qty);

                    // Historique Mouvement (Entrée)
                    ProductMove::create([
                        'product_id'  => $item->product_id,
                        'boutique_id' => $user->boutique_id,
                        'user_id'     => $user->id,
                        'qty'         => $item->qty,
                        'type'        => 'entree',
                        'departure'   => 'Transfert #' . $transfert->id,
                        'destination' => 'Magasin',
                        'label'       => 'Réception transfert depuis ' . $transfert->boutique_departure_id,
                    ]);
                }

                // 2. Mise à jour du Transfert
                $transfert->update([
                    'status'            => 'finished',
                    'user_receiving_id' => $user->id, // ENREGISTREMENT AUTOMATIQUE DU RÉCEPTIONNAIRE
                    'arrival_date'      => now(),     // Date réelle de réception
                ]);
            });

            return redirect()->back()->with('success', 'Transfert réceptionné avec succès.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

// ... dans la classe ProductTransfertController

    /**
     * ANNULER UN TRANSFERT (Suppression)
     * Condition : Le statut doit être 'pending'.
     * Action : Rembourse le stock magasin de départ et supprime les données.
     */
    public function destroy($id)
    {
        $user = Auth::user();

        try {
            DB::transaction(function () use ($id, $user) {
                // 1. Récupération avec verrouillage
                $transfert = ProductTransfert::with('items')->lockForUpdate()->findOrFail($id);

                // 2. Vérifications de sécurité
                if ($transfert->status !== 'pending') {
                    throw new \Exception("Impossible d'annuler un transfert déjà terminé ou archivé.");
                }

                if ($transfert->boutique_departure_id !== $user->boutique_id && !$user->is_admin) { // Si vous avez un flag admin
                    throw new \Exception("Vous n'êtes pas autorisé à annuler ce transfert.");
                }

                // 3. Remboursement du Stock (Annulation de la sortie)
                foreach ($transfert->items as $item) {
                    // A. On récupère le stock de la boutique de DÉPART
                    $stockDepart = ProductStock::where([
                        'product_id'  => $item->product_id,
                        'boutique_id' => $transfert->boutique_departure_id,
                        'service'     => 'magasin'
                    ])->lockForUpdate()->first();

                    if ($stockDepart) {
                        // B. On recrédite la quantité
                        $stockDepart->increment('available_qty', $item->qty);
                    }

                    // C. On supprime le mouvement 'Sortie' associé dans l'historique (ProductMove)
                    // Grâce à la clé étrangère dans la migration item, on récupère l'ID
                    if ($item->move_id) {
                        ProductMove::where('id', $item->move_id)->delete();
                    }
                }

                // 4. Suppression du Transfert
                // La cascade SQL supprimera automatiquement les items liés
                $transfert->delete();
            });

            return redirect()->back()->with('success', 'Transfert annulé et stock restitué avec succès.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * GÉNÉRER LE BORDEREAU DE LIVRAISON (PDF)
     */
    public function print_waybill($id)
    {
        // 1. Chargement des données complètes
        $transfert = ProductTransfert::with([
            'boutiqueDeparture',
            'boutiqueArrival',
            'vehicule',
            'chauffeur',
            'userEmitting', // L'utilisateur qui a créé le transfert
            'items.product' // Pour les noms et SKU
        ])->findOrFail($id);

        // 2. Préparation des données pour la vue
        $data = [
            'transfert' => $transfert,
            'date'      => now()->format('d/m/Y H:i'),
            'title'     => 'BORDEREAU DE TRANSFERT #' . str_pad($transfert->id, 6, '0', STR_PAD_LEFT)
        ];

        // 3. Génération du PDF
        // Assurez-vous d'avoir créé le fichier resources/views/pdf/waybill.blade.php
        $pdf = Pdf::loadView('boutique_pdf.waybill', $data);
        
        // Format A4 Portrait
        $pdf->setPaper('a4', 'portrait');

        // On stream (affiche dans le navigateur) ou on download
        return $pdf->stream('bordereau_transfert_' . $transfert->id . '.pdf');
    }
}