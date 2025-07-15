<?php

namespace App\Http\Controllers;

use App\Exports\ReceptionsExport;
use App\Models\Agency;
use App\Models\Reception;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class receptionController extends Controller
{
    //
    public function index(){
        $receptions = [];
        $agencies = [];
        if(Auth::user()->role->name != "direction"){
            $receptions = Reception::where("destination_agency_id",Auth::user()->agency_id)->with("agency","citerne","article","user")->paginate();
            $agencies = Agency::where("id",Auth::user()->agency_id)->get();
        }
        return Inertia("Reception",compact("receptions","agencies"));
    }
    public function delete($idRec){
        $reception = Reception::findOrFail($idRec);
        $reception->delete();
        return back()->with("warning","the reception was deleted successfully");
    }
    public function export(Request $request)
{
    // 1. Récupération et validation des paramètres de la requête
    $startDate =  Carbon::parse($request->input('start_date'))->startOfDay();
    $endDate =  Carbon::parse($request->input('end_date'))->endOfDay() ;
    $agencyId = $request->input('agency_id');
    $reportType = $request->input('export_format', 'pdf'); // Le nom du champ de la modal est 'export_format'

    // Validation de base des dates (si elles sont obligatoires pour l'export)
    // Vous pouvez commenter ces lignes si les dates sont optionnelles
    // if (empty($startDate) || empty( $endDate)) {
    //     return redirect()->back()->withErrors(['message' => 'Les dates de début et de fin sont requises pour l\'exportation, monsieur.']);
    // }

    // Validation du type de rapport
    if (!in_array($reportType, ['pdf', 'excel'])) {
        return redirect()->back()->withErrors(['message' => 'Type de rapport invalide spécifié, monsieur.']);
    }

    // 2. Construction de la requête pour récupérer les réceptions
    $query = Reception::query()
        ->with(['citerne', 'agency', 'article', 'user']); // Charger les relations spécifiées

    // Filtrage par agence si un agency_id est fourni
    if ($agencyId) {
        $query->where('destination_agency_id', $agencyId);
    }

    // Filtrage par dates si elles sont fournies
    if ($startDate && $endDate) {
        $query->whereBetween('created_at', [$startDate, $endDate]); // Filtrer par la date de création
    }

    // Restriction par agence pour les utilisateurs non "direction"
    // (Assurez-vous que le rôle est correctement défini dans votre modèle User et que 'agency_id' est sur l'utilisateur)
    if (Auth::check() && Auth::user()->role !== "direction") {
        $query->where("destination_agency_id", Auth::user()->agency_id);
    }

    // Récupération des données finales, triées par date de création
    $receptions = $query->orderBy('created_at', 'asc')->get();

    // 3. Génération du rapport selon le type demandé
    if ($reportType === 'excel') {
        // Pour Excel, nous utilisons Maatwebsite/Excel
        // La classe ReceptionsExport doit être définie comme nous l'avons fait précédemment.
        return Excel::download(new ReceptionsExport($receptions), 'historique_receptions_' . now()->format('Ymd_His') . '.xlsx');

    } elseif ($reportType === 'pdf') {
        // Pour PDF, nous utilisons Barryvdh/DomPDF
        $data = [
            'receptions' => $receptions,
            'start_date' => $startDate,
            'end_date' => $endDate,
            // On peut aussi passer l'objet Agence sélectionné si besoin
            'selectedAgency' => $agencyId ? Agency::find($agencyId) : null,
        ];
        // Utilisez le nom de la vue Blade que vous avez créée pour les réceptions PDF
        $pdf = Pdf::loadView('PDF.ReceptionPDFView', $data);
        return $pdf->download('historique_receptions_' . now()->format('Ymd_His') . '.pdf');
    }
}
}
