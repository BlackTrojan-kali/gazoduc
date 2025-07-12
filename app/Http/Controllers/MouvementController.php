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



    public function moves($type)
    {
        // Récupérer l'utilisateur authentifié et son rôle
        $user = Auth::user();
        $userRoleName = $user->role->name; // Supposons que le rôle est accessible via une relation 'role'

        // 1. Récupération des mouvements (logique existante)
        if ($type == "entree") {
            $movements = Mouvement::where("agency_id", $user->agency_id)
                ->where("source_location", $userRoleName) // La source est le rôle de l'utilisateur
                ->where("movement_type", $type)
                ->with("agency", "article", "user") // Renommé 'user' en 'recordedByUser' pour plus de clarté si c'est l'utilisateur qui a enregistré
                ->paginate(15);
        } else {
            // Gérer d'autres types de mouvements si nécessaire
            // Pour l'exemple, nous allons juste retourner les mouvements d'entrée pour le moment
            // ou une gestion des erreurs si le type n'est pas 'entree'.
            // Si cette fonction est censée gérer tous les types, adaptez la requête.
            $movements = collect(); // Retourne une collection vide par défaut pour les autres types
        }

        // 2. Récupération des articles
        // Tous les articles sont généralement visibles, ou vous pouvez les filtrer par agence si nécessaire
        $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","produit")->orWhere("type","produit_fini")->orderBy('name')->get();

        // 3. Récupération des agences
        // Un utilisateur ne peut voir que l'agence à laquelle il est assigné
        if(Auth::user()->role->name ==="magasin"|| Auth::user()->role->name ==="production" || Auth::user()->name ==="commercial"){
        $agencies = Agency::where('id', $user->agency_id)->get();
    
        $services = Role::where('name', $userRoleName)->get();

}else{
    $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->get();
    $services = Role::all();
}
        // 4. Récupération des services
        // Un utilisateur ne peut voir que le service correspondant à 

        // Retourner la vue Inertia avec toutes les données nécessaires
        return Inertia("Entree", [
            "movements" => $movements,
            "articles" => $articles,
            "agencies" => $agencies,
            "services" => $services,
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
        // 1. Récupération et préparation des paramètres
        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();
        $agencyId = $request->get("agency_id");
        $serviceId = $request->get("service_id");
        $movementType = $request->get("movement_type");
        $articleId = $request->get("article_id");
        $fileType = $request->get("file_type");

        $roleName = null;
        $agencyName = null;
        $articleName = null;
        $serviceName = null; // Pour les filtres Excel

        if ($serviceId) {
            $role = Role::find($serviceId);
            if ($role) {
                $roleName = $role->name;
                $serviceName = $role->name; // Utilise le nom du rôle pour le filtre de service
            }
        }

        if ($agencyId) {
            $agency = Agency::find($agencyId);
            if ($agency) {
                $agencyName = $agency->name;
            }
        }

        if ($articleId) {
            $article = Article::find($articleId);
            if ($article) {
                $articleName = $article->name;
            }
        }

        // 2. Construction de la requête de base pour les mouvements
        $query = Mouvement::where("agency_id", $agencyId)
                          ->where("article_id", $articleId)
                          ->whereDate("created_at", ">=", $startDate)
                          ->whereDate("created_at", "<=", $endDate)
                          ->orderBy('created_at', 'asc')
                          ->with("article", "agency", "user",); // 'service' pour la relation dans le contrôleur

        if ($roleName) {
            $query->where("source_location", $roleName);
        }

        $fileName = 'historique_mouvements_' . now()->format('Ymd_His');

        if ($movementType !== "global") {
            $query->where("movement_type", $movementType);
            $movements = $query->get();

            if ($fileType == "pdf") {
                $pdf = Pdf::loadView("PDF.MovesPDFView", compact("movements", "role"));
                return $pdf->download($fileName . '.pdf');
            } elseif ($fileType == "excel") {
                // Passez toutes les variables nécessaires à l'exportateur
                return Excel::download(new MovementsExport(
                    $movements,
                    $startDate->format('d/m/Y'),
                    $endDate->format('d/m/Y'),
                    $agencyName,
                    $serviceName, // Ou $roleName
                    $movementType,
                    $articleName
                ), $fileName . '.xlsx');
            }

        } else { // C'est un mouvement global
            $movements = $query->get();

            if ($fileType == "pdf") {
                $pdf = Pdf::loadView("PDF.MovesGlobalPDFView", compact("movements", "role"));
                return $pdf->download($fileName . '.pdf');
            } elseif ($fileType == "excel") {
                // Passez toutes les variables nécessaires à l'exportateur
                return Excel::download(new MovementsExport(
                    $movements,
                    $startDate->format('d/m/Y'),
                    $endDate->format('d/m/Y'),
                    $agencyName,
                    $serviceName, // Ou $roleName
                    $movementType, // 'global' sera passé ici
                    $articleName
                ), $fileName . '.xlsx');
            }
        }
        return back()->with('error', 'Type de fichier non supporté ou données manquantes.')->withInput();
    }
}

