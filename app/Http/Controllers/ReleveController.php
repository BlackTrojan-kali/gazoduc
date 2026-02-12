<?php

namespace App\Http\Controllers;

use App\Exports\RelevesExport;
use App\Models\Agency;
use App\Models\Article;
use App\Models\Citerne;
use App\Models\CiterneReading;
use App\Models\Releve;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReleveController extends Controller
{
 public function index(Request $request, $type)
    {
        // 1. Filtres
        $agencyId = $request->input('agency_id');
        $citerneId = $request->input('citerne_id');
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // 2. Requête de base
        $query = CiterneReading::query()
            ->with(['citerne', 'agency', 'user'])
            ->whereBetween('reading_date', [
                Carbon::parse($startDate)->startOfDay(), 
                Carbon::parse($endDate)->endOfDay()
            ]);

        // --- MODIFICATION MAJEURE ICI ---
        // Filtrage par type de produit via la relation 'citerne'
        if ($type === 'gaz') {
            // Si le paramètre est 'gaz', on ne veut que les relevés des cuves de GAZ
            $query->whereHas('citerne', function ($q) {
                $q->where('product_type', 'gaz');
            });
        } else {
            // Sinon (ex: 'carburant', 'liquide'), on veut tout SAUF le gaz
            $query->whereHas('citerne', function ($q) {
                $q->where('product_type', '!=', 'gaz');
            });
            
            // OPTIONNEL : Si $type contient aussi 'automatique' ou 'manuel', décommentez ceci :
            // $query->where('type', $type); 
        }
        // --------------------------------

        // 3. Restriction des droits (Direction vs Agence)
        if (Auth::user()->role->name !== "direction") {
            $query->where("agency_id", Auth::user()->agency_id);
            $agencyId = Auth::user()->agency_id;
        } else {
            if ($agencyId) {
                $query->where('agency_id', $agencyId);
            }
        }

        // 4. Filtre par Citerne (Optionnel)
        if ($citerneId) {
            $query->where('citerne_id', $citerneId);
        }

        // 5. Données pour le Graphique
        // Note: Le select/groupBy sur 'reading_date' peut nécessiter une config MySQL spécifique (strict mode off)
        // ou l'utilisation de DB::raw sur tous les champs sélectionnés.
        // Ici, on garde votre logique qui semble fonctionner pour vous.
        $chartData = (clone $query)
             // Il faut parfois re-préciser le select pour éviter les conflits de noms avec les joins implicites
            ->select(
                DB::raw('DATE(reading_date) as date'),
                DB::raw('AVG(measured_quantity) as avg_qty'),
                DB::raw('MAX(measured_quantity) as max_qty'),
                DB::raw('MIN(measured_quantity) as min_qty')
            )
            ->groupBy(DB::raw('DATE(reading_date)')) // GroupBy plus robuste
            ->orderBy('date', 'asc')
            ->get();

        // 6. Pagination
        $releves = $query->orderBy("reading_date", "desc")->paginate(15)->withQueryString();

        // 7. Chargement des données auxiliaires
        $agencies = Auth::user()->role->name === "direction" 
            ? Agency::all() 
            : Agency::where('id', Auth::user()->agency_id)->get();

        // --- FILTRE DES CITERNES DANS LA LISTE DÉROULANTE ---
        // Il est important que la liste des citernes affichée dans le filtre corresponde aussi au contexte (Gaz ou Pas Gaz)
        $citernesQuery = Citerne::query();
        
        if ($type === 'gaz') {
            $citernesQuery->where('product_type', 'gaz');
        } else {
            $citernesQuery->where('product_type', '!=', 'gaz');
        }

        if ($agencyId) {
            $citernesQuery->where('agency_id', $agencyId);
        }
        $citernes = $citernesQuery->get();
        // ----------------------------------------------------

        return Inertia::render("Releve", compact(
            "releves", 
            "agencies", 
            "citernes", 
            "chartData", 
            "type", 
            "startDate", 
            "endDate",
            "agencyId",
            "citerneId"
        ));
    }

    public function export(Request $request)
{
    $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
    $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
    $agencyId = $request->input('agency_id');
    $citerneId = $request->input('citerne_id');
    $reportType = $request->input('type', 'pdf');
    $licence = $request->input("licence"); // "gaz" ou autre (carburant)

    $query = CiterneReading::query()
        ->with(['citerne', 'agency', 'user'])
        ->whereBetween('reading_date', [$startDate, $endDate]);

    // --- SYNCHRONISATION DE LA LOGIQUE AVEC L'INDEX ---
    // On filtre par type de produit via la citerne, pas par le type de relevé
    if ($licence === 'gaz') {
        $query->whereHas('citerne', function ($q) {
            $q->where('product_type', 'gaz');
        });
    } else {
        // On prend tout ce qui n'est pas du gaz
        $query->whereHas('citerne', function ($q) {
            $q->where('product_type', '!=', 'gaz');
        });
    }

    // Filtre Agence (Sécurité & Sélection)
    if (Auth::user()->role->name !== "direction") {
        $query->where("agency_id", Auth::user()->agency_id);
    } elseif ($agencyId) {
        $query->where('agency_id', $agencyId);
    }

    // Filtre Citerne spécifique
    if ($citerneId) {
        $query->where('citerne_id', $citerneId);
    }

    $releves = $query->orderBy('reading_date', 'asc')->get();

    // --- GÉNÉRATION DU GRAPHIQUE ---
    // On groupe par jour pour le graphique (Moyenne journalière)
    $groupedData = $releves->groupBy(fn($val) => Carbon::parse($val->reading_date)->format('d/m'));
    
    $labels = $groupedData->keys()->toArray();
    $dataPoints = $groupedData->map(fn($group) => $group->avg('measured_quantity'))->values()->toArray();

    $chartConfig = [
        'type' => 'line',
        'data' => [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Niveau (Litres)',
                'data' => $dataPoints,
                'borderColor' => '#3b82f6', // Un beau bleu
                'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                'fill' => true,
                'borderWidth' => 2
            ]]
        ],
        'options' => [
            'title' => [
                'display' => true,
                'text' => 'Évolution du stock (Moyenne journalière)'
            ]
        ]
    ];

    $chartUrl = 'https://quickchart.io/chart?w=600&h=300&c=' . urlencode(json_encode($chartConfig));

    if ($reportType === 'excel') {
        return Excel::download(new RelevesExport($releves), 'historique_releves.xlsx');
    } elseif ($reportType === 'pdf') {
        $data = [
            'releves' => $releves,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'selectedAgency' => $agencyId ? Agency::find($agencyId) : null,
            'chartUrl' => $chartUrl 
        ];
        
        $pdf = Pdf::loadView('PDF.RelevePDFView', $data)
                  ->setOption(['isRemoteEnabled' => true, 'defaultFont' => 'DejaVu Sans']);

        return $pdf->download('historique_releves_' . now()->format('d-m-Y') . '.pdf');
    }
}
}
