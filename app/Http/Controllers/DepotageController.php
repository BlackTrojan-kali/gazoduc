<?php

namespace App\Http\Controllers;

use App\Exports\DepotagesExport;
use App\Models\Agency;
use App\Models\Depotage;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class DepotageController extends Controller
{
    //
    public function index(){
        $depotages = [];
        $agencies = [];
        if(Auth::user()->role->name != "direction"){
            $depotages = Depotage::where("agency_id",Auth::user()->agency_id)->with("agency","citerne_mobile","citerne_fixe","article","user")->paginate(15);
            $agencies = Agency::where("id",Auth::user()->agency_id)->get();
        }
        return Inertia("Depotage",compact("depotages","agencies"));
    }
    public function delete($idDep){
        $depotage = Depotage::where("id",$idDep)->with("citerne_fixe.stock")->first();
        $depotage->citerne_fixe->stock->quantity -= $depotage->quantity;
        $depotage->citerne_fixe->stock->theorical_quantity -= $depotage->quantity;
        if($depotage->citerne_fixe->stock->quantity < 0){
            return back()->with("error","alerte stock negative le depotage impossible de supprimer contacte l'equipe technique");
        }

        $depotage->citerne_fixe->stock->save();
        $depotage->delete();
        return back()->with("warning","le depotage a ete supprime");
    }
    public function export(Request $request)
    {
        // 1. Récupération et validation des paramètres de la requête
        $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        $agencyId = $request->input('agency_id'); // L'ID d'agence sélectionné dans la modale
        $fileType = $request->input('file_type', 'pdf'); // Type de fichier demandé (pdf ou excel)

        // Validation de base des dates
        if (empty($startDate) || empty($endDate)) {
            return redirect()->back()->withErrors(['message' => 'Les dates de début et de fin sont requises pour l\'exportation, monsieur.']);
        }

        // 2. Construction de la requête pour récupérer les dépotages
        $query = Depotage::query()
            // Charger toutes les relations spécifiées
            ->with(['agency', 'citerne_mobile', 'citerne_fixe', 'article', 'user']) // Utilisez 'recordedByUser' si c'est le nom de la relation pour l'utilisateur
            ->whereBetween('created_at', [$startDate, $endDate]); // Filtrer par la date de dépotage

        // Filtrage par l'agence de l'utilisateur si ce n'est pas la direction
        if (Auth::check() && Auth::user()->role !== "direction") {
            $query->where("agency_id", Auth::user()->agency_id);
            // Si l'utilisateur est restreint, on force le agencyId pour le rapport à son agence
            $agencyId = Auth::user()->agency_id;
        }

        // Filtrage par agence si un agency_id est fourni ET que l'utilisateur est "direction"
        // Ou si un agencyId est déjà défini par la restriction ci-dessus.
        if ($agencyId) {
            $query->where('agency_id', $agencyId);
        }

        // Récupération des données finales, triées par date de dépotage
        $depotages = $query->orderBy('created_at', 'asc')->get();

        // 3. Génération du rapport selon le type demandé
        if ($fileType === 'excel') {
            // Utilisation de l'exportateur Excel
            return Excel::download(new DepotagesExport($depotages), 'historique_depotages_' . now()->format('Ymd_His') . '.xlsx');

        } elseif ($fileType === 'pdf') {
            // Préparation des données pour la vue PDF
            $data = [
                'depotages' => $depotages,
                'start_date' => $startDate,
                'end_date' => $endDate,
                // Récupérer l'objet Agence pour afficher son nom dans le PDF si un ID est fourni
                'selectedAgency' => $agencyId ? Agency::find($agencyId) : null,
            ];

            // Chargement de la vue Blade et génération du PDF
            $pdf = Pdf::loadView('PDF.DepotagePDFView', $data);
            return $pdf->download('historique_depotages_' . now()->format('Ymd_His') . '.pdf');

        } else {
            // Gérer les types de fichier invalides
            return redirect()->back()
                             ->with('error', 'Type de fichier non supporté. Veuillez choisir PDF ou Excel, monsieur.');
        }
    }
}
