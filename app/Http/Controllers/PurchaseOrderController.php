<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderLine;
use App\Models\Supplier;
use App\Models\Boutique;
use App\Models\Product;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PurchaseOrderController extends Controller
{
    /**
     * Affiche la liste des bons de commande et gère la modale globale.
     */
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'boutique', 'lines.product']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('reference', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $purchaseOrders = $query->latest()->paginate(15)->withQueryString();

        // CHARGEMENT DES PRODUITS (Correction avec prix_achat, barcode et image_url)
        $products = Product::orderBy('designation')->get([
            'id', 
            'designation', 
            'sku', 
            'barcode', 
            'prix_achat', // Remplacé ici !
            'image_url'
        ]);

        return Inertia::render('MagBoutique/PurchaseOrders/PurchaseOrderIndex', [
            'purchaseOrders' => $purchaseOrders,
            'suppliers'      => Supplier::orderBy('name')->get(['id', 'name']),
            'boutiques'      => Boutique::orderBy('name')->get(['id', 'name']),
            'products'       => $products,
            'filters'        => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Enregistre un nouveau bon de commande avec toutes ses lignes.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id'            => ['required', 'exists:suppliers,id'],
            'boutique_id'            => ['required', 'exists:boutiques,id'],
            'order_date'             => ['required', 'date'],
            'expected_delivery_date' => ['nullable', 'date', 'after_or_equal:order_date'],
            'reference'              => ['nullable', 'string', 'unique:purchase_orders,reference'],
            
            // Validation du tableau d'articles (lines)
            'lines'                  => ['nullable', 'array'],
            'lines.*.product_id'     => ['required', 'exists:products,id'],
            'lines.*.quantity_ordered'=> ['required', 'numeric', 'min:0.01'],
            'lines.*.unit_price'     => ['required', 'numeric', 'min:0'],
        ]);

        if (empty($validated['reference'])) {
            $validated['reference'] = $this->generateReference();
        }

        DB::transaction(function () use ($validated) {
            // 1. Création de l'en-tête
            $po = PurchaseOrder::create([
                'supplier_id'            => $validated['supplier_id'],
                'boutique_id'            => $validated['boutique_id'],
                'reference'              => $validated['reference'],
                'order_date'             => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'],
                'status'                 => 'draft', // Toujours brouillon à la création
                'total_amount'           => 0,
            ]);

            // 2. Création des lignes et calcul du total
            $totalAmount = 0;
            
            if (!empty($validated['lines'])) {
                foreach ($validated['lines'] as $line) {
                    $subtotal = $line['quantity_ordered'] * $line['unit_price'];
                    $totalAmount += $subtotal;

                    PurchaseOrderLine::create([
                        'purchase_order_id' => $po->id,
                        'product_id'        => $line['product_id'],
                        'quantity_ordered'  => $line['quantity_ordered'],
                        'quantity_recieved' => 0, // 0 lors de la commande
                        'unit_price'        => $line['unit_price'],
                        'subtotal'          => $subtotal,
                    ]);
                }
            }

            // 3. Mise à jour du total général
            $po->update(['total_amount' => $totalAmount]);
        });

        return redirect()->back()->with('success', 'Le bon de commande a été créé avec succès.');
    }

    /**
     * Met à jour le bon de commande et synchronise ses articles.
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        // Sécurité Backend : On bloque la modification si la commande est envoyée
        if ($purchaseOrder->status !== 'draft') {
            return back()->withErrors(['message' => 'Impossible de modifier une commande déjà envoyée au fournisseur.']);
        }

        $validated = $request->validate([
            'supplier_id'            => ['required', 'exists:suppliers,id'],
            'boutique_id'            => ['required', 'exists:boutiques,id'],
            'order_date'             => ['required', 'date'],
            'expected_delivery_date' => ['nullable', 'date', 'after_or_equal:order_date'],
            'reference'              => ['required', 'string', Rule::unique('purchase_orders')->ignore($purchaseOrder->id)],
            "status"                   =>["nullable"],
            'lines'                  => ['nullable', 'array'],
            'lines.*.product_id'     => ['required', 'exists:products,id'],
            'lines.*.quantity_ordered'=> ['required', 'numeric', 'min:0.01'],
            'lines.*.unit_price'     => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $purchaseOrder) {
            // 1. Mise à jour de l'en-tête
            $purchaseOrder->update([
                'supplier_id'            => $validated['supplier_id'],
                'boutique_id'            => $validated['boutique_id'],
                'reference'              => $validated['reference'],
                "status"                => $validated["status"],
                'order_date'             => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'],
            ]);

            // 2. Nettoyage des anciennes lignes
            $purchaseOrder->lines()->delete();

            // 3. Recréation des lignes et calcul
            $totalAmount = 0;
            
            if (!empty($validated['lines'])) {
                foreach ($validated['lines'] as $line) {
                    $subtotal = $line['quantity_ordered'] * $line['unit_price'];
                    $totalAmount += $subtotal;

                    PurchaseOrderLine::create([
                        'purchase_order_id' => $purchaseOrder->id,
                        'product_id'        => $line['product_id'],
                        'quantity_ordered'  => $line['quantity_ordered'],
                        'quantity_recieved' => 0,
                        'unit_price'        => $line['unit_price'],
                        'subtotal'          => $subtotal,
                    ]);
                }
            }

            // 4. Mise à jour du total
            $purchaseOrder->update(['total_amount' => $totalAmount]);
        });

        return redirect()->back()->with('success', 'Le bon de commande a été mis à jour.');
    }

    /**
     * Change le statut du bon de commande.
     */
    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:draft,sent,partial,received,cancelled'],
        ]);

        if ($validated['status'] === 'sent' && $purchaseOrder->lines()->count() === 0) {
            return back()->withErrors(['message' => 'Impossible d\'envoyer une commande sans aucun article.']);
        }

        $purchaseOrder->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', "Le statut de la commande est passé à : " . $validated['status']);
    }

    /**
     * Supprime un bon de commande (uniquement si brouillon ou annulé).
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['draft', 'cancelled'])) {
            return back()->withErrors(['message' => 'Seules les commandes au statut Brouillon ou Annulé peuvent être supprimées.']);
        }

        $purchaseOrder->delete();

        return redirect()->back()->with('success', 'Bon de commande supprimé.');
    }

    /**
     * Génère une référence unique (Format: PO-YYYYMM-XXXX).
     */
    private function generateReference(): string
    {
        $prefix = 'PO-' . now()->format('Ym') . '-';
        $lastOrder = PurchaseOrder::where('reference', 'like', "{$prefix}%")
                                  ->orderBy('id', 'desc')
                                  ->first();

        if (! $lastOrder) {
            return $prefix . '0001';
        }

        // Extrait les 4 derniers chiffres et incrémente
        $lastNumber = (int) substr($lastOrder->reference, -4);
        return $prefix . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
    /**
     * Génère et télécharge le Bon de Commande en PDF.
     */
    public function downloadPdf(PurchaseOrder $purchaseOrder)
    {
        // 1. Charger les relations nécessaires
        $purchaseOrder->load(['supplier', 'boutique', 'lines.product']);

        // 2. Préparer les données pour la vue
        $data = [
            'po' => $purchaseOrder,
            'logo' => public_path('images/logo.png') // Optionnel: Chemin vers votre logo
        ];

        // 3. Générer le PDF à partir d'une vue Blade
        $pdf = Pdf::loadView('PDF.purchase_order', $data);

        // 4. Définir le nom du fichier (ex: Commande_BC-202602-0001.pdf)
        $fileName = 'Commande_' . ($purchaseOrder->reference ?? $purchaseOrder->id) . '.pdf';

        // 5. Afficher le PDF dans le navigateur (stream) ou forcer le téléchargement (download)
        return $pdf->stream($fileName);
    }
}