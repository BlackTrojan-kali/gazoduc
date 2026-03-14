<?php

namespace App\Http\Controllers;

use App\Models\ProductionBatch;
use App\Models\Gas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductionBatchController extends Controller
{
    /**
     * =========================================================================
     * 1. INTERFACES DE CONSULTATION (HISTORIQUES)
     * =========================================================================
     */

    /**
     * Affiche l'historique complet des lots pour la Direction et les Contrôleurs.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $gasFilter = $request->input('gas_id');

        $batches = ProductionBatch::query()
            ->with('gas') // Évite le problème N+1
            ->when($search, function ($query, $search) {
                $query->where('batch_number', 'like', "%{$search}%");
            })
            ->when($gasFilter, function ($query, $gasFilter) {
                $query->where('gas_id', $gasFilter);
            })
            ->orderBy('production_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('MedDir/ProductionBatches/Index', [
            'batches' => $batches,
            'gases' => Gas::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'gas_id']),
        ]);
    }

    /**
     * Affiche les détails d'un lot spécifique (Bouteilles liées, Opérateur, etc.)
     */
    public function show(ProductionBatch $productionBatch)
    {
        // On charge le gaz lié. 
        // Plus tard, vous pourrez ajouter : ->with('cylinders') pour voir toutes les bouteilles de ce lot
        $productionBatch->load('gas'); 

        return Inertia::render('MedDir/ProductionBatches/Show', [
            'batch' => $productionBatch
        ]);
    }

    /**
     * =========================================================================
     * 2. INTERFACE DE PRODUCTION (L'ATELIER / MES)
     * =========================================================================
     */

    /**
     * Crée un nouveau lot de production (Généralement appelé au début du remplissage).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_number' => 'required|string|max:255|unique:production_batches,batch_number',
            'gas_id' => 'required|exists:gases,id',
            'production_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:production_date',
        ]);

        $batch = ProductionBatch::create($validated);

        // On renvoie un JSON si c'est appelé par une API (ex: via un scanneur mobile) 
        // ou une redirection Inertia si c'est via l'interface web
        if ($request->wantsJson()) {
            return response()->json(['message' => 'Lot créé avec succès', 'batch' => $batch], 201);
        }

        return redirect()->back()->with('success', "Le lot de production {$batch->batch_number} a été ouvert.");
    }

    /**
     * Met à jour les informations du lot (ex: si la production s'est prolongée).
     */
    public function update(Request $request, ProductionBatch $productionBatch)
    {
        $validated = $request->validate([
            'batch_number' => 'required|string|max:255|unique:production_batches,batch_number,' . $productionBatch->id,
            'gas_id' => 'required|exists:gases,id',
            'production_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:production_date',
        ]);

        $productionBatch->update($validated);

        return redirect()->back()->with('success', 'Les informations du lot ont été mises à jour.');
    }

    /**
     * =========================================================================
     * 3. EXPORTS CSV / EXCEL (NATURELS ET OPTIMISÉS)
     * =========================================================================
     */

    /**
     * Export pour la PRODUCTION : Focus sur la Traçabilité, les Dates et la Qualité.
     * Utile pour l'ANOR ou le Ministère de la Santé (Gaz Médical).
     */
    public function exportProductionHistory(Request $request)
    {
        $fileName = 'tracabilite_production_' . Carbon::now()->format('Y_m_d_His') . '.csv';

        // Utilisation de StreamedResponse pour ne pas saturer la RAM du serveur Ikarootech
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['N° de Lot', 'Type de Gaz', 'Date de Production', 'Date de Péremption', 'Statut Qualité'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            
            // BOM UTF-8 pour que Microsoft Excel lise correctement les accents en français
            fputs($file, $bom =(chr(0xEF) . chr(0xBB) . chr(0xBF))); 
            fputcsv($file, $columns, ';'); // Séparateur Point-Virgule pour le format européen/africain

            // Chunk pour traiter de grands volumes de données sans crasher
            ProductionBatch::with('gas')->orderBy('production_date', 'desc')->chunk(500, function($batches) use ($file) {
                foreach ($batches as $batch) {
                    $row = [
                        $batch->batch_number,
                        $batch->gas->name ?? 'Inconnu',
                        Carbon::parse($batch->production_date)->format('d/m/Y'),
                        Carbon::parse($batch->expiry_date)->format('d/m/Y'),
                        'Conforme' // Espace prévu pour une future validation qualité (QMS)
                    ];
                    fputcsv($file, $row, ';');
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export pour la DIRECTION : Focus Stratégique (Vue globale).
     * Peut inclure plus tard le nombre de bouteilles remplies par lot pour calculer les rendements.
     */
    public function exportDirectionReport(Request $request)
    {
        $fileName = 'rapport_direction_lots_' . Carbon::now()->format('Y_m_d') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // L'entête directionnelle inclura plus tard le "Volume Produit" ou "Nb Bouteilles"
        $columns = ['Date de Production', 'N° de Lot', 'Produit', 'Péremption'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputs($file, $bom =(chr(0xEF) . chr(0xBB) . chr(0xBF)));
            fputcsv($file, $columns, ';');

            ProductionBatch::with('gas')
                ->whereMonth('production_date', Carbon::now()->month) // Export par défaut du mois en cours
                ->orderBy('production_date', 'desc')
                ->chunk(500, function($batches) use ($file) {
                    foreach ($batches as $batch) {
                        $row = [
                            Carbon::parse($batch->production_date)->format('d/m/Y'),
                            $batch->batch_number,
                            $batch->gas->name ?? '-',
                            Carbon::parse($batch->expiry_date)->format('d/m/Y'),
                            // Ex: $batch->cylinders->count() // À activer quand la relation sera faite
                        ];
                        fputcsv($file, $row, ';');
                    }
                });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}