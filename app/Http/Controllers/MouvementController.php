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
            'qualification' => ['required', 'in:reepreuve,achat,perte,transfert,reception,vente,retour_sur_vente'],
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
        $article = Article::where("id",$request->article_id)->first();
        if(Auth::user()->role->name == "production"){
            if($article->type == "produit_fini" && $request->movement_type == "entree"){
              
                 return back()->with("warning","cet article doit etre produit");
            }
        }
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
        $user = Auth::user();
        $userRoleName = $user->role->name;

        $filterArticleName = $request->query('article_name');
        $filterQualification = $request->query('qualification');
        $filterAgencyId = $request->query('agency_id');

        // Initialiser la requête de base pour les mouvements
        $movementsQuery = Mouvement::with('agency', 'article', 'user');

        // --- Logique de filtrage basée sur le rôle ---
        $restrictedRoles = ['magasin', 'production', 'commercial'];

        if ($userRoleName === 'controleur' || $userRoleName === 'direction') {
            // Pour 'controleur' et 'direction': afficher TOUS les types de mouvements.
            // Le paramètre $type est ignoré ici.

            if ($userRoleName === 'controleur') {
                // Pour 'controleur': Limiter à l'agence de l'utilisateur
                $movementsQuery->where('agency_id', $user->agency_id);
            } elseif ($userRoleName === 'direction') {
                // Pour 'direction': Afficher toutes les agences, mais permettre le filtrage si agency_id est fourni
                if ($filterAgencyId) {
                    $movementsQuery->where('agency_id', $filterAgencyId);
                }
            }
            // Aucune restriction de source_location pour ces rôles ici
        } else {
            // Pour les autres rôles: appliquer la logique existante (filtrage par type et restrictions d'agence/source_location)
            $movementsQuery->where('movement_type', $type);
            $movementsQuery->where('source_location', $userRoleName);
            if (in_array($userRoleName, $restrictedRoles)) {
                $movementsQuery->where('agency_id', $user->agency_id);
            } elseif ($filterAgencyId) {
                $movementsQuery->where('agency_id', $filterAgencyId);
            }
        }
        // ------------------------------------

        // --- Appliquer les filtres additionnels (Nom d'article, Qualification) ---
        if ($filterArticleName) {
            $movementsQuery->whereHas('article', function ($query) use ($filterArticleName) {
                $query->where('name', 'like', '%' . $filterArticleName . '%');
            });
        }

        if ($filterQualification) {
            $movementsQuery->where('qualification', $filterQualification);
        }
        // ---------------------------------------------

        // Récupérer les mouvements paginés
        $movements = $movementsQuery->latest()->paginate(15);

        // Récupérer les articles pour les filtres
        $articles = Article::where('entreprise_id', $user->entreprise_id)
            ->where('type', '!=', 'matiere_premiere')
            ->orderBy('name')
            ->get();

        // Récupérer les agences en fonction du rôle
        if ($userRoleName === 'direction') {
            $agencies = Agency::where('entreprise_id', $user->entreprise_id)->get();
        } elseif (in_array($userRoleName, $restrictedRoles) || $userRoleName === 'controleur') {
            $agencies = Agency::where('id', $user->agency_id)->get();
        } else {
            $agencies = Agency::where('entreprise_id', $user->entreprise_id)->get();
        }

        // --- Récupérer les services (rôles) en fonction du rôle ---
        // La modification se trouve ici
        if ($userRoleName === 'controleur' || $userRoleName === 'direction') {
            // Pour 'controleur' et 'direction': toujours retourner les rôles spécifiques
            $services = Role::whereIn('name', ['magasin', 'production', 'commercial'])->get();
        } elseif (in_array($userRoleName, $restrictedRoles)) {
            // Pour les rôles restreints ('magasin', 'production', 'commercial'): seulement leur propre rôle
            $services = Role::where('name', $userRoleName)->get();
        } else {
            // Fallback pour tout autre rôle non explicitement géré
            $services = Role::all();
        }
        // --------------------------------------------------------

        // Retour de la vue avec Inertia
        return Inertia::render('Entree', [ // Vous devrez peut-être changer 'Entree' pour une vue plus générique comme 'Mouvements'
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
        // 1. Validation des paramètres de la requête
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'agency_id' => 'nullable|exists:agencies,id',
            'service_id' => 'nullable|exists:roles,id',
            'type_mouvement' => 'nullable|in:entree,sortie,global_no_delete,global_with_delete',
            'article_id' => 'nullable|exists:articles,id',
            'file_type' => 'required|in:pdf,excel',
        ]);

        // 2. Récupération et préparation des paramètres
        $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        $agencyId = $request->input('agency_id');
        $serviceId = $request->input('service_id');
        $movementType = $request->input('type_mouvement');
        $articleId = $request->input('article_id');
        $fileType = $request->input('file_type');

        // 3. Récupération des noms pour les rapports (pour affichage dans le PDF/Excel)
        $agencyName = $agencyId ? Agency::find($agencyId)?->name : 'Toutes les agences';
        $articleName = $articleId ? Article::find($articleId)?->name : 'Tous les articles';
        $serviceName = $serviceId ? Role::find($serviceId)?->name : 'Tous les services';
        
        $movementTypeName = '';
        switch ($movementType) {
            case 'entree':
                $movementTypeName = 'Entrée';
                break;
            case 'sortie':
                $movementTypeName = 'Sortie';
                break;
            case 'global_no_delete':
                $movementTypeName = 'Global (Entrées & Sorties)';
                break;
            case 'global_with_delete':
            default:
                $movementTypeName = 'Global (Entrées, Sorties & Suppressions)';
                break;
        }

        // 4. Construction de la requête de base pour les mouvements
        $query = Mouvement::query()
                          ->whereBetween("created_at", [$startDate, $endDate])
                          ->orderBy('created_at', 'asc')
                          ->with("article", "agency", "user");
        
        // 5. Application des filtres conditionnels
        // Inclure les mouvements supprimés si le type de rapport est 'global_with_delete'
        $query->when($movementType === 'global_with_delete', function ($q) {
            $q->withTrashed();
        });

        $query->when($agencyId, function ($q) use ($agencyId) {
            $q->where('agency_id', $agencyId);
        });

        $query->when($articleId, function ($q) use ($articleId) {
            $q->where('article_id', $articleId);
        });

        if ($movementType === 'entree' || $movementType === 'sortie') {
            $query->where('movement_type', $movementType);
        } elseif ($movementType === 'global_no_delete') {
            $query->whereIn('movement_type', ['entree', 'sortie']);
        }
        
        $query->when($serviceId, function ($q) use ($serviceName) {
            $q->where('source_location', $serviceName);
        });

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
            $isGlobal = in_array($movementType, ['global_no_delete', 'global_with_delete']);
            $pdfView = $isGlobal ? "PDF.MovesGlobalPDFView" : "PDF.MovesPDFView";
            $pdf = Pdf::loadView($pdfView, $reportData);
            return $pdf->download($fileName . '.pdf');
        } elseif ($fileType === "excel") {
            return Excel::download(
                new MovementsExport(
                    $reportData['movements'],
                    $reportData['startDate'],
                    $reportData['endDate'],
                    $reportData['agencyName'],
                    $reportData['serviceName'],
                    $movementType,
                    $reportData['articleName']
                ),
                $fileName . '.xlsx'
            );
        }

        // Cas de fallback
        return back()->with('error', 'Type de fichier non supporté ou une erreur inattendue est survenue.');
    }
}

