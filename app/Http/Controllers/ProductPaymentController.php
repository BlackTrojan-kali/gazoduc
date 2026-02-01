<?php

namespace App\Http\Controllers;

    use App\Models\BoutiquePayment;
use App\Models\ProductSale;
use App\Models\UnassociatedFacture; // Import du modèle tampon
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductPaymentController extends Controller
{
    //

// 1. MÉTHODE POUR AFFICHER LA PAGE (Passer les données à la modale)
public function index()
{
    $user = Auth::user();

    // A. On récupère la ligne unique des factures non associées
    $unassociated = UnassociatedFacture::first();
    
    // B. On extrait les IDs (tableau vide si pas d'enregistrement)
    $idsToProcess = $unassociated ? ($unassociated->product_sales_id ?? []) : [];

    // C. On récupère les VRAIS objets Ventes correspondant à ces IDs
    $salesToAssociate = ProductSale::with('customer')
        ->whereIn('id', $idsToProcess)
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('Payments/Index', [
        'salesToAssociate' => $salesToAssociate, // On passe ça à la modale
        // ... autres props
    ]);
}

// 2. MÉTHODE POUR ENREGISTRER LE VERSEMENT
public function store(Request $request)
{
    $validated = $request->validate([
        'amount'         => 'required|numeric|min:1',
        'counter_id'     => 'nullable|exists:counters,id',
        'reference'      => 'nullable|string',
        'label'          => 'nullable|string',
        'selected_sales' => 'required|array|min:1', // Obligatoire de sélectionner
        'selected_sales.*' => 'exists:productsales,id',
    ]);

    DB::transaction(function () use ($validated) {
        $user = Auth::user();

        // A. Création du Versement
        $payment = BoutiquePayment::create([
            'counter_id'   => $validated['counter_id'] ?? $user->counter_id,
            'user_id'      => $user->id,
            'amount'       => $validated['amount'],
            'label'        => $validated['label'] ?? 'Règlement factures en attente',
            'label_amount' => $validated['amount'],
            'reference'    => $validated['reference'],
        ]);

        // B. Lier les ventes au paiement (Table pivot)
        $payment->productSales()->attach($validated['selected_sales']);

        // C. Mettre à jour le statut des ventes (Optionnel : marquer comme payé)
        // ProductSale::whereIn('id', $validated['selected_sales'])->update(['payment_status' => 'paid']);

        // ---------------------------------------------------------
        // D. NETTOYAGE DE LA TABLE UNASSOCIATED (Cœur de votre demande)
        // ---------------------------------------------------------
        
        // 1. Verrouiller la ligne pour éviter les conflits
        $unassociated = UnassociatedFacture::lockForUpdate()->first();

        if ($unassociated) {
            // Récupérer les IDs actuels en base
            $currentIds = $unassociated->product_sales_id ?? [];
            
            // Les IDs qu'on vient de traiter/payer
            $processedIds = $validated['selected_sales'];

            // On retire les IDs traités du tableau original (différence de tableaux)
            $remainingIds = array_diff($currentIds, $processedIds);

            // Mise à jour avec les IDs restants (array_values pour réindexer proprement [0,1,2...])
            $unassociated->update([
                'product_sales_id' => array_values($remainingIds)
            ]);
        }
        // ---------------------------------------------------------
    });

    return redirect()->back()->with('success', 'Versement effectué et factures associées retirées de la liste d\'attente.');
}
}
