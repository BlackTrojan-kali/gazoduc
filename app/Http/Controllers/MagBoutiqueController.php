<?php

namespace App\Http\Controllers;

use App\Exports\ProductMovesExport;
use App\Models\Product;
use App\Models\ProductMove;
use App\Models\ProductStock; // Ou Productstock selon votre nom de fichier
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Excel;

class MagBoutiqueController extends Controller
{
    /**
     * Affiche les stocks de la boutique de l'utilisateur connecté.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Sécurité : Vérifier si l'utilisateur est bien rattaché à une boutique
        if (!$user->boutique_id) {
            // Vous pouvez rediriger ou renvoyer une erreur 403
            return redirect()->back()->with('error', "Vous n'êtes rattaché à aucune boutique.");
        }
        $products = Product::all();
        // 1. Construction de la requête
        // On filtre directement par la boutique de l'utilisateur
        $query = ProductStock::query()
            ->where('boutique_id', $user->boutique_id)
            ->with(['product.category']); // On charge les infos du produit

        // 2. Filtre de Recherche (Barre de recherche)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('designation', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // 3. Filtre par Service (Magasin vs Commercial)
        // Utile si le magasinier veut voir seulement le stock "Arrière-boutique"
        if ($request->filled('service')) {
            $query->where('service', $request->service);
        }

        // 4. Tri et Pagination
        $stocks = $query->orderBy('product_id') // Tri par défaut
                        ->paginate(20)
                        ->withQueryString();

        return Inertia::render('MagBoutique/MagBoutiqueIndex', [
            'stocks'      => $stocks,
            'userBoutique' => $user->boutique, // Pour afficher le nom de la boutique en haut de page
            'filters'     => $request->only(['search', 'service']),
            "products"  => $products
         ]);
    }
    /**
     * Enregistre un mouvement de stock avec logique de transfert Magasin -> Commercial.
     */
 /**
     * Enregistre un mouvement avec protection stricte contre le stock négatif.
     */
   public function store(Request $request)
{
    $validated = $request->validate([
        'product_id'  => 'required|exists:products,id',
        'boutique_id' => 'required|exists:boutiques,id',
        'qty'         => 'required|numeric|min:0.01',
        'type'        => ['required', Rule::in(['entree', 'sortie'])],
        'destination' => 'nullable|string',
        'label'       => 'nullable|string|max:255',
    ]);

    $user = Auth::user();

    try {
        DB::transaction(function () use ($validated, $user) {
            
            // --- SCÉNARIO 1 : ENTRÉE ---
            if ($validated['type'] === 'entree') {
                
                $stockMagasin = ProductStock::firstOrCreate(
                    ['product_id' => $validated['product_id'], 'boutique_id' => $validated['boutique_id'], 'service' => 'magasin'],
                    ['available_qty' => 0]
                );
                
                // On incrémente de manière atomique
                $stockMagasin->increment('available_qty', $validated['qty']);
                // IMPORTANT: On rafraîchit pour avoir la valeur à jour pour le 'remaining_stock'
                $stockMagasin->refresh();

                ProductMove::create([
                    'product_id'  => $validated['product_id'],
                    'boutique_id' => $validated['boutique_id'],
                    'user_id'     => $user->id,
                    'qty'         => $validated['qty'],
                    'type'        => 'entree',
                    'departure'   => 'Fournisseur',
                    'destination' => 'Magasin',
                    'label'       => $validated['label'] ?? 'Approvisionnement',
                    'remaining_stock' => $stockMagasin->available_qty // Correction du nom de variable
                ]);
            }

            // --- SCÉNARIO 2 : SORTIE ---
            elseif ($validated['type'] === 'sortie') {
                
                $stockMagasin = ProductStock::where([
                    'product_id'  => $validated['product_id'],
                    'boutique_id' => $validated['boutique_id'],
                    'service'     => 'magasin'
                ])->lockForUpdate()->first();

                if (!$stockMagasin || $stockMagasin->available_qty < $validated['qty']) {
                    throw new \Exception("Opération impossible : Stock magasin insuffisant (Dispo: " . ($stockMagasin->available_qty ?? 0) . ").");
                }
                
                $stockMagasin->decrement('available_qty', $validated['qty']);
                $stockMagasin->refresh();

                $sortieMove = ProductMove::create([
                    'product_id'  => $validated['product_id'],
                    'boutique_id' => $validated['boutique_id'],
                    'user_id'     => $user->id,
                    'qty'         => $validated['qty'],
                    'type'        => 'sortie',
                    'departure'   => 'Magasin',
                    'destination' => ucfirst($validated['destination'] ?? 'Client'),
                    'label'       => $validated['label'],
                    'remaining_stock' => $stockMagasin->available_qty
                ]);

                // --- TRANSFERT VERS COMMERCIAL (COMPTOIR) ---
                if (isset($validated['destination']) && strtolower($validated['destination']) === 'commercial') {
                    
                    $stockComptoir = ProductStock::firstOrCreate(
                        ['product_id' => $validated['product_id'], 'boutique_id' => $validated['boutique_id'], 'service' => 'comptoir'],
                        ['available_qty' => 0]
                    );
                    
                    $stockComptoir->increment('available_qty', $validated['qty']);
                    $stockComptoir->refresh();

                    ProductMove::create([
                        'product_id'  => $validated['product_id'],
                        'boutique_id' => $validated['boutique_id'],
                        'user_id'     => $user->id,
                        'qty'         => $validated['qty'],
                        'type'        => 'entree', // C'est une entrée pour le comptoir
                        'departure'   => 'Magasin',
                        'destination' => 'Comptoir',
                        'label'       => 'Transfert depuis Magasin',
                        'remaining_stock' => $stockComptoir->available_qty,
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Mouvement enregistré avec succès.');

    } catch (\Exception $e) {
        return redirect()->back()->with('error', $e->getMessage());
    }
}
    /**
     * Supprime un mouvement avec vérification que l'annulation ne crée pas de stock négatif.
     */
public function destroy($id)
    {
        try {
            DB::transaction(function () use ($id) {
                $user = Auth::user();

                // 1. Récupération et Verrouillage du mouvement à supprimer
                $move = ProductMove::where('id', $id)
                    ->where('boutique_id', $user->boutique_id)
                    ->lockForUpdate()
                    ->firstOrFail();
                // On récupère le stock du Comptoir (celui de l'utilisateur courant)
                $stockComptoir = ProductStock::where([
                    'product_id'  => $move->product_id,
                    'boutique_id' => $move->boutique_id,
                    'service'     => $user->role->name
                ])->lockForUpdate()->first();
                // --- CAS A : Annulation d'une SORTIE (ex: Annuler un retour magasin ou une perte) ---
                if ($move->type === 'sortie') {
                    
                    // Sous-cas 1 : C'était un RETOUR AU MAGASIN
                    if ($move->destination === 'Magasin') {
                        
                        // On doit reprendre le stock au Magasin.
                        // MAIS D'ABORD : Vérifier si le magasin a encore ce stock !
                        $stockMagasin = ProductStock::where([
                            'product_id'  => $move->product_id,
                            'boutique_id' => $move->boutique_id,
                            'service'     => 'magasin'
                        ])->lockForUpdate()->first();

                        $magasinQty = $stockMagasin ? $stockMagasin->available_qty : 0;

                        if ($magasinQty < $move->qty) {
                            throw new \Exception("Impossible d'annuler ce retour : Le magasin a déjà utilisé ou vendu ces articles (Stock magasin insuffisant).");
                        }

                        // 1. On débit le magasin (On reprend le stock)
                        $stockMagasin->decrement('available_qty', $move->qty);

                        // 2. On recrédite le comptoir (On rend le stock au vendeur)
                        if ($stockComptoir) {
                            $stockComptoir->increment('available_qty', $move->qty);
                        } else {
                            // Si le stock comptoir n'existe plus (cas rare), on le recrée
                            ProductStock::create([
                                'product_id' => $move->product_id, 'boutique_id' => $move->boutique_id,
                                'service' => 'comptoir', 'available_qty' => $move->qty
                            ]);
                        }

                        // 3. NETTOYAGE : On supprime le mouvement "Miroir" (l'Entrée magasin correspondante)
                        // On cherche un mouvement inverse créé au même moment (à 2 sec près) pour le même produit
                        ProductMove::where('product_id', $move->product_id)
                            ->where('boutique_id', $move->boutique_id)
                            ->where('type', 'entree')           // C'était une entrée coté magasin
                            ->where('destination', 'Magasin')
                            ->where('qty', $move->qty)
                            ->whereBetween('created_at', [$move->created_at->subSeconds(2), $move->created_at->addSeconds(2)])
                            ->delete();
                    }
                    
                    // Sous-cas 2 : C'était une déclaration de PERTE
                    elseif ($move->destination === 'Perte') {
                        // Pas de contrôle complexe, on rend juste le stock au comptoir (erreur de saisie supposée)
                        if ($stockComptoir) {
                            $stockComptoir->increment('available_qty', $move->qty);
                        }
                    }
                }

                // --- CAS B : Annulation d'une ENTRÉE (ex: Transfert reçu du magasin qu'on veut refuser/annuler) ---
                elseif ($move->type === 'entree') {
                    
                    // Si on annule une entrée, on doit retirer le stock du comptoir et le rendre au magasin.
                
                    // 1. Vérifier si le comptoir a encore le stock (qu'il n'a pas été vendu entre temps)
                    $comptoirQty = $stockComptoir ? $stockComptoir->available_qty : 0;
                    
                    if ($comptoirQty < $move->qty) {
                        throw new \Exception("Impossible d'annuler cette entrée : Vous avez déjà vendu ces articles (Stock comptoir insuffisant).");
                    }

                    // 2. On retire du comptoir
                    $stockComptoir->available_qty -= $move->qty;
                    $stockComptoir->save();

                    // 3. On rend au magasin (Provenance probable)
                   if( Auth::user()->role->name == "comptoir"){ 
                    ProductStock::where([
                        'product_id'  => $move->product_id,
                        'boutique_id' => $move->boutique_id,
                        'service'     => 'magasin'
                    ])->increment('available_qty', $move->qty);
                   }
                }


                // Suppression finale du mouvement historique
                $move->delete();
            });

            return redirect()->back()->with('success', 'Mouvement annulé et stocks rétablis.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
 /**
     * Méthode privée pour construire la requête filtrée
     * INTEGRE MAINTENANT LA LOGIQUE RBAC (Role-Based Access Control)
     */
    private function getHistoryQuery(Request $request, $boutiqueId)
    {
        $user = Auth::user();
        
        // On charge le rôle pour faire la vérification (si pas déjà chargé)
        $user->role; 

        $query = ProductMove::query()
            ->where('boutique_id', $boutiqueId)
            ->with([
                'product:id,designation,sku', 
                'user:id,first_name,last_name'
            ]);

        // --- LOGIQUE DE SÉCURITÉ : Restriction Commercial ---
        // Vérifiez ici le nom exact de votre rôle en base de données (ex: 'Commercial', 'Vendeur', etc.)
        $isCommercial = $user->role && (
            str_contains(strtolower($user->role->name), 'commercial') || 
            str_contains(strtolower($user->role->name), 'vendeur')
        );

        if ($isCommercial) {
            // Le commercial ne voit que :
            // 1. Les mouvements qu'il a créés (user_id)
            // 2. OU les mouvements qui partent du Comptoir (Origine)
            // 3. OU les mouvements qui arrivent au Comptoir (Destination)
            $query->where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('departure', 'Comptoir')
                  ->orWhere('destination', 'Comptoir');
            });
        }

        // --- Filtres Standards ---

        // Filtre 1: Recherche Textuelle
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
                });
            });
        }

        // Filtre 2: ID Produit
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filtre 3: Type
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filtre 4: Dates
        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        return $query->latest();
    }

    /**
     * AFFICHER L'HISTORIQUE (Vue React)
     */
    public function history(Request $request)
    {
        $user = Auth::user();

        if (!$user->boutique_id) {
            return redirect()->back()->with('error', "Aucune boutique assignée.");
        }

        // La requête contient maintenant la restriction Commercial automatiquement
        $query = $this->getHistoryQuery($request, $user->boutique_id);

        $moves = $query->paginate(20)->withQueryString();

        // Pour la liste des produits (filtre), on garde tous les produits 
        // car le commercial peut vouloir filtrer sur un produit même s'il n'a pas fait de mouvement dessus
        $products = Product::orderBy('designation')->get(['id', 'designation', 'sku']);

        return Inertia::render('MagBoutique/MagMoves', [
            'moves'    => $moves,
            'products' => $products,
            'filters'  => $request->only(['search', 'type', 'date_start', 'date_end', 'product_id']),
        ]);
    }

    /**
     * EXPORTER L'HISTORIQUE (PDF ou Excel)
     */
    public function export_history(Request $request)
    {
        $user = Auth::user();
        
        // Réutilise exactement la même logique de filtrage et de restriction
        $query = $this->getHistoryQuery($request, $user->boutique_id);
        $moves = $query->get(); 

        $format = $request->input('format', 'pdf');
        $fileName = 'historique_stock_' . date('d-m-Y_His');

        // EXPORT EXCEL
        if ($format === 'excel') {
            return Excel::download(new ProductMovesExport($moves), $fileName . '.xlsx');
        }

        // EXPORT PDF
        if ($format === 'pdf') {
            $data = [
                'title'    => 'Historique des Mouvements' . ($request->type ? ' (' . ucfirst($request->type) . ')' : ''),
                'boutique' => $user->boutique->name,
                'user'     => $user->first_name . ' ' . $user->last_name, // On ajoute qui a exporté
                'date'     => date('d/m/Y H:i'),
                'moves'    => $moves,
                'filters'  => [
                    'start' => $request->date_start,
                    'end'   => $request->date_end,
                    'type'  => $request->type
                ]
            ];

            $pdf = Pdf::loadView('boutique_pdf.moves_history', $data);
            return $pdf->download($fileName . '.pdf');
        }
    }
}