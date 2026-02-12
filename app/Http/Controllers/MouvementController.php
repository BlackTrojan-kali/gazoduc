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
            'qualification' => ['required', 'in:reepreuve,achat,"consigne",perte,transfert,reception,vente,retour_sur_vente'],
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

    // 1. Récupération des filtres
    $filterArticleName = $request->input('article_name');
    $filterQualification = $request->input('qualification');
    $filterAgencyId = $request->input('agency_id');
    $filterServiceId = $request->input('service'); // On reçoit un ID ici depuis le React Select

    // 2. Initialiser la requête
    $movementsQuery = Mouvement::with(['agency', 'article', 'user']);

    // 3. Logique de restriction par Rôle
    $restrictedRoles = ['magasin', 'production', 'commercial'];

    if ($userRoleName === 'controleur' || $userRoleName === 'direction') {
        // --- DIRECTION & CONTROLEUR ---
        
        // A. Restriction d'Agence
        if ($userRoleName === 'controleur') {
            $movementsQuery->where('agency_id', $user->agency_id);
        } elseif ($userRoleName === 'direction' && $filterAgencyId) {
            $movementsQuery->where('agency_id', $filterAgencyId);
        }

        // B. Filtre par Service (CORRECTION MAJEURE ICI)
        // Le frontend envoie l'ID (ex: 1), mais la DB stocke le nom (ex: 'magasin') dans source_location
        if ($filterServiceId) {
            // On cherche le nom du rôle correspondant à cet ID
            $serviceName = Role::where('id', $filterServiceId)->value('name');
            
            if ($serviceName) {
                $movementsQuery->where('source_location', $serviceName);
            }
        }

    } else {
        // --- RÔLES OPÉRATIONNELS ---
        $movementsQuery->where('movement_type', $type);
        $movementsQuery->where('source_location', $userRoleName);

        if (in_array($userRoleName, $restrictedRoles)) {
            $movementsQuery->where('agency_id', $user->agency_id);
        } elseif ($filterAgencyId) {
            $movementsQuery->where('agency_id', $filterAgencyId);
        }
    }

    // 4. Filtres transversaux
    if ($filterArticleName) {
        // Optimisation: utiliser whereIn pour les ID d'articles si possible, sinon whereHas est OK
        $movementsQuery->whereHas('article', function ($query) use ($filterArticleName) {
            $query->where('name', 'like', '%' . $filterArticleName . '%');
        });
    }

    if ($filterQualification) {
        $movementsQuery->where('qualification', $filterQualification);
    }

    // 5. Exécution et Pagination
    // ->withQueryString() garde les filtres actifs quand on change de page (ex: page 2)
    $movements = $movementsQuery->latest()
        ->paginate(150)
        ->withQueryString();

    // 6. Chargement des données pour les listes (Selects)
    
    // Articles (Optimisé: id + name)
    $articles = Article::where('entreprise_id', $user->entreprise_id)
        ->where('type', '!=', 'matiere_premiere')
        ->orderBy('name')
        ->get(['id', 'name']);

    // Agences
    if ($userRoleName === 'direction') {
        $agencies = Agency::where('entreprise_id', $user->entreprise_id)->get(['id', 'name']);
    } else {
        $agencies = Agency::where('id', $user->agency_id)->get(['id', 'name']);
    }

    // Services (CORRECTION: Il faut récupérer 'id' ET 'name' pour le Select React)
    if ($userRoleName === 'controleur' || $userRoleName === 'direction') {
        $services = Role::whereIn('name', ['magasin', 'production', 'commercial'])->get(['id', 'name']);
    } else {
        $services = Role::where('name', $userRoleName)->get(['id', 'name']);
    }

    // 7. Retour Inertia
    return Inertia::render('Entree', [
        'movements' => $movements,
        'articles' => $articles,
        'agencies' => $agencies,
        'services' => $services,
        'filters' => [
            'article_name' => $filterArticleName,
            'qualification' => $filterQualification,
            'agency_id' => $filterAgencyId,
            'service' => $filterServiceId, // On renvoie l'ID pour que le Select reste sélectionné
        ],
    ]);
}
    public function delete($idmov){
        $move = Mouvement::where("id",$idmov)->first();
        $stock =  Stock::where("agency_id",Auth::user()->agency_id)->where("article_id",$move->article_id)
        ->where("storage_type",Auth::user()->role->name)->first();
        if (str_contains($move->description, "sortie transfert automatique #") ){
            return back()->with("warning","veillez supprimer le bordereau de route pour supprimer cette sortie");
        }
        if(str_contains($move->description , "mouvement automatique pour vente")){
            return back()->with("warning","veillez supprimer la vente  pour supprimer ce mouvement");
            
        }
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
    // 1. Validation stricte des paramètres
    $validated = $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'agency_id' => 'nullable|exists:agencies,id',
        'service_id' => 'nullable|exists:roles,id',
        'article_id' => 'nullable|exists:articles,id',
        'type_mouvement' => 'nullable|in:entree,sortie,global_no_delete,global_with_delete',
        'file_type' => 'required|in:pdf,excel',
    ]);

    // 2. Préparation des variables de date et de contexte
    $startDate = Carbon::parse($validated['start_date'])->startOfDay();
    $endDate = Carbon::parse($validated['end_date'])->endOfDay();
    
    // Récupération des entités pour l'affichage (Header du PDF/Excel)
    $agency = $request->filled('agency_id') ? Agency::find($validated['agency_id']) : null;
    $service = $request->filled('service_id') ? Role::find($validated['service_id']) : null;
    $article = $request->filled('article_id') ? Article::find($validated['article_id']) : null;

    $agencyName = $agency ? $agency->name : 'Toutes les agences';
    $serviceName = $service ? $service->name : 'Tous les services'; // Attention : ici c'est le nom du Rôle
    $articleName = $article ? $article->name : 'Tous les articles';

    // 3. Initialisation de la requête
    $query = Mouvement::query()
        ->with(['article', 'agency', 'user']) // Eager loading pour éviter les requêtes N+1
        ->whereBetween('created_at', [$startDate, $endDate])
        ->orderBy('created_at', 'asc');

    // 4. Application des filtres conditionnels
    
    // A. Filtre Agence
    $query->when($request->filled('agency_id'), function ($q) use ($validated) {
        $q->where('agency_id', $validated['agency_id']);
    });

    // B. Filtre Article
    $query->when($request->filled('article_id'), function ($q) use ($validated) {
        $q->where('article_id', $validated['article_id']);
    });

    // C. Filtre Service (Source Location)
    // On suppose que le nom du rôle correspond à la valeur dans 'source_location'
    $query->when($service, function ($q) use ($service) {
        $q->where('source_location', $service->name);
    });

    // D. Gestion complexe du Type de Mouvement (Entrée, Sortie, Global, Supprimés)
    $typeMouv = $validated['type_mouvement'] ?? 'global_no_delete';
    $movementTypeName = 'Rapport Global'; // Valeur par défaut

    switch ($typeMouv) {
        case 'entree':
            $query->where('movement_type', 'entree');
            $movementTypeName = 'Entrées Uniquement';
            break;
        case 'sortie':
            $query->where('movement_type', 'sortie');
            $movementTypeName = 'Sorties Uniquement';
            break;
        case 'global_with_delete':
            // Inclure les éléments supprimés (SoftDeletes)
            $query->withTrashed(); 
            $movementTypeName = 'Global (Inclus Supprimés)';
            break;
        case 'global_no_delete':
        default:
            $movementTypeName = 'Global (Actifs)';
            break;
    }

    // 5. Exécution de la requête
    $movements = $query->get();

    if ($movements->isEmpty()) {
        return back()->with('error', 'Aucune donnée trouvée pour cette période et ces critères, monsieur.');
    }

    // 6. Packaging des données pour l'export
    $reportData = [
        'movements' => $movements,
        'startDate' => $startDate->format('d/m/Y'),
        'endDate' => $endDate->format('d/m/Y'),
        'agencyName' => $agencyName,
        'serviceName' => $serviceName,
        'articleName' => $articleName,
        'movementTypeName' => $movementTypeName,
    ];

    $fileName = 'Rapport_Mouvements_' . now()->format('Ymd_His');

    // 7. Génération du fichier (PDF ou Excel)
    if ($validated['file_type'] === 'pdf') {
        // Choix de la vue selon si on affiche les supprimés ou non (optionnel, sinon garder une seule vue)
        $viewName = ($typeMouv === 'global_with_delete') ? 'PDF.MovesGlobalPDFView' : 'PDF.MovesPDFView';
        
        $pdf = Pdf::loadView($viewName, $reportData);
        // Optionnel : ->setPaper('a4', 'landscape') si le tableau est large
        return $pdf->download($fileName . '.pdf');
    } 
    
    if ($validated['file_type'] === 'excel') {
        return Excel::download(
            new MovementsExport(
                $movements,
                $reportData['startDate'],
                $reportData['endDate'],
                $agencyName,
                $serviceName,
                $movementTypeName, // J'ai remplacé $type par le nom lisible
                $articleName
            ),
            $fileName . '.xlsx'
        );
    }

    return back();
}
}

