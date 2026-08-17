<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use App\Models\Facture;
use App\Models\FactureItem;
use App\Services\ManualCsphService;

class CsphReportController extends Controller
{
    /**
     * Affiche la page de déclaration mensuelle sur React.
     */
    public function index(Request $request)
    {
        // Mois précédent par défaut, ou celui sélectionné
        $month = $request->input('month', Carbon::now()->subMonth()->format('m'));
        $year = $request->input('year', Carbon::now()->format('Y'));

        $reportData = $this->generateRealSalesData($month, $year);

        return Inertia('Direction/CsphDeclaration', [
            'reportData' => $reportData['lignes'],
            'grandTotal' => $reportData['grandTotal'],
            'totalTonnes' => $reportData['totalTonnes'],
            'selectedMonth' => str_pad($month, 2, '0', STR_PAD_LEFT),
            'selectedYear' => $year
        ]);
    }

    /**
     * Exporte la déclaration en PDF (Format CSPH).
     */
    public function exportPdf(Request $request)
    {
        $month = $request->input('month', Carbon::now()->subMonth()->format('m'));
        $year = $request->input('year', Carbon::now()->format('Y'));
        
        $reportData = $this->generateRealSalesData($month, $year);
        
        // Formate le mois en français (ex: "JUIN 2026")
        Carbon::setLocale('fr');
        $dateStr = Carbon::createFromDate($year, $month, 1)->translatedFormat('F Y');

        $pdf = Pdf::loadView('pdfs.csph_declaration', [
            'lignes' => $reportData['lignes'],
            'grandTotal' => $reportData['grandTotal'],
            'totalTonnes' => $reportData['totalTonnes'],
            'periode' => strtoupper($dateStr)
        ]);

        return $pdf->download("Declaration_CSPH_{$year}_{$month}.pdf");
    }

    /**
     * Le Cerveau : Calcule la déclaration CSPH basée sur les VRAIES VENTES.
     */
    private function generateRealSalesData($month, $year)
    {
        // 1. Récupérer les lignes de factures du mois concerné, valides, pour le Gaz
        $factureItems = FactureItem::whereHas('facture', function ($q) use ($month, $year) {
            $q->whereMonth('created_at', $month)
              ->whereYear('created_at', $year)
              ->where('status', '!=', 'annulée') // On ignore les factures annulées
              ->where(function($subQ) {
                  // On s'assure qu'on prend les factures de Gaz
                  $subQ->where('licence', 'gaz')->orWhereNull('licence'); 
              });
        })->with(['facture.agency.city', 'article'])->get();

        $groupedData = [];
        $grandTotal = 0;
        $totalTonnes = 0;

        // 2. Traitement et calcul ligne par ligne
        foreach ($factureItems as $item) {
            $article = $item->article;
            $weightInKg = (float) ($article->weight_per_unit ?? 0);

            // On ignore les articles sans poids (ex: prestations de service, consignations)
            if ($weightInKg <= 0) continue; 

            $agency = $item->facture->agency;
            $city = $agency->city;
            
            $cityName = $city ? strtoupper($city->name) : 'INCONNUE';
            $taux = $city ? (float) $city->transport_cost_per_tonne : 0;

            // Calcul mathématique des Tonnes et du Total
            $tonnes = ($item->quantity * $weightInKg) / 1000;
            $totalLigne = round($tonnes * $taux);

            // Déduction du Type (Conditionné ou Vrac)[cite: 3]
            $isVrac = stripos($article->name, 'vrac') !== false || $article->type === 'matiere_premiere';
            $typeGaz = $isVrac ? 'Vrac' : 'Conditionné';
            
            // Note: Si CAMOCO a plusieurs sources (Via Bipaga, Hors SCDP), il faudra 
            // le préciser au moment de l'achat. Par défaut, on met "Ex - SCDP"[cite: 3].
            $source = 'Ex - SCDP'; 
            
            $groupKey = $cityName . '_' . $source . '_' . $typeGaz;

            // Groupement des données
            if (!isset($groupedData[$groupKey])) {
                $groupedData[$groupKey] = [
                    'ville' => $cityName,
                    'source' => $source,
                    'type' => $typeGaz,
                    'quantite' => 0,
                    'taux' => $taux,
                    'total' => 0
                ];
            }

            $groupedData[$groupKey]['quantite'] += $tonnes;
            $groupedData[$groupKey]['total'] += $totalLigne;
            
            $grandTotal += $totalLigne;
            $totalTonnes += $tonnes;
        }

        // 3. Trier par ville pour avoir un beau rendu comme le document officiel
        $lignesTriees = collect($groupedData)->sortBy('ville')->values()->toArray();

        return [
            'lignes' => $lignesTriees,
            'grandTotal' => $grandTotal,
            'totalTonnes' => $totalTonnes
        ];
    }
    /**
     * Reçoit les données saisies manuellement depuis React et génère le PDF.
     */
    public function exportManualPdf(Request $request, ManualCsphService $manualService)
    {
        // 1. Validation stricte des données envoyées par React
        $request->validate([
            'periode' => 'required|string', // Ex: "JUIN 2026" ou "DU 01/01 AU 31/01"
            'lignes' => 'required|array|min:1',
            'lignes.*.ville' => 'required|string',
            'lignes.*.quantite' => 'required|numeric|min:0.0001',
            'lignes.*.taux' => 'required|numeric', // Peut être positif ou négatif
        ]);

        $periode = $request->input('periode');
        $lignesBrutes = $request->input('lignes');

        // 2. Traitement mathématique via notre Service
        $reportData = $manualService->processManualData($lignesBrutes);

        // 3. Génération du document PDF
        $pdf = Pdf::loadView('pdfs.csph_manual_declaration', [
            'lignes' => $reportData['lignes'],
            'grandTotal' => $reportData['grandTotal'],
            'totalTonnes' => $reportData['totalTonnes'],
            'periode' => strtoupper($periode)
        ]);

        // 4. Téléchargement
        return $pdf->download("Declaration_CSPH_Manuelle.pdf");
    }
}