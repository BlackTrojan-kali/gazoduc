<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class DirectionController extends Controller
{
    /**
     * Vue principale de supervision pour la Direction.
     */
    public function index()
    {
        $stocks = Stock::where("storage_type", "!=", "gaz")
            ->where("storage_type", "!=", "carburant")
            ->with(['article', 'agency.city', 'citerne'])
            ->get();

        // Calcul de la péréquation pour chaque ligne de stock
        $stocks->map(function ($stock) {
            $costPerTonne = $stock->agency->city->transport_cost_per_tonne ?? 0;
            $weightInKg = (float) ($stock->article->weight_per_unit ?? 0);

            if ($weightInKg > 0 && $costPerTonne > 0 && $stock->quantity > 0) {
                $totalTonnes = ($stock->quantity * $weightInKg) / 1000;
                $stock->expected_csph_refund = round($totalTonnes * $costPerTonne);
            } else {
                $stock->expected_csph_refund = 0;
            }

            return $stock;
        });

        return Inertia("Direction/DirIndex", compact("stocks"));
    }

    /**
     * NOUVEAU : Exportation du rapport détaillé de péréquation en PDF.
     */
    public function exportPdf(Request $request)
    {
        $query = Stock::where("storage_type", "!=", "gaz")
            ->where("storage_type", "!=", "carburant")
            ->with(['article', 'agency.city', 'citerne']);

        // Filtre optionnel si l'utilisateur recherche par agence ou article
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('agency', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('article', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $stocks = $query->get();

        $totalSubventionGlobal = 0;
        $totalPoidsGazGlobal = 0; // En tonnes

        // Groupement par agence pour la clarté du PDF
        $groupedByAgency = [];

        foreach ($stocks as $stock) {
            $agencyName = $stock->agency->name ?? 'Agence Inconnue';
            $cityName = $stock->agency->city->name ?? 'N/A';
            $costPerTonne = $stock->agency->city->transport_cost_per_tonne ?? 0;
            $weightInKg = (float) ($stock->article->weight_per_unit ?? 0);
            $quantity = (float) ($stock->quantity ?? 0);

            $poidsTonnes = ($quantity * $weightInKg) / 1000;
            $subvention = ($poidsTonnes > 0 && $costPerTonne > 0) ? round($poidsTonnes * $costPerTonne) : 0;

            $totalSubventionGlobal += $subvention;
            $totalPoidsGazGlobal += $poidsTonnes;

            if (!isset($groupedByAgency[$agencyName])) {
                $groupedByAgency[$agencyName] = [
                    'city' => $cityName,
                    'cost_per_tonne' => $costPerTonne,
                    'total_agency_subvention' => 0,
                    'items' => []
                ];
            }

            $groupedByAgency[$agencyName]['total_agency_subvention'] += $subvention;
            $groupedByAgency[$agencyName]['items'][] = [
                'code' => $stock->article->code ?? 'N/A',
                'article' => $stock->article->name ?? 'Inconnu',
                'storage_type' => ucfirst($stock->storage_type),
                'quantity' => $quantity,
                'weight_unit' => $weightInKg,
                'total_weight_tonnes' => $poidsTonnes,
                'subvention' => $subvention
            ];
        }

        $pdf = Pdf::loadView('pdfs.direction_perequation', [
            'groupedData' => $groupedByAgency,
            'totalSubvention' => $totalSubventionGlobal,
            'totalPoids' => $totalPoidsGazGlobal,
            'generatedAt' => date('d/m/Y à H:i')
        ]);

        return $pdf->download('Rapport_Perequation_CSPH_' . date('Y_m_d') . '.pdf');
    }

    public function licence()
    {
        return Inertia("SelectDirLicence");
    }
}