<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductSale;
use App\Models\ProductSaleItem;
use App\Models\ProductStock;
use App\Models\ProductMove;
use App\Models\UnassociatedFacture; // Import du modèle
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf; // Assurez-vous d'avoir installé barryvdh/laravel-dompdf
use Carbon\Carbon;
use Inertia\Inertia;

class ProductSalesController extends Controller
{
 /**
     * Valide le panier, encaisse le paiement, déduit les stocks et met en attente la facture.
     */
/**
     * Valide le panier, encaisse le paiement, déduit les stocks et met en attente la facture.
     */
    public function store(Request $request)
    {
        // 1. Validation : On écoute 'cart' (venant de React) au lieu de 'items'
        $validated = $request->validate([
            'customer_id'       => 'nullable|exists:customers,id',
            'counter_id'        => 'required|exists:counters,id',
            'payment_mode'      => 'required|string',
            'amount_paid'       => 'nullable|numeric', 
            'total_ht'          => 'required|numeric',
            'total_ttc'         => 'required|numeric',
            'cart'              => 'required|array|min:1',
            'cart.*.id'         => 'required|exists:products,id',
            'cart.*.qty'        => 'required|numeric|min:0.01',
            'cart.*.discount'   => 'nullable|numeric',
        ]);

        $user = Auth::user();

        // --- NOUVEAU : VÉRIFICATION DE LA SESSION DE CAISSE ---
        // On cherche la session active du caissier dans cette boutique.
        // (Ajustez 'open' selon le mot exact que vous utilisez pour le statut d'une session ouverte, ex: 'en cours', 'ouvert')
        $activeSession = \App\Models\PosSession::where('user_id', $user->id)
                            ->where('boutique_id', $user->boutique_id)
                            ->where('status', 'open') // Ou whereNull('closed_at') selon votre logique
                            ->first();

        if (!$activeSession) {
            return redirect()->back()->withErrors(['message' => "Impossible d'encaisser : Vous devez d'abord ouvrir une session de caisse pour votre service."]);
        }

        try {
            $saleId = null;

            DB::transaction(function () use ($validated, $user, $activeSession, &$saleId) {
                
                // Génération d'un code unique
                $factureCode = 'FAC-' . strtoupper(\Illuminate\Support\Str::random(6)) . '-' . time();

                // --- 1. ENREGISTREMENT DE LA VENTE ---
                $sale = Productsale::create([
                    'boutique_id'     => $user->boutique_id,
                    'user_id'         => $user->id,
                    'pos_session_id'  => $activeSession->id, // <-- AJOUT DE L'ID DE SESSION ICI
                    'customer_id'     => $validated['customer_id'] ?? null,
                    'counter_id'      => $validated['counter_id'],
                    'facture_code'    => $factureCode,
                    'total_ht'        => $validated['total_ht'],
                    'total_tva'       => 0, 
                    'total_ttc'       => $validated['total_ttc'],
                    'received_amount'     => $validated['amount_paid'],
                    'payment_mode'    => $validated['payment_mode'],
                    'status'          => 'completed',
                    'sync_status'     => 'pending',
                ]);

                $saleId = $sale->id;

                // --- 2. TRAITEMENT DES LIGNES (Items + Stock + Mouvements) ---
                foreach ($validated['cart'] as $item) {
                    
                    // On récupère le produit officiel pour recalculer le prix réel
                    $product = Product::findOrFail($item['id']);
                    $unitPrice = $product->prix_vente;
                    $subTotal = ($unitPrice * $item['qty']) - ($item['discount'] ?? 0);

                    // A. Création de la ligne de vente
                    Productsaleitem::create([
                        'sale_id'    => $sale->id,
                        'product_id' => $product->id,
                        'qty'        => $item['qty'],
                        'unit_price' => $unitPrice,
                        'discount'   => $item['discount'] ?? 0,
                        'sub_total'  => $subTotal,
                    ]);

                    // B. Récupération et Décrémentation du Stock Comptoir (Avec Verrouillage)
                    $stock = Productstock::where([
                        'product_id'  => $product->id,
                        'boutique_id' => $user->boutique_id,
                        'service'     => 'comptoir'
                    ])->lockForUpdate()->first();

                    if (!$stock || $stock->available_qty < $item['qty']) {
                        throw new \Exception("Stock insuffisant en caisse pour : " . $product->designation);
                    }

                    $stock->decrement('available_qty', $item['qty']);

                    // C. ENREGISTREMENT DU MOUVEMENT DE SORTIE (Historique)
                    ProductMove::create([
                        'product_id'      => $product->id,
                        'boutique_id'     => $user->boutique_id,
                        'user_id'         => $user->id,
                        'qty'             => $item['qty'],
                        'type'            => 'SORTIE',
                        'departure'       => 'COMPTOIR', 
                        'destination'     => 'CLIENT',  
                        'label'           => "Vente Caisse #{$factureCode}", 
                        'remaining_stock' => $stock->available_qty 
                    ]);
                }

                // --- 3. GESTION DES FACTURES NON ASSOCIÉES (SINGLETON) ---
                $unassociated = \App\Models\UnassociatedFacture::lockForUpdate()->first();

                if (!$unassociated) {
                    \App\Models\UnassociatedFacture::create(['product_sales_id' => [$sale->id]]);
                } else {
                    $currentIds = $unassociated->product_sales_id ?? [];
                    
                    if (!in_array($sale->id, $currentIds)) {
                        $currentIds[] = $sale->id;
                        $unassociated->update(['product_sales_id' => $currentIds]);
                    }
                }
            });

            // --- 4. RETOUR AVEC URL D'IMPRESSION ---
            return redirect()->back()->with([
                'success'   => 'Vente enregistrée avec succès.',
                'print_url' => route('sales.print', $saleId) 
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['message' => "Erreur transaction : " . $e->getMessage()]);
        }
    }   /**
     * Génère le Ticket de Caisse (PDF format thermique)
     */
  // Méthode pour générer le PDF (Assurez-vous d'avoir installé barryvdh/laravel-dompdf)
public function print($id)
{
    $sale = ProductSale::with(['items.product', 'user', 'customer', 'boutique'])->findOrFail($id);
    
    // Format Ticket de caisse (80mm de large environ)
    $customPaper = [0, 0, 226.77, 800]; // Largeur fixe, Hauteur ajustable selon contenu si besoin

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('boutique_pdf.ticket', compact('sale'))
        ->setPaper($customPaper, 'portrait');

    return $pdf->stream("Ticket-{$sale->facture_code}.pdf");
}
public function generateHistoryPdf(Request $request)
{
    $request->validate([
        'start_date' => 'required|date',
        'end_date'   => 'required|date|after_or_equal:start_date',
    ]);

    $user = Auth::user();
    
    // Formatage des dates pour inclure toute la journée (00:00:00 à 23:59:59)
    $startDate = Carbon::parse($request->start_date)->startOfDay();
    $endDate = Carbon::parse($request->end_date)->endOfDay();

    // Récupération des ventes avec les relations nécessaires
    $sales = ProductSale::with(['items.product', 'customer', 'user'])
        ->where('boutique_id', $user->boutique_id)
        ->whereBetween('created_at', [$startDate, $endDate])
        ->where('status', 'completed') // On ne prend que les ventes validées
        ->orderBy('created_at', 'desc')
        ->get();

    // Calculs globaux pour le rapport
    $totalPeriod = $sales->sum('total_ttc');
    $countSales = $sales->count();

    // Chargement du PDF
    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('boutique_pdf.sales_history', [
        'sales' => $sales,
        'start_date' => $startDate,
        'end_date' => $endDate,
        'boutique' => $user->boutique ?? null, // Assurez-vous d'avoir la relation boutique sur User
        'total_period' => $totalPeriod,
        'count_sales' => $countSales,
        'generated_by' => $user
    ])->setPaper('a4', 'landscape'); // Paysage pour avoir de la place pour les détails

    return $pdf->stream('Rapport_Ventes_' . $startDate->format('dmY') . '-' . $endDate->format('dmY') . '.pdf');
}
// ... imports

public function history(Request $request)
{
    $user = Auth::user();
    
    $query = ProductSale::with(['user', 'customer', 'items.product']) // On charge les relations
        ->where('boutique_id', $user->boutique_id)
        ->orderBy('created_at', 'desc');

    // 1. Filtre par Recherche (Code facture ou Nom client)
    if ($request->filled('search')) {
        $search = $request->input('search');
        $query->where(function($q) use ($search) {
            $q->where('facture_code', 'like', "%{$search}%")
              ->orWhereHas('customer', function($c) use ($search) {
                  $c->where('name', 'like', "%{$search}%");
              });
        });
    }

    // 2. Filtre par Date (Optionnel, par défaut : le mois en cours ou tout)
    if ($request->filled('date_start')) {
        $query->whereDate('created_at', '>=', $request->date_start);
    }
    if ($request->filled('date_end')) {
        $query->whereDate('created_at', '<=', $request->date_end);
    }

    $sales = $query->paginate(20)->withQueryString();

    return Inertia::render('ComBoutique/SalesHistory', [
        'sales' => $sales,
        'filters' => $request->only(['search', 'date_start', 'date_end']),
    ]);
}
}