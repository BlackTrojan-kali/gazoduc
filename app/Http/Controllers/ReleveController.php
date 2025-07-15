<?php

namespace App\Http\Controllers;

use App\Exports\RelevesExport;
use App\Models\Agency;
use App\Models\Article;
use App\Models\CiterneReading;
use App\Models\Releve;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class ReleveController extends Controller
{
    //
    public function index(){
        $releves = [];
        $agencies = [];
        if(Auth::user()->role->name != "direction"){
           $releves  = CiterneReading::where("agency_id",Auth::user()->agency_id)->orderBy("created_at","desc")->with("citerne","agency","user")
            ->paginate(15);
            $agencies = Agency::where("id",Auth::user()->agency_id)->get();
        }
        return Inertia("Releve",compact("releves","agencies"));
    }
    
    public function export(Request $request)
    {
        // 1. Récupération et validation des paramètres de la requête
        $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        $agencyId = $request->input('agency_id');
        $reportType = $request->input('type', 'pdf'); // Par défaut 'pdf'

        // Validation de base des dates
        if (empty($startDate) || empty($endDate)) {
            return redirect()->back()->withErrors(['message' => 'Les dates de début et de fin sont requises pour l\'exportation, monsieur.']);
        }

        // 2. Construction de la requête pour récupérer les relevés
        $query = CiterneReading::query()
            ->with(['citerne', 'agency', 'user']) // Charger les relations nécessaires
            ->whereBetween('reading_date', [$startDate, $endDate]); // Filtrer par la date de lecture

        // Filtrage par agence si un agency_id est fourni
        if ($agencyId) {
            $query->where('agency_id', $agencyId);
        }

        // Restriction par agence pour les utilisateurs non "direction"
        // Assurez-vous que le rôle est correctement défini et géré dans votre modèle User
        if (Auth::check() && Auth::user()->role !== "direction") {
            $query->where("agency_id", Auth::user()->agency_id);
        }

        // Récupération des données finales
        $releves = $query->orderBy('reading_date', 'asc')->get();

        // 3. Génération du rapport selon le type demandé
        if ($reportType === 'excel') {
            // Pour Excel, nous utilisons Maatwebsite/Excel
            // L'exportateur RelevesExport sera créé à l'étape suivante.
            return Excel::download(new RelevesExport($releves), 'historique_releves_' . now()->format('Ymd_His') . '.xlsx');

        } elseif ($reportType === 'pdf') {
            // Pour PDF, nous utilisons Barryvdh/DomPDF
            // La vue Blade 'reports.releves_pdf' sera créée à l'étape suivante.
            $data = [
                'releves' => $releves,
                'start_date' => $startDate, // Passer les dates pour l'en-tête du PDF
                'end_date' => $endDate,
                // On peut aussi passer l'objet Agence sélectionné si besoin
                'selectedAgency' => $agencyId ? Agency::find($agencyId) : null,
            ];
            $pdf = Pdf::loadView('PDF.RelevePDFView', $data);
            return $pdf->download('historique_releves_' . now()->format('Ymd_His') . '.pdf');

        } else {
            // Gérer les types de rapport invalides
            return redirect()->back()->withErrors(['message' => 'Type de rapport invalide spécifié.']);
        }
    }
}
