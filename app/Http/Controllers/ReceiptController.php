<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Models\ReceiptLine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderLine;
use App\Models\Productstock;
use App\Models\ProductMove;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReceiptController extends Controller
{
    /**
     * Affiche l'historique des réceptions et charge les données pour la modale.
     */
    public function index(Request $request)
    {
        $query = Receipt::with(['purchaseOrder.supplier', 'boutique', 'lines.product']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('reference', 'like', "%{$search}%")
                  ->orWhereHas('purchaseOrder', function($q) use ($search) {
                      $q->where('reference', 'like', "%{$search}%")
                        ->orWhereHas('supplier', function($q2) use ($search) {
                            $q2->where('name', 'like', "%{$search}%");
                        });
                  });
        }

        $receipts = $query->latest('received_at')->paginate(15)->withQueryString();

        // Pour la création : on ne charge que les Bons de Commande "Envoyés" ou "Partiellement reçus"
        $pendingPOs = PurchaseOrder::with(['supplier', 'lines.product'])
                                   ->whereIn('status', ['sent', 'partial'])
                                   ->orderBy('id', 'desc')
                                   ->get();

        return Inertia::render('MagBoutique/Receipts/ReceiptIndex', [
            'receipts'       => $receipts,
            'purchaseOrders' => $pendingPOs,
            'boutiques'      => Boutique::orderBy('name')->get(['id', 'name']),
            'filters'        => $request->only(['search']),
        ]);
    }

    /**
     * Enregistre un nouveau bon de réception.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_order_id'       => ['required', 'exists:purchase_orders,id'],
            'boutique_id'             => ['required', 'exists:boutiques,id'],
            'reference'               => ['nullable', 'string', 'max:255'], // Réf. du Bordereau Livreur
            'received_at'             => ['required', 'date'],
            'status'                  => ['required', 'in:pending,validated'],
            
            // Lignes de réception
            'lines'                   => ['required', 'array', 'min:1'],
            'lines.*.product_id'      => ['required', 'exists:products,id'],
            'lines.*.quantity_accepted'=> ['required', 'numeric', 'min:0'],
            'lines.*.quantity_rejected'=> ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Création de l'en-tête du Bon de Réception
            $receipt = Receipt::create([
                'purchase_order_id' => $validated['purchase_order_id'],
                'boutique_id'       => $validated['boutique_id'],
                'reference'         => $validated['reference'],
                'received_at'       => $validated['received_at'],
                'status'            => $validated['status'],
            ]);

            // 2. Création des lignes
            foreach ($validated['lines'] as $line) {
                ReceiptLine::create([
                    'receipt_id'        => $receipt->id,
                    'product_id'        => $line['product_id'],
                    'boutique_id'       => $validated['boutique_id'],
                    'quantity_accepted' => $line['quantity_accepted'],
                    'quantity_rejected' => $line['quantity_rejected'],
                    'service'           => 'magasin', // Déchargé en réserve par défaut
                ]);
            }

            // 3. Si le statut est "validated", on déclenche l'entrée en stock physique
            if ($receipt->status === 'validated') {
                $this->processValidation($receipt);
            }
        });

        return redirect()->back()->with('success', 'Le bon de réception a été enregistré.');
    }

    /**
     * Met à jour un bon de réception (Uniquement s'il est en brouillon/pending).
     */
    public function update(Request $request, Receipt $receipt)
    {
        if ($receipt->status === 'validated') {
            return back()->withErrors(['message' => 'Impossible de modifier une réception déjà validée en stock.']);
        }

        $validated = $request->validate([
            'boutique_id'             => ['required', 'exists:boutiques,id'],
            'reference'               => ['nullable', 'string', 'max:255'],
            'received_at'             => ['required', 'date'],
            'status'                  => ['required', 'in:pending,validated'],
            
            'lines'                   => ['required', 'array', 'min:1'],
            'lines.*.product_id'      => ['required', 'exists:products,id'],
            'lines.*.quantity_accepted'=> ['required', 'numeric', 'min:0'],
            'lines.*.quantity_rejected'=> ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $receipt) {
            // 1. Mise à jour de l'en-tête
            $receipt->update([
                'boutique_id' => $validated['boutique_id'],
                'reference'   => $validated['reference'],
                'received_at' => $validated['received_at'],
                'status'      => $validated['status'],
            ]);

            // 2. Nettoyage et recréation des lignes
            $receipt->lines()->delete();

            foreach ($validated['lines'] as $line) {
                ReceiptLine::create([
                    'receipt_id'        => $receipt->id,
                    'product_id'        => $line['product_id'],
                    'boutique_id'       => $validated['boutique_id'],
                    'quantity_accepted' => $line['quantity_accepted'],
                    'quantity_rejected' => $line['quantity_rejected'],
                    'service'           => 'magasin',
                ]);
            }

            // 3. Si on passe à validé, on exécute l'entrée en stock
            if ($receipt->status === 'validated') {
                $this->processValidation($receipt);
            }
        });

        return redirect()->back()->with('success', 'Le bon de réception a été mis à jour.');
    }

    /**
     * Supprime un bon de réception brouillon.
     */
    public function destroy(Receipt $receipt)
    {
        if ($receipt->status === 'validated') {
            return back()->withErrors(['message' => 'Impossible de supprimer une réception validée. Les stocks ont déjà été impactés.']);
        }

        $receipt->delete();

        return redirect()->back()->with('success', 'Brouillon de réception supprimé.');
    }

    /**
     * MÉTHODE PRIVÉE : Traite la validation d'une réception.
     * Met à jour les stocks, génère l'historique et clôture le Bon de Commande.
     */
    private function processValidation(Receipt $receipt)
    {
        $purchaseOrder = $receipt->purchaseOrder;
        $allLinesFullyReceived = true;

        foreach ($receipt->lines as $receiptLine) {
            
            // Si aucune quantité acceptée, on passe au produit suivant
            if ($receiptLine->quantity_accepted <= 0) {
                continue;
            }

            // --- A. MISE À JOUR DU STOCK PHYSIQUE (Productstock) ---
            $stock = Productstock::firstOrCreate(
                [
                    'product_id'  => $receiptLine->product_id,
                    'boutique_id' => $receipt->boutique_id,
                    'service'     => 'magasin', // Toujours en réserve à la livraison
                ],
                ['qty' => 0]
            );

            $stock->qty += $receiptLine->quantity_accepted;
            $stock->save();

            // --- B. TRAÇABILITÉ : CRÉATION DU MOUVEMENT (ProductMove) ---
            ProductMove::create([
                'product_id'      => $receiptLine->product_id,
                'boutique_id'     => $receipt->boutique_id,
                'qty'             => $receiptLine->quantity_accepted,
                'remaining_stock' => $stock->qty, // Le stock APRÈS le mouvement
                'type'            => 'ENTREE',
                'label'           => 'Réception Commande ' . $purchaseOrder->reference,
                'departure'       => 'FOURNISSEUR',
                'destination'     => 'MAGASIN',
                'user_id'         => Auth::user()->id, // Le magasinier qui valide
            ]);

            // --- C. MISE À JOUR DE LA LIGNE DE COMMANDE INITIALE ---
            // On retrouve la ligne du PurchaseOrder correspondante
            $poLine = PurchaseOrderLine::where('purchase_order_id', $purchaseOrder->id)
                                       ->where('product_id', $receiptLine->product_id)
                                       ->first();

            if ($poLine) {
                // ATTENTION: On garde l'orthographe "quantity_recieved" de votre migration !
                $poLine->quantity_recieved += $receiptLine->quantity_accepted;
                $poLine->save();

                // Si au moins une ligne n'est pas totalement livrée, le BC n'est pas "terminé"
                if ($poLine->quantity_recieved < $poLine->quantity_ordered) {
                    $allLinesFullyReceived = false;
                }
            }
        }

        // --- D. MISE À JOUR DU STATUT DU BON DE COMMANDE ---
        // Si tout a été reçu (ou plus), le BC passe à "received". Sinon, il passe à "partial".
        $purchaseOrder->update([
            'status' => $allLinesFullyReceived ? 'received' : 'partial'
        ]);
    }
}