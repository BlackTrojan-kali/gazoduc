<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Agency;
use App\Models\Mouvement;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class MagMedController extends Controller
{
    /**
     * Affiche l'inventaire strict du magasin (Gaz Médical)
     */
 /**
     * Affiche l'inventaire strict du magasin (Gaz Médical) pour l'agence de l'utilisateur connecté.
   */
   /**
     * Affiche l'inventaire strict du magasin (Gaz Médical) pour l'agence de l'utilisateur connecté.
     */
    public function inventory(Request $request)
    {
        $userAgencyId = Auth::user()->agency_id;

        if (!$userAgencyId) {
            abort(403, 'Vous devez être affecté à une agence pour voir ce stock.');
        }

        $searchCode = $request->input('code');
        $searchedBottle = null;
        $groupedStocks = [];

        // 1. Récupération des codes-barres pour l'autocomplétion de la recherche
        $availableCodes = DB::table('stocks')
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->where('stocks.agency_id', $userAgencyId)
            ->where('stocks.storage_type', 'magasin')
            ->where('stocks.quantity', 1)
            ->where('articles.type', 'gaz_medical')
            ->pluck('articles.code');

        // 2. Récupération des objets "Article" complets pour la modale de transfert (Sortie)
        $availableArticlesForTransfer = Article::whereHas('stock', function($q) use ($userAgencyId) {
            $q->where('agency_id', $userAgencyId)
              ->where('storage_type', 'magasin')
              ->where('quantity', 1);
        })->where('type', 'gaz_medical')
          ->get(['id', 'code', 'name']);

        // 3. NOUVEAU (POUR LA RÉCEPTION) : Mouvements en attente venant de la production
        // On cherche les transferts vers le magasin avec le statut 'pending'
        $pendingMovements = Mouvement::with('article:id,code,name')
            ->where('agency_id', $userAgencyId)
            ->where('destination_location', 'magasin')
            ->where('source_location', 'production') // On filtre pour ne voir que ce qui vient de la prod
            ->where('status', 'pending')
            ->get(['id', 'article_id']); 

        // 4. NOUVEAU (POUR LA RÉCEPTION CLIENT) : Articles actuellement hors du magasin
        // Bouteilles créées pour cette agence mais dont le stock 'magasin' est à 0 (ou absent)
        $articlesOut = Article::where('type', 'gaz_medical')
            ->whereDoesntHave('stock', function($q) use ($userAgencyId) {
                $q->where('agency_id', $userAgencyId)
                  ->where('storage_type', 'magasin')
                  ->where('quantity', 1);
            })
            // Optionnel : Vous pourriez rajouter une condition pour ne cibler que les bouteilles de VOTRE agence
            // ->where('entreprise_id', ...) si c'est géré ainsi.
            ->get(['id', 'code', 'name']);


        // SCÉNARIO 1 : Recherche précise par code-barres (Stock actuel)
        if ($searchCode) {
            $searchedBottle = Stock::with(['article', 'agency'])
                ->whereHas('article', function ($query) use ($searchCode) {
                    $query->where('code', $searchCode)
                          ->where('type', 'gaz_medical');
                })
                ->where('agency_id', $userAgencyId) 
                ->where('storage_type', 'magasin')  
                ->where('quantity', 1) 
                ->first(); 
        } 
        
        // SCÉNARIO 2 : Vue Globale par défaut
        else {
            $articleNames = Article::where('type', 'gaz_medical')
                ->select('name')
                ->distinct()
                ->pluck('name');

            $actualStocks = DB::table('stocks')
                ->join('articles', 'stocks.article_id', '=', 'articles.id')
                ->where('stocks.agency_id', $userAgencyId)
                ->where('stocks.storage_type', 'magasin')
                ->where('stocks.quantity', 1)
                ->where('articles.type', 'gaz_medical')
                ->select('articles.name', DB::raw('count(*) as total_bottles'))
                ->groupBy('articles.name')
                ->get();

            foreach ($articleNames as $name) {
                $stockData = [
                    'name'    => $name,
                    'magasin' => 0,
                ];

                foreach ($actualStocks as $actualStock) {
                    if ($actualStock->name === $name) {
                        $stockData['magasin'] = $actualStock->total_bottles;
                    }
                }

                $groupedStocks[] = $stockData;
            }
        }

        return Inertia::render('Direction/MagMed/Inventory', [
            'groupedStocks'  => $groupedStocks,
            'searchedBottle' => $searchedBottle,
            'filters'        => $request->only(['code']),
            'userAgencyName' => Auth::user()->agency->name ?? 'Votre Agence',
            'availableCodes' => $availableCodes,
            'availableArticlesForTransfer' => $availableArticlesForTransfer, 
            'pendingMovements' => $pendingMovements, // Pour la réception (onglet Production)
            'articlesOut'      => $articlesOut       // Pour la réception (onglet Client)
        ]);
    }
    /**
     * Gère le transfert multiple de bouteilles depuis le magasin
     */
  /**
     * Gère la sortie multiple de bouteilles depuis le magasin
     */
    public function transferMultiple(Request $request)
    {
        // 1. Validation de base des données reçues
        $request->validate([
            'destination_location' => 'required|string|in:magasin,production,commercial',
            'article_ids'          => 'required|array|min:1',
            'article_ids.*'        => 'exists:articles,id',
        ]);

        $user = Auth::user();
        $sourceLocation = $user->role->name; // Origine fixe puisque l'action vient du magasin
        $destinationLocation = $request->destination_location;
        $articleIds = $request->article_ids;

        // Détermination du statut selon votre règle d'affaires
        $status = in_array($destinationLocation, ['production', 'magasin']) ? 'pending' : 'finished';

        try {
            // 2. Démarrage de la transaction SQL
            DB::beginTransaction();

            foreach ($articleIds as $articleId) {
                // Verrouillage de la ligne pour éviter les conflits d'accès
                $article = Article::lockForUpdate()->findOrFail($articleId);

                // --- CONTRAINTE 1 : Bouteille en maintenance ---
                if ($article->state === 'en_maintenance') {
                    throw ValidationException::withMessages([
                        'error' => "Opération annulée : L'article {$article->name} (Code: {$article->code}) est actuellement en maintenance."
                    ]);
                }

                // --- CONTRAINTE 2 : Vérification du stock source ---
                $sourceStock = Stock::where('article_id', $articleId)
                                    ->where('agency_id', $user->agency_id)
                                    ->where('storage_type', $sourceLocation)
                                    ->lockForUpdate()
                                    ->first();

                if (!$sourceStock || $sourceStock->quantity <= 0) {
                    throw ValidationException::withMessages([
                        'error' => "Opération annulée : L'article {$article->name} (Code: {$article->code}) n'est plus physiquement présent au magasin (Stock = 0)."
                    ]);
                }

                // 3. Création de l'enregistrement de Mouvement
                Mouvement::create([
                    'article_id'            => $articleId,
                    'agency_id'             => $user->agency_id,
                    'entreprise_id'         => $article->entreprise_id ?? null,
                    'recorded_by_user_id'   => $user->id,
                    'movement_type'         => 'sortie', 
                    'source_location'       => $sourceLocation,
                    'destination_location'  => $destinationLocation,
                    'quantity'              => 1, // Quantité absolue positive
                    'status'                => $status, // 'pending' ou 'finished'
                    'state'                 => $article->state,
                    'batch_number'          => $article->batch_number,
                    'description'           => "Sortie multiple du {$sourceLocation} vers {$destinationLocation}",
                ]);

                // 4. Mise à jour des Stocks
                // A. On retire du magasin
                $sourceStock->decrement('quantity', 1);

                // B. On ajoute à la destination
        if($destinationLocation == "commercial"){
                $destinationStock = Stock::firstOrCreate(
                    [
                        'article_id'   => $articleId,
                        'agency_id'    => $user->agency_id,
                        'storage_type' => $destinationLocation,
                    ],
                    [
                        'quantity'           => 0,
                        'theorical_quantity' => 0,
                    ]
                );
            
                $destinationStock->increment('quantity', 1);
            }
            }

            // Si tout s'est bien passé pour TOUS les articles, on valide
            DB::commit();

            return back()->with('success', 'La sortie a été enregistrée avec succès.');

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e; 
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'error' => "Une erreur système inattendue est survenue : " . $e->getMessage()
            ]);
        }
    }

    /**
     * Gère la réception multiple de bouteilles au magasin (depuis la Production ou les Clients)
     */
 /**
     * Gère la réception multiple de bouteilles au magasin (depuis la Production ou les Clients)
     */
public function receiveMultiple(Request $request)
{
    $request->validate([
        'reception_type' => 'required|string|in:production,client',
        'items'          => 'required|array|min:1',
    ]);

    $user = Auth::user();
    $receptionType = $request->reception_type;
    $items = $request->items;

    // Localisation de l'utilisateur : 'magasin' ou 'production'
    $userLocation = $user->role->name; 

    try {
        DB::beginTransaction();

        if ($receptionType === 'production') {
            $request->validate(['items.*' => 'exists:mouvements,id']);

            foreach ($items as $mouvementId) {
                $pendingMouvement = Mouvement::with('article')->lockForUpdate()->findOrFail($mouvementId);
                $articleId = $pendingMouvement->article_id;
                // Déterminer la source attendue selon qui reçoit
                $expectedSource = ($userLocation === 'magasin') ? 'production' : 'magasin';

                if ($pendingMouvement->source_location !== $expectedSource) {
                    throw ValidationException::withMessages([
                        'error' => "Action interdite : Vous tentez de réceptionner un flux venant de '{$pendingMouvement->source_location}', mais vous ne pouvez valider que les flux venant de '{$expectedSource}'."
                    ]);
                }

                if ($pendingMouvement->status !== 'pending') {
                    throw ValidationException::withMessages([
                        'error' => "Opération annulée : L'article {$pendingMouvement->article->name} a déjà été réceptionné."
                    ]);
                }

                // 1. Clôturer le mouvement de transfert (la sortie)
                $pendingMouvement->update(['status' => 'finished']);

                // 2. Créer le mouvement d'entrée effectif
             // B. On crée le mouvement d'ENTRÉE effectif dans le stock local
                    Mouvement::create([
                        'article_id'            => $pendingMouvement->article_id,
                        'agency_id'             => $user->agency_id,
                        'entreprise_id'         => $pendingMouvement->article->entreprise_id ?? null,
                        'recorded_by_user_id'   => $user->id,
                        'movement_type'         => 'entree',
                        'source_location'       => $userLocation,
                        'destination_location'  => $userLocation, 
                        'quantity'              => 1,
                        'status'                => 'finished',
                        'state'                 => $pendingMouvement->article->state,
                        'batch_number'          => $pendingMouvement->article->batch_number,
                        'description'           => "Réception validée par " . strtoupper($userLocation) . " (Origine: " . $pendingMouvement->source_location . ")",
                        
                        // SUPPRIMEZ OU COMMENTEZ CETTE LIGNE :
                        // 'related_document_id'   => $pendingMouvement->id, 
                    ]);
                    
                // Incrémentation du stock magasin
                $magasinStock = Stock::firstOrCreate(
                    ['article_id' => $articleId, 'agency_id' => $user->agency_id, 'storage_type' => $userLocation],
                    ['quantity' => 0, 'theorical_quantity' => 0]
                );
                $magasinStock->increment('quantity', 1);
            }
        } 
        else if ($receptionType === 'client') {
            $request->validate(['items.*' => 'exists:articles,id']);

            foreach ($items as $articleId) {
                $article = Article::lockForUpdate()->findOrFail($articleId);

                if ($article->state === 'en_maintenance') {
                    throw ValidationException::withMessages([
                        'error' => "Alerte : L'article {$article->name} est en maintenance et ne peut être réceptionné ici."
                    ]);
                }

                // Sécurité : Vérifier si l'article est déjà déclaré en stock ailleurs
                $existingStock = Stock::with('agency')
                    ->where('article_id', $articleId)
                    ->where('quantity', '>', 0)
                    ->lockForUpdate()
                    ->first();

                if ($existingStock) {
                    $loc = $existingStock->agency->name . " (" . $existingStock->storage_type . ")";
                    throw ValidationException::withMessages([
                        'error' => "Anomalie : L'article {$article->code} est déjà listé en stock à : {$loc}."
                    ]);
                }

                // Incrémentation du stock magasin
                $magasinStock = Stock::firstOrCreate(
                    ['article_id' => $articleId, 'agency_id' => $user->agency_id, 'storage_type' => $userLocation],
                    ['quantity' => 0, 'theorical_quantity' => 0]
                );
                $magasinStock->increment('quantity', 1);

                Mouvement::create([
                    'article_id'            => $articleId,
                    'agency_id'             => $user->agency_id,
                    'recorded_by_user_id'   => $user->id,
                    'movement_type'         => 'entree', 
                    'source_location'       => 'commercial',
                    'destination_location'  => 'magasin',
                    'quantity'              => 1,
                    'status'                => 'finished', 
                    'state'                 => $article->state,
                    'description'           => "Retour client réceptionné au magasin",
                ]);
            }
        }

        DB::commit();
        return back()->with('success', 'Réception validée avec succès.');

    } catch (ValidationException $e) {
        DB::rollBack();
        throw $e;
    } catch (\Exception $e) {
        DB::rollBack();
        throw ValidationException::withMessages(['error' => "Erreur : " . $e->getMessage()]);
    }
}
}