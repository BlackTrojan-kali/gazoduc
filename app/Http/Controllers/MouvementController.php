<?php

namespace App\Http\Controllers;
namespace App\Http\Controllers;

use App\Exports\MovementsExport;
use App\Models\Agency;
use App\Models\Article; // Assurez-vous d'importer le modèle Article
use App\Models\Mouvement;
use App\Models\Role;
use App\Models\Stock;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Pour les transactions de base de données
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

// use Inertia\Inertia; // Plus besoin d'importer Inertia si on utilise return back() directement

class MouvementController extends Controller
{

    public function store(Request $request)
    {
        // 1. Validation Basique des Données
        $request->validate([
            'article_id' => ['required', 'exists:articles,id'],
            'agency_id' => ['required', 'exists:agencies,id'],
            'recorded_by_user_id' => ['required', 'exists:users,id'],
            'movement_type' => ['required', 'in:entree,sortie'],
            'qualification' => ['required', 'in:reepreuve,achat,perte,transfert'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'source_location' => ['nullable', 'string', 'max:255'],
            'destination_location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        // 2. Récupération de l'Article concerné
        $stock = Stock::where("article_id",$request->article_id)->where("agency_id",Auth::user()->agency_id)
        ->where("storage_type",Auth::user()->role->name)
        ->with("article")
        ->first();

        try {
            // 3. Traitement de la Logique de Stock via Transaction
            DB::beginTransaction();
                $movementType = $request->movement_type;
                $quantity = $request->quantity;

                // Ajustement de la quantité de stock
                if ($movementType === 'entree') {
                    $stock->quantity += $quantity;
                } elseif ($movementType === 'sortie') {
                    if ($stock->quantity < $quantity) {
                        // Lever une exception pour annuler la transaction et gérer l'erreur
                        throw new \Exception("Stock insuffisant pour l'article {$stock->article->name}. Stock actuel: {$stock->quantity}, Quantité demandée: {$quantity}.");
                    }
                    $stock->quantity -= $quantity;
                }

                // Sauvegarde du stock mis à jour
                $stock->save();

                // 4. Création du Mouvement en instanciant l'objet
                $movement = new Mouvement();
                $movement->article_id = $request->article_id;
                $movement->agency_id = $request->agency_id;
                $movement->entreprise_id = Auth::user()->entreprise_id;
                $movement->recorded_by_user_id = $request->recorded_by_user_id;
                $movement->movement_type = $movementType;
                $movement->qualification = $request->qualification;
                $movement->quantity = $quantity;
                $movement->stock = $stock->quantity;
                $movement->source_location = Auth::user()->role->name;
                $movement->destination_location = $request->destination_location;
                $movement->description = $request->description;
                

                $movement->save();
            DB::commit();

            // 5. Réponse en cas de succès
            return back()->with('success', 'Mouvement enregistré et stock ajusté avec succès, monsieur !');

        } catch (\Exception $e) {
            DB::rollBack();
            // 6. Gestion des erreurs
            // On attrape l'exception (par exemple, pour stock insuffisant) et on renvoie un message d'erreur
            return back()->with('error', 'Échec de l\'enregistrement du mouvement : ' . $e->getMessage())->withInput();
        }
    }

public function moves(Request $request, $type)
{
    // Récupérer l'utilisateur authentifié et ses informations
    $user = Auth::user();
    $userRoleName = $user->role->name;

    // --- Récupérer les paramètres de filtre de la requête ---
    $filterArticleName = $request->query('article_name');
    $filterQualification = $request->query('qualification');
    $filterAgencyId = $request->query('agency_id');
    // --------------------------------------------------------

    // Construire la requête de base pour les mouvements
    $movementsQuery = Mouvement::with('agency', 'article', 'user')
        ->where('movement_type',$type)
        ->where('source_location', $userRoleName);
    // Limiter à l'agence de l'utilisateur selon son rôle
    $restrictedRoles = ['magasin', 'production', 'commercial'];
    if (in_array($userRoleName, $restrictedRoles)) {
        $movementsQuery->where('agency_id', $user->agency_id);
    } elseif ($filterAgencyId) {
        $movementsQuery->where('agency_id', $filterAgencyId);
    }

    // --- Appliquer les filtres ---
    if ($filterArticleName) {
        $movementsQuery->whereHas('article', function ($query) use ($filterArticleName) {
            $query->where('name', 'like', '%' . $filterArticleName . '%');
        });
    }

    if ($filterQualification) {
        $movementsQuery->where('qualification', $filterQualification);
    }
    // -----------------------------

    // Récupération des mouvements paginés
    $movements = $movementsQuery->latest()->paginate(15);
    // Récupération des articles pour les filtres
    $articles = Article::where('entreprise_id', $user->entreprise_id)
        ->where('type', '!=', 'matiere_premiere')
        ->orderBy('name')
        ->get();

    // Récupération des agences selon le rôle
    if (in_array($userRoleName, $restrictedRoles)) {
        $agencies = Agency::where('id', $user->agency_id)->get();
    } else {
        $agencies = Agency::where('entreprise_id', $user->entreprise_id)->get();
    }

    // Récupération des services selon le rôle
    if (in_array($userRoleName, $restrictedRoles)) {
        $services = Role::where('name', $userRoleName)->get();
    } else {
        $services = Role::all();
    }

    // Retour de la vue avec Inertia
    return Inertia::render('Entree', [
        'movements' => $movements,
        'articles' => $articles,
        'agencies' => $agencies,
        'services' => $services,
        'filters' => [
            'article_name' => $filterArticleName,
            'qualification' => $filterQualification,
            'agency_id' => $filterAgencyId,
        ],
    ]);
}

    public function delete($idmov){
        $move = Mouvement::where("id",$idmov)->first();
        $stock =  Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type",Auth::user()->role->name)->first();
        try{
        DB::beginTransaction();
        if ($move->movement_type == "entree"){
            
            $stock->quantity -=$move->quantity;
        if($stock->quantity < 0){
            return back()->with('error',"stock negatif suprimmer d'abord la sortie correspondante");
        }
        }else{
            $stock->quantity +=$move->quantity;
        }
        $stock->save();
        $move->delete();
         DB::commit();
         return back()->with("warning","mouvement supprime avec success le stock a ete retabli");
       
        }catch(Exception $e){
            DB::rollBack();
            return back()->with("error","le mouvement n'a pas ete supprime veillez reesayer");
        }
    }
 public function generateReport(Request $request)
    {
        // dd($request->all()); // Gardez ceci pour débugger si nécessaire, puis supprimez-le en production

        // 1. Validation des paramètres de la requête
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'agency_id' => 'nullable|exists:agencies,id',
            'service_id' => 'nullable|exists:roles,id', // Assurez-vous que 'roles' est la bonne table et 'id' la colonne
            'type_mouvement' => 'nullable|in:entree,sortie,global',
            'article_id' => 'nullable|exists:articles,id',
            'file_type' => 'required|in:pdf,excel',
        ]);

        // 2. Récupération et préparation des paramètres
        $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        $agencyId = $request->input('agency_id');
        // MODIFICATION ICI : Récupère serviceId depuis la requête, si non fourni, peut-être laisser vide ou par défaut
        // Si l'utilisateur a un rôle spécifique pour générer un rapport le concernant,
        // vous pouvez ajouter une logique conditionnelle.
        // Pour l'instant, nous privilégions le filtre utilisateur.
        $serviceId = $request->input('service_id');
        $movementType = $request->input('type_mouvement');
        $articleId = $request->input('article_id');
        $fileType = $request->input('file_type');

        // 3. Récupération des noms pour les rapports (pour affichage dans le PDF/Excel)
        $agencyName = $agencyId ? Agency::find($agencyId)?->name : 'Toutes les agences';
        $articleName = $articleId ? Article::find($articleId)?->name : 'Tous les articles';
        $serviceName = $serviceId ? Role::find($serviceId)?->name : 'Tous les services';
        
        $movementTypeName = '';
        if ($movementType === 'entree') {
            $movementTypeName = 'Entrée';
        } elseif ($movementType === 'sortie') {
            $movementTypeName = 'Sortie';
        } else { // 'global' ou vide
            $movementTypeName = 'Global (Entrées & Sorties)';
        }

        // 4. Construction de la requête de base pour les mouvements
        $query = Mouvement::query()
                          ->whereBetween("created_at", [$startDate, $endDate])
                          ->orderBy('created_at', 'asc')
                          ->with("article", "agency", "user"); // Assurez-vous que 'sourceService' est la relation correcte dans votre modèle Mouvement vers le modèle Role/Service

        // 5. Application des filtres conditionnels
        $query->when($agencyId, function ($q) use ($agencyId) {
            $q->where('agency_id', $agencyId);
        });

        $query->when($articleId, function ($q) use ($articleId) {
            $q->where('article_id', $articleId);
        });

        // Filtrer par le type de mouvement si ce n'est pas 'global'
        $query->when($movementType && $movementType !== 'global', function ($q) use ($movementType) {
            $q->where('movement_type', $movementType); // Assurez-vous que le champ est 'type' dans votre table de mouvements
        });

        // Filtrer par service (rôle) si serviceId est fourni.
        // IMPORTANT : Vérifiez la colonne que vous utilisez pour stocker l'ID ou le nom du service/rôle.
        // Si 'source_location' stocke le NOM du service/rôle :
        $query->when($serviceId, function ($q) use ($serviceName) {
            $q->where('source_location', $serviceName);
        });
        // Si 'source_location' stocke l'ID du service/rôle :
        // $query->when($serviceId, function ($q) use ($serviceId) {
        //     $q->where('source_location', $serviceId); // Ou la colonne réelle
        // });
        // Si vous avez une relation directe dans le modèle Mouvement vers Role:
        // $query->when($serviceId, function ($q) use ($serviceId) {
        //     $q->whereHas('sourceService', fn($s) => $s->where('id', $serviceId));
        // });


        $movements = $query->get();

        // 6. Vérifier si des mouvements ont été trouvés
        if ($movements->isEmpty()) {
            return back()->with('error', 'Aucun mouvement trouvé pour les critères sélectionnés, monsieur.');
        }

        // 7. Préparation des données pour la vue/l'export
        $reportData = [
            'movements' => $movements,
            'startDate' => $startDate->format('d/m/Y'),
            'endDate' => $endDate->format('d/m/Y'),
            'agencyName' => $agencyName,
            'articleName' => $articleName,
            'serviceName' => $serviceName,
            'movementTypeName' => $movementTypeName,
        ];

        $fileName = 'historique_mouvements_' . now()->format('Ymd_His');

        // 8. Génération du rapport selon le type de fichier
        if ($fileType === "pdf") {
            $pdfView = ($movementType === "global") ? "PDF.MovesGlobalPDFView" : "PDF.MovesPDFView";
            $pdf = Pdf::loadView($pdfView, $reportData);
            return $pdf->download($fileName . '.pdf');
        } elseif ($fileType === "excel") {
            // APPEL DE L'EXPORT EXCEL ICI
            return Excel::download(new MovementsExport($reportData), $fileName . '.xlsx');
        }

        // Cas de fallback (ne devrait normalement pas être atteint grâce à la validation)
        return back()->with('error', 'Type de fichier non supporté ou une erreur inattendue est survenue.');
    }
}

