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
                // On récupère le mouvement et on verrouille la ligne pour l'intégrité
                $move = ProductMove::lockForUpdate()->findOrFail($id);

                // CAS 1 : Annuler une ENTRÉE (ex: erreur de saisie approvisionnement)
                // Conséquence : On doit RETIRER du stock.
                // Risque : Si on retire alors que le stock a déjà été vendu, on tombe en négatif.
                if ($move->type === 'entree') {
                    
                    $service = ($move->destination === 'Comptoir') ? 'comptoir' : 'magasin';
                    
                    $stock = ProductStock::where([
                        'product_id'  => $move->product_id, 
                        'boutique_id' => $move->boutique_id, 
                        'service'     => $service
                    ])->lockForUpdate()->first();

                    $currentQty = $stock ? $stock->available_qty : 0;

                    if ($currentQty < $move->qty) {
                        throw new \Exception("Impossible d'annuler cette entrée : Les articles ont déjà été consommés ou vendus (Stock actuel insuffisant).");
                    }

                    $stock->decrement('available_qty', $move->qty);
                } 
                
                // CAS 2 : Annuler une SORTIE
                // Conséquence : On REMET du stock au magasin. (Pas de risque de négatif ici)
                // MAIS : Si c'était un transfert vers le comptoir, on doit RETIRER du comptoir.
                elseif ($move->type === 'sortie') {
                    
                    // A. On remet le stock au magasin
                    ProductStock::where([
                        'product_id'  => $move->product_id, 
                        'boutique_id' => $move->boutique_id, 
                        'service'     => 'magasin'
                    ])->increment('available_qty', $move->qty);

                    // B. Si c'était un transfert vers le commercial, on doit annuler l'entrée au comptoir
                    if (strtolower($move->destination) === 'commercial') {
                        
                        $stockComptoir = ProductStock::where([
                            'product_id'  => $move->product_id, 
                            'boutique_id' => $move->boutique_id, 
                            'service'     => 'comptoir'
                        ])->lockForUpdate()->first();

                        $currentComptoirQty = $stockComptoir ? $stockComptoir->available_qty : 0;

                        if ($currentComptoirQty < $move->qty) {
                            throw new \Exception("Impossible d'annuler ce transfert : Les articles transférés au comptoir ont déjà été vendus.");
                        }

                        $stockComptoir->decrement('available_qty', $move->qty);
                    }
                }

                // Suppression (La cascade SQL gérera la suppression de l'entrée liée si elle existe, 
                // mais nous avons déjà géré la logique de stock ci-dessus).
                $move->delete();
            });

            return redirect()->back()->with('success', 'Mouvement annulé et stocks ajustés.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
   /**
     * Méthode privée pour construire la requête filtrée (DRY: Don't Repeat Yourself)
     */
    private function getHistoryQuery(Request $request, $boutiqueId)
    {
        $query = ProductMove::query()
            ->where('boutique_id', $boutiqueId)
            ->with([
                'product:id,designation,sku', 
                'user:id,first_name,last_name'
            ]);

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

        // Filtre 2: ID Produit spécifique (Vient de la modale d'export)
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

        return $query->latest(); // Tri par défaut
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

        // Utilisation de la méthode commune
        $query = $this->getHistoryQuery($request, $user->boutique_id);

        $moves = $query->paginate(20)->withQueryString();

        // AJOUT CRUCIAL : Liste des produits pour la modale d'export
        $products = Product::orderBy('designation')->get(['id', 'designation', 'sku']);

        return Inertia::render('MagBoutique/MagMoves', [
            'moves'    => $moves,
            'products' => $products, // Passé à la vue pour ExportHistoryModal
            'filters'  => $request->only(['search', 'type', 'date_start', 'date_end', 'product_id']),
        ]);
    }

    /**
     * EXPORTER L'HISTORIQUE (PDF ou Excel)
     */
    public function export_history(Request $request)
    {
        $user = Auth::user();
        
        // 1. Récupération des données avec les MÊMES filtres
        $query = $this->getHistoryQuery($request, $user->boutique_id);
        $moves = $query->get(); // On récupère tout (pas de pagination)

        $format = $request->input('format', 'pdf');
        $fileName = 'historique_stock_' . date('d-m-Y_His');

        // 2. EXPORT EXCEL
        if ($format === 'excel') {
            return Excel::download(new ProductMovesExport($moves), $fileName . '.xlsx');
        }

        // 3. EXPORT PDF
        if ($format === 'pdf') {
            $data = [
                'title'     => 'Historique des Mouvements de Stock',
                'boutique'  => $user->boutique->name,
                'date'      => date('d/m/Y H:i'),
                'moves'     => $moves,
                'filters'   => [
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