<?php

namespace App\Http\Controllers;

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
   // ... méthode store ...
   public function store(Request $request)
{
    $validated = $request->validate([
        'customer_id'     => 'required|exists:customers,id',
        'counter_id'      => 'required|exists:counters,id',
        'payment_mode'    => 'required|string',
        'received_amount' => 'nullable|numeric',
        'total_ht'        => 'required|numeric',
        'total_ttc'       => 'required|numeric',
        'items'           => 'required|array|min:1',
        'items.*.product_id' => 'required|exists:products,id',
        'items.*.qty'        => 'required|numeric|min:1',
        'items.*.unit_price' => 'required|numeric',
        'items.*.sub_total'  => 'required|numeric',
    ]);

    $user = Auth::user();

    try {
        $saleId = null;

        DB::transaction(function () use ($validated, $user, &$saleId) {
            
            $factureCode = 'FAC-' . strtoupper(Str::random(8)) . '-' . time();

            // 1. ENREGISTREMENT DE LA VENTE
            $sale = ProductSale::create([
                'boutique_id'     => $user->boutique_id,
                'user_id'         => $user->id,
                'customer_id'     => $validated['customer_id'],
                'counter_id'      => $validated['counter_id'],
                'facture_code'    => $factureCode,
                'total_ht'        => $validated['total_ht'],
                'total_ttc'       => $validated['total_ttc'],
                'received_amount' => $validated['received_amount'],
                'payment_mode'    => $validated['payment_mode'],
                'status'          => 'completed',
                'sync_status'     => 'pending',
            ]);

            $saleId = $sale->id;

            // 2. TRAITEMENT DES LIGNES (Items + Stock + Mouvements)
            foreach ($validated['items'] as $item) {
                
                // A. Création de la ligne de vente
                ProductSaleItem::create([
                    'sale_id'    => $sale->id,
                    'product_id' => $item['product_id'],
                    'qty'        => $item['qty'],
                    'unit_price' => $item['unit_price'],
                    'discount'   => $item['discount'] ?? 0,
                    'sub_total'  => $item['sub_total'],
                ]);

                // B. Récupération et Décrémentation du Stock Comptoir
                $stock = ProductStock::where([
                    'product_id'  => $item['product_id'],
                    'boutique_id' => $user->boutique_id,
                    'service'     => 'comptoir'
                ])->lockForUpdate()->first(); // Verrouillage important

                $currentStock = 0;
                if ($stock) {
                    $currentStock = $stock->available_qty; // Stock avant vente
                    $stock->decrement('available_qty', $item['qty']);
                }

                // C. ENREGISTREMENT DU MOUVEMENT DE SORTIE (Historique)
                // C'est ici qu'on trace que le produit est sorti pour une vente
                ProductMove::create([
                    'boutique_id' => $user->boutique_id,
                    'user_id'     => $user->id,
                    'product_id'  => $item['product_id'],
                    'type'        => 'sortie',
                    'qty'         => $item['qty'],
                    'departure'   => 'Comptoir', // Source
                    'destination' => 'Client',   // Destination
                    'description' => "Vente ticket #{$factureCode}", // Libellé explicite
                    // Optionnel : enregistrer le stock restant pour audit
                    'remaining_stock' => $stock ? ($currentStock - $item['qty']) : 0 
                ]);
            }

            // 3. GESTION DES FACTURES NON ASSOCIÉES (SINGLETON)
            // On utilise firstOrCreate pour garantir qu'une ligne existe, puis on update
            $unassociated = UnassociatedFacture::lockForUpdate()->first();

            if (!$unassociated) {
                // Si la table est vide, on la crée avec le premier ID
                UnassociatedFacture::create(['product_sales_id' => [$sale->id]]);
            } else {
                // Si elle existe, on récupère le tableau existant, on ajoute, et on sauvegarde
                $currentIds = $unassociated->product_sales_id ?? [];
                
                // On évite les doublons par sécurité
                if (!in_array($sale->id, $currentIds)) {
                    $currentIds[] = $sale->id;
                    $unassociated->update(['product_sales_id' => $currentIds]);
                }
            }
        });

        // 4. RETOUR AVEC URL D'IMPRESSION
        // On renvoie un succès ET l'URL pour générer le PDF
        return redirect()->back()->with([
            'success' => 'Vente enregistrée avec succès.',
            'print_url' => route('sales.print', $saleId) 
        ]);

    } catch (\Exception $e) {
        return redirect()->back()->withErrors(['error' => "Erreur transaction : " . $e->getMessage()]);
    }
}
    /**
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