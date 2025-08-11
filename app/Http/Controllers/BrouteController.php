<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Bordereau_route;
use App\Models\Chauffeur;
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
        $vehicles = Vehicule::all();
        $drivers = Chauffeur::all();
        $agencies = Agency::all();
        $articles = Article::all();
        $broutes = Bordereau_route::with("departure","arrival","chauffeur","co_chauffeur","vehicule")->paginate(15);
        if(Auth::user()->role->name != "direction"){

        $roadbills = Bordereau_route::where("departure_location_id",Auth::user()->agency_id)->orWhere("arrival_location_id",Auth::user()->agency_id)->with("departure","arrival","chauffeur","co_chauffeur","vehicule")->paginate(15);
        }
        return inertia("Transferts/Broute",compact("roadbills","agencies","drivers","agencies","vehicles","articles"));
    }
     
    public function store(Request $request)
    {
        // Validation des données entrantes
        $request->validate([
            'vehicle_id' => ['required', 'exists:vehicules,id'],
            'driver_id' => ['required', 'exists:chauffeurs,id'],
            'co_driver_id' => ['nullable', 'exists:chauffeurs,id'],
            'arrival_location_id' => ['required', 'exists:agencies,id'],
            'departure_date' => ['required', 'date'],
            'arrival_date' => ['nullable', 'date', 'after_or_equal:departure_date'],
            'type' => ['required', 'string', 'in:ramassage,livraison,transit'],
            'note' => ['nullable', 'string'],
        ]);

        // Utilisation d'une transaction pour garantir l'atomicité
        DB::beginTransaction();

        try {
            // Création du bordereau de route
            $roadbill = new Bordereau_route();
            
            // Affectation des attributs un par un
            $roadbill->vehicule_id = $request->input('vehicle_id');
            $roadbill->chauffeur_id = $request->input('driver_id'); // Correction du nom de l'input
            $roadbill->co_chauffeur_id = $request->input('co_driver_id'); // Correction du nom de l'input
            $roadbill->departure_location_id = Auth::user()->agency_id;
            $roadbill->arrival_location_id = $request->input('arrival_location_id');
            $roadbill->departure_date = $request->input('departure_date');
            $roadbill->arrival_date = $request->input('arrival_date');
            $roadbill->types = $request->input('type');
            $roadbill->notes = $request->input('note');
            $roadbill->status = 'en_cours'; // Statut par défaut
            
            $roadbill->save();

            // Attachement des articles au bordereau de route et décrémentation des stocks
            $articlesToAttach = [];
            foreach ($request->articles as $articleData) {
                // Recherche du stock correspondant
                $stock = Stock::where('article_id', $articleData['article_id'])
                    ->where('agency_id', Auth::user()->agency_id)
                    ->where('storage_type', 'magasin')
                    ->first();
                
                // Vérification et décrémentation du stock
                if (!$stock || $stock->quantity < $articleData['quantity']) {
                    DB::rollBack();
                    return back()->with('error','Stock insuffisant pour l\'article ' . $articleData['id']);
                }

                $stock->quantity -= $articleData['quantity'];

                  $movement = new Mouvement();
                $movement->article_id = $articleData["article_id"];
                $movement->agency_id = Auth::user()->agency_id;
                $movement->entreprise_id = Auth::user()->entreprise_id;
                $movement->recorded_by_user_id = Auth::user()->id;
                $movement->movement_type = "sortie";
                $movement->qualification = "tranfert";
                $movement->quantity =  $articleData["quantity"];
                $movement->stock = $stock->quantity;
                $movement->source_location = Auth::user()->role->name;
                $movement->destination_location = "confert bordereau de route";
                $movement->description = "sortie transfert automatique #".$roadbill->id;
                

                $movement->save();
                $stock->save();

                $articlesToAttach[$articleData['article_id']] = ['qty' => $articleData['quantity']];
            }

            $roadbill->articles()->attach($articlesToAttach);

            DB::commit();

            return back()->with('success', 'Bordereau de route créé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error','Une erreur est survenue lors de la création du bordereau : ' . $e->getMessage());
        }
    }
     public function downloadPdf($id)
    {
        $roadbill = Bordereau_route::with(['vehicule', 'chauffeur', 'co_chauffeur', 'articles',"departure","arrival"])
            ->findOrFail($id);

        $pdf = Pdf::loadView('PDF.BroutePdfView', compact('roadbill'));
        
        return $pdf->download('bordereau_route_' . $roadbill->id . '.pdf');
    }
     
  public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $roadbill = Bordereau_route::with('articles')->findOrFail($id);
            
            // Vérification du statut avant de procéder à la suppression
            if ($roadbill->status !== 'en_cours') {
                return back()->with('error', 'Le bordereau ne peut pas être supprimé car il n\'est pas en cours.');
            }

            // Réintégrer les articles dans le stock
            foreach ($roadbill->articles as $article) {
                $stock = Stock::where('article_id', $article->id)
                    ->where('agency_id', $roadbill->departure_location_id)
                    ->where('storage_type', 'magasin')
                    ->first();
                
                if ($stock) {
                    $stock->quantity += $article->pivot->qty;
                    $stock->save();
                }
            }

            // Supprimer les mouvements associés au bordereau avec une description exacte
            $description = "sortie transfert automatique #" . $roadbill->id;
            Mouvement::where('description', $description)->delete();

            // Supprimer les relations et le bordereau
            $roadbill->articles()->detach();
            $roadbill->delete();

            DB::commit();

            return back()->with('success', 'Bordereau de route et mouvements associés supprimés avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la suppression du bordereau : ' . $e->getMessage());
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
