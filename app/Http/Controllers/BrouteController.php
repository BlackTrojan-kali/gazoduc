<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Bordereau_route;
use App\Models\Chauffeur;
use App\Models\Entreprise;
use App\Models\Mouvement;
use App\Models\Stock;
use App\Models\Vehicule;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BrouteController extends Controller
{
    //
    public function index(){
        $vehicles = Vehicule::where("archived","!=",1)->where("type","Camion-plateau")->get();
        $drivers = Chauffeur::all();
        $agencies = Agency::all();
        $articles = Article::where("type","!=","matiere_premiere")->get();
        $broutes = Bordereau_route::with("departure","arrival","chauffeur","co_chauffeur","vehicule")->paginate(100);
        
        $roadbills = Bordereau_route::with("departure","arrival","chauffeur","co_chauffeur","vehicule")->paginate(100);
        
        if(Auth::user()->role->name != "direction"){

        $roadbills = Bordereau_route::where("departure_location_id",Auth::user()->agency_id)->orWhere("arrival_location_id",Auth::user()->agency_id)->with("departure","arrival","chauffeur","co_chauffeur","vehicule")->paginate(50);
        }
        return inertia("Transferts/Broute",compact("roadbills","agencies","drivers","agencies","vehicles","articles"));
    }
     public function store(Request $request)
{
    // 1. Validation rigoureuse des données
    $request->validate([
        'vehicle_id'          => ['required', 'exists:vehicules,id'],
        'driver_id'           => ['required', 'exists:chauffeurs,id'],
        'co_driver_id'        => ['nullable', 'exists:chauffeurs,id'],
        'arrival_location_id' => ['required', 'exists:agencies,id'],
        'departure_date'      => ['required', 'date'],
        'arrival_date'        => ['nullable', 'date', 'after_or_equal:departure_date'],
        'type'                => ['required', 'string', 'in:ramassage,livraison,transit'],
        'note'                => ['nullable', 'string'],
        'articles'            => ['required', 'array', 'min:1'],
        'articles.*.article_id' => ['required', 'exists:articles,id'],
        'articles.*.quantity'   => ['required', 'numeric', 'min:1'],
    ]);

    DB::beginTransaction();
    try {
        $user = Auth::user();
        
        // 2. Création du bordereau de route
        $roadbill = new Bordereau_route();
        $roadbill->vehicule_id            = $request->input('vehicle_id');
        $roadbill->chauffeur_id           = $request->input('driver_id');
        $roadbill->co_chauffeur_id        = $request->input('co_driver_id');
        $roadbill->departure_location_id  = $user->agency_id;
        $roadbill->arrival_location_id    = $request->input('arrival_location_id');
        $roadbill->departure_date         = $request->input('departure_date');
        $roadbill->arrival_date           = $request->input('arrival_date');
        $roadbill->types                  = $request->input('type'); // Garde la propriété de la migration
        $roadbill->notes                  = $request->input('note');
        $roadbill->status                 = 'en_cours';
        $roadbill->save();

        $arrivalAgency = Agency::findOrFail($roadbill->arrival_location_id);
        $articlesToAttach = [];

        // 3. Traitement des articles et des stocks
        foreach ($request->articles as $articleData) {
            $articleId = $articleData['article_id'];
            $qtyRequested = $articleData['quantity'];

            // Recherche du stock en magasin dans l'agence de départ
            $stock = Stock::where('article_id', $articleId)
                ->where('agency_id', $user->agency_id)
                ->where('storage_type', 'magasin')
                ->lockForUpdate() // Verrouillage pour éviter les conflits de stock simultanés
                ->first();

            if (!$stock || $stock->quantity < $qtyRequested) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'articles' => ["Stock insuffisant pour l'article ID: {$articleId} (Disponible: " . ($stock->quantity ?? 0) . ")"]
                ]);
            }

            // Décrémentation du stock
            $stock->quantity -= $qtyRequested;
            $stock->save();

            // Enregistrement du mouvement de stock
            $movement = new Mouvement();
            $movement->article_id           = $articleId;
            $movement->agency_id            = $user->agency_id;
            $movement->entreprise_id        = $user->entreprise_id;
            $movement->recorded_by_user_id  = $user->id;
            $movement->movement_type        = "sortie";
            $movement->qualification        = "transfert";
            $movement->quantity             = $qtyRequested;
            $movement->stock                = $stock->quantity; // Nouveau stock après sortie
            $movement->source_location      = $user->role->name ?? 'Utilisateur'; 
            $movement->destination_location = "Bordereau de route #" . $roadbill->id;
            $movement->description          = "Sortie transfert automatique #" . $roadbill->id . " vers " . $arrivalAgency->name;
            $movement->save();

            // Préparation pour l'attachement pivot
            $articlesToAttach[$articleId] = ['qty' => $qtyRequested];
        }

        // 4. Liaison des articles au bordereau
        $roadbill->articles()->attach($articlesToAttach);

        DB::commit();
        return back()->with('success', 'Le bordereau de route a été créé et les stocks mis à jour, monsieur.');

    } catch (\Illuminate\Validation\ValidationException $e) {
        DB::rollBack();
        throw $e;
    } catch (\Exception $e) {
        DB::rollBack();
        return back()->with('error', 'Une erreur est survenue, monsieur : ' . $e->getMessage());
    }
}
     public function downloadPdf($id)
    {
        $roadbill = Bordereau_route::with(['vehicule', 'chauffeur', 'co_chauffeur', 'articles',"departure","arrival"])
            ->findOrFail($id);
    
        $entreprise = Entreprise::where("id",Auth::user()->entreprise_id)->first();
        $pdf = Pdf::loadView('PDF.BroutePdfView', compact('roadbill',"entreprise"));
        
        return $pdf->download('bordereau_route_' . $roadbill->id . '.pdf');
    }
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            // On charge les articles avec leurs données pivot (quantité)
            $roadbill = Bordereau_route::with('articles')->findOrFail($id);

            // 1. Vérification de sécurité
            if ($roadbill->status !== 'en_cours') {
                return back()->with('error', "Impossible de supprimer ce bordereau. Statut actuel : {$roadbill->status}");
            }

            // 2. Restauration du Stock
            foreach ($roadbill->articles as $article) {
                // On récupère la quantité qui avait été déduite via la table pivot
                $qtyRestored = $article->pivot->qty;

                $stock = Stock::where('article_id', $article->id)
                    ->where('agency_id', $roadbill->departure_location_id)
                    ->where('storage_type', 'magasin')
                    ->lockForUpdate() // Verrouillage pour éviter les conflits pendant la restauration
                    ->first();

                if ($stock) {
                    $stock->quantity += $qtyRestored;
                    $stock->save();
                } else {
                    // Optionnel : Créer le stock s'il n'existe plus (cas rare)
                    // Stock::create([...]);
                }
            }

            // 3. Suppression des mouvements associés
            // CORRECTION ICI : On utilise destination_location qui est plus fiable que la description textuelle
            // Dans le store : $movement->destination_location = "Bordereau de route #" . $roadbill->id;
            Mouvement::where('destination_location', "Bordereau de route #" . $roadbill->id)
                ->where('movement_type', 'sortie') // Sécurité supplémentaire
                ->delete();

            // 4. Suppression des liaisons et du bordereau
            $roadbill->articles()->detach();
            $roadbill->delete();

            DB::commit();

            return back()->with('success', 'Le bordereau a été annulé, les mouvements supprimés et le stock restauré, monsieur.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur critique lors de la suppression : ' . $e->getMessage());
        }
    }
      public function validateRoadbill(Request $request, Bordereau_route $roadbill)
    {
        // 1. Validation de la requête
        $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
        ]);
        
        // Vérification des conditions de validation pour des raisons de sécurité
        // S'assurer que le bordereau n'est pas déjà validé
        if ($roadbill->status !== 'en_cours') {
            return back()->with('error', 'Le bordereau ne peut pas être validé car il n\'est pas en cours.');
            
            // 2. Utilisation d'une transaction pour garantir l'intégrité des données
        }
        try {
            DB::beginTransaction();

            // 3. Mise à jour du bordereau
            $roadbill->notes = $request->input('note');
            $roadbill->status = 'termine';
            $roadbill->arrival_date = now(); // Enregistrer la date de validation
            $roadbill->save();

            // 4. Boucle sur les articles du bordereau pour mettre à jour le stock
            foreach ($roadbill->articles as $article) {
                // Récupérer la quantité transférée depuis la table pivot
                $quantity = $article->pivot->qty;

                // Trouver ou créer l'entrée de stock pour l'article à l'agence de destination
                $stockEntry = Stock::where('agency_id',$roadbill->arrival_location_id)
                    ->where('article_id',$article->id)->where("storage_type","magasin")->first();
            

                // Mettre à jour la quantité en stock
                $stockEntry->quantity += $quantity;
                  $movement = new Mouvement();
                $movement->article_id = $article->id;
                $movement->agency_id = Auth::user()->agency_id;
                $movement->entreprise_id = Auth::user()->entreprise_id;
                $movement->recorded_by_user_id = Auth::user()->id;
                $movement->movement_type = "entree";
                $movement->qualification = "tranfert";
                $movement->quantity =  $article->pivot->qty;
                $movement->stock = $stockEntry->quantity;
                $movement->source_location = Auth::user()->role->name;
                $movement->destination_location = Auth::user()->agency->name;
                $movement->description = "tranfert automatique apres validation";
                

                $movement->save();
                $stockEntry->save();
            }

            // 5. Commit de la transaction
            DB::commit();

            return back()->with('success', 'Le bordereau a été validé et le stock mis à jour.');

        } catch (\Exception $e) {
            // 6. Rollback en cas d'erreur
            DB::rollBack();

            // Journaliser l'erreur pour le débogage
            // Log::error("Erreur lors de la validation du bordereau : " . $e->getMessage());

            return back()->with('error', 'Une erreur est survenue lors de la validation du bordereau.'.$e->getMessage());
        }
    }

   public function export(Request $request)
    {
        // 1. Récupération et validation des paramètres de filtre
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
        $departureAgency = $request->input('departureAgency');
        $arrivalAgency = $request->input('arrivalAgency');
        $articleId = $request->input('article');
        // 2. Construction de la requête de base pour les bordereaux de route
        // Utilisation du modèle Bordereau_route et des noms de relations corrects
        $query = Bordereau_route::with('articles', 'vehicule', 'chauffeur', 'co_chauffeur', 'departure', 'arrival');
    
        // Application des filtres
        // Utilisation de Carbon pour gérer les dates et heures de manière précise
        if ($startDate) {
            $query->whereBetween('created_at',[ Carbon::parse($startDate)->startOfDay(),Carbon::parse($endDate)->endOfDay()]);
        }
        if ($departureAgency) {
            $query->where('departure_location_id', $departureAgency);
        }
        if ($arrivalAgency) {
            $query->where('arrival_location_id', $arrivalAgency);
        }

        $roadbills = $query->get();
        // 3. Vérification si un article spécifique a été sélectionné
        if ($articleId) {
            // Logique pour un article spécifique
            $totalQuantity = 0;
            $filteredRoadbills = [];

            foreach ($roadbills as $roadbill) {
                foreach ($roadbill->articles as $article) {
                    if ($article->id == $articleId) {
                        $filteredRoadbills[] = [
                            'roadbill' => $roadbill,
                            'article' => $article,
                        ];
                        $totalQuantity += $article->pivot->qty;
                        // On sort de la boucle interne pour éviter de compter plusieurs fois le même bordereau
                        // si l'article y apparaît plusieurs fois (ce qui est rare, mais par sécurité).
                        break;
                    }
                }
            }
            // Génération du PDF pour un article spécifique
            $article = Article::find($articleId); // Pour récupérer le nom de l'article
            $pdf = Pdf::loadView('PDF.filtered_roadbills_by_article', compact('filteredRoadbills', 'article', 'totalQuantity', 'startDate', 'endDate'));
            return $pdf->download('bordereaux-par-article.pdf');

        } else {    
            // Logique pour tous les articles (bordereaux de route uniquement)
            $pdf = Pdf::loadView('PDF.general_roadbills', compact('roadbills', 'startDate', 'endDate'));
            return $pdf->download('bordereaux-generaux.pdf');
        }
    }
}
