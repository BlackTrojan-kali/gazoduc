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
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'agency_id' => 'nullable|exists:agencies,id',
            // Le type de fichier attendu de la modal (pdf, excel)
            'file_type' => 'required|in:pdf,excel',
            // Le type de mouvement pour gérer les soft-deletes (global_no_delete, global_with_delete)
            'type_mouvement' => 'required|in:global_no_delete,global_with_delete',
        ]);
        
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
        $agencyId = $request->input('agency_id');
        $fileType = $request->input('file_type');
        $movementType = $request->input('type_mouvement');

        // 2. Construction de la requête de base pour récupérer les réceptions
        $query = Reception::query()->with(['citerne', 'agency', 'article', 'user']);

        // 3. Application du filtre pour inclure les soft-deleted
        if ($movementType === 'global_with_delete') {
            $query->withTrashed();
        }

        // 4. Application des autres filtres (agence, dates)
        if ($agencyId) {
            $query->where('destination_agency_id', $agencyId);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        // 5. Restriction par agence pour les utilisateurs non "direction"
        if (Auth::check() && Auth::user()->role !== "direction") {
            $query->where("destination_agency_id", Auth::user()->agency_id);
        }

        // Récupération des données finales, triées par date de création
        $receptions = $query->orderBy('created_at', 'asc')->get();

        // 6. Vérifier si des réceptions ont été trouvées
        if ($receptions->isEmpty()) {
             return redirect()->back()->withErrors(['message' => 'Aucune réception trouvée pour les critères sélectionnés, monsieur.']);
        }

        // 7. Génération du rapport selon le type demandé
        if ($fileType === 'excel') {
            return Excel::download(
                new ReceptionsExport($receptions),
                'historique_receptions_' . now()->format('Ymd_His') . '.xlsx'
            );
        } elseif ($fileType === 'pdf') {
            $data = [
                'receptions' => $receptions,
                'start_date' => $startDate ? $startDate->format('d/m/Y') : null,
                'end_date' => $endDate ? $endDate->format('d/m/Y') : null,
                'selectedAgency' => $agencyId ? Agency::find($agencyId) : null,
                'isWithDeleted' => ($movementType === 'global_with_delete'), // Passez cette information à la vue
            ];

            $pdf = Pdf::loadView('PDF.ReceptionPDFView', $data);
            return $pdf->download('historique_receptions_' . now()->format('Ymd_His') . '.pdf');
        }

        // Cas de fallback
        return redirect()->back()->withErrors(['message' => 'Type de rapport invalide spécifié, monsieur.']);
    }
}
