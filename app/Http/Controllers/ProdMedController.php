<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleMaintenance;
use App\Models\Stock;
use App\Models\Mouvement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProdMedController extends Controller
{
    /**
     * Affiche l'inventaire strict de la production (Gaz Médical) pour l'agence de l'utilisateur connecté.
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

        // 1. Récupération des codes-barres pour l'autocomplétion de la recherche (en PRODUCTION)
        $availableCodes = DB::table('stocks')
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->where('stocks.agency_id', $userAgencyId)
            ->where('stocks.storage_type', 'production') // Filtre sur la production
            ->where('stocks.quantity', 1)
            ->where('articles.type', 'gaz_medical')
            ->pluck('articles.code');

        // 2. Récupération des objets "Article" complets pour la modale de transfert (Sortie de la production)
        $availableArticlesForTransfer = Article::whereHas('stock', function($q) use ($userAgencyId) {
            $q->where('agency_id', $userAgencyId)
              ->where('storage_type', 'production') // Filtre sur la production
              ->where('quantity', 1);
        })->where('type', 'gaz_medical')
          ->get(['id', 'code', 'name']);
    
        // 3. Mouvements en attente venant du MAGASIN vers la PRODUCTION
        $pendingMovements = Mouvement::with('article:id,code,name')
            ->where('agency_id', $userAgencyId)
            ->where('destination_location', 'production') // La destination est la production
            ->where('source_location', 'magasin') // La source est le magasin
            ->where('status', 'pending')
            ->get(['id', 'article_id']); 

        // 4. Articles actuellement hors de la production (Non applicable ou utilisé différemment en prod)
        // Généralement, les retours clients vont au magasin, pas directement en production.
        // Mais nous laissons la variable vide pour respecter la structure des données attendue par le frontend.
        $articlesOut = [];


        // SCÉNARIO 1 : Recherche précise par code-barres (Stock actuel en PRODUCTION)
        if ($searchCode) {
            $searchedBottle = Stock::with(['article', 'agency'])
                ->whereHas('article', function ($query) use ($searchCode) {
                    $query->where('code', $searchCode)
                          ->where('type', 'gaz_medical');
                })
                ->where('agency_id', $userAgencyId) 
                ->where('storage_type', 'production') // Filtre sur la production
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
                ->where('stocks.storage_type', 'production') // Filtre sur la production
                ->where('stocks.quantity', 1)
                ->where('articles.type', 'gaz_medical')
                ->select('articles.name', DB::raw('count(*) as total_bottles'))
                ->groupBy('articles.name')
                ->get();

            foreach ($articleNames as $name) {
                $stockData = [
                    'name'       => $name,
                    'production' => 0, // Clé renommée pour refléter la zone
                ];

                foreach ($actualStocks as $actualStock) {
                    if ($actualStock->name === $name) {
                        $stockData['production'] = $actualStock->total_bottles;
                    }
                }

                $groupedStocks[] = $stockData;
            }
        }

        // Remarque : Vous pouvez utiliser une vue différente pour la production si nécessaire,
        // ou réutiliser la même vue si elle est assez générique. Ici on pointe vers le dossier Production.
        return Inertia::render('Direction/ProdMed/Inventory', [
            'groupedStocks'  => $groupedStocks,
            'searchedBottle' => $searchedBottle,
            'filters'        => $request->only(['code']),
            'userAgencyName' => Auth::user()->agency->name ?? 'Votre Agence',
            'availableCodes' => $availableCodes,
            'availableArticlesForTransfer' => $availableArticlesForTransfer, 
            'pendingMovements' => $pendingMovements, 
            'articlesOut'      => $articlesOut 
        ]);
    }
  public function storeMaintenance(Request $request)
    {
        // 1. Validation des données reçues depuis la modale
        $request->validate([
            'items'        => 'required|array|min:1',
            'items.*'      => 'exists:articles,id',
            'type'         => 'required|string',
            'provider'     => 'nullable|string',
            'start_date'   => 'required|date',
            'observations' => 'nullable|string',
        ]);

        $user = Auth::user();

        try {
            DB::beginTransaction();

            foreach ($request->items as $articleId) {
                // SÉCURITÉ AJOUTÉE : On vérifie que la bouteille est bien dans le stock PRODUCTION de l'agence de l'utilisateur
                // Cela empêche un utilisateur malveillant de modifier une bouteille d'une autre agence via l'inspecteur web
                $article = Article::whereHas('stock', function ($query) use ($user) {
                    $query->where('agency_id', $user->agency_id)
                          ->where('storage_type', 'production')
                          ->where('quantity', '>', 0);
                })->lockForUpdate()->find($articleId);

                // Si l'article n'est pas trouvé dans ce stock précis
                if (!$article) {
                    throw ValidationException::withMessages([
                        'error' => "Opération annulée : L'une des bouteilles sélectionnées est introuvable dans votre stock de production."
                    ]);
                }

                // Sécurité : vérifier si la bouteille n'y est pas déjà
                if ($article->state === 'en_maintenance') {
                    throw ValidationException::withMessages([
                        'error' => "Opération annulée : L'article {$article->name} (Code: {$article->code}) est déjà signalé en maintenance."
                    ]);
                }

                // A. On change simplement l'état de la bouteille
                $article->update([
                    'state' => 'en_maintenance'
                ]);

                // B. On enregistre le début de l'intervention dans la table dédiée
                ArticleMaintenance::create([
                    'article_id'          => $article->id,
                    'agency_id'           => $user->agency_id,
                    'recorded_by_user_id' => $user->id,
                    'type'                => $request->type,
                    'status'              => 'en_cours',
                    'start_date'          => $request->start_date,
                    'provider'            => $request->provider,
                    'observations'        => $request->observations,
                    // Note: 'end_date' et 'cost' restent null par défaut, comme défini dans la migration
                ]);
            }

            DB::commit();
            
            // Retourne un message de succès pour l'affichage via SweetAlert
            return back()->with('success', 'Les bouteilles ont été déclarées en maintenance avec succès.');

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e; // Inertia.js et Laravel gèrent parfaitement cette exception pour afficher les erreurs
        } catch (\Exception $e) {
            DB::rollBack();
            // On convertit les erreurs SQL ou système en erreurs de validation lisibles sur l'interface
            throw ValidationException::withMessages([
                'error' => "Une erreur système inattendue est survenue : " . $e->getMessage()
            ]);
        }
    }
    /**
     * Affiche l'historique des maintenances et fournit les données pour la modale
     */
    public function maintenanceIndex(Request $request)
    {
        $user = Auth::user();
        $userAgencyId = $user->agency_id;

        if (!$userAgencyId) {
            abort(403, 'Vous devez être affecté à une agence pour voir cet historique.');
        }

        // 1. Récupération de l'historique des maintenances (avec pagination)
        // On charge la relation "article" (et son "productInside" pour le gaz) ainsi que l'utilisateur ("recordedBy")
        $maintenances = ArticleMaintenance::with([
                'article:id,code,name,product_inside_id', 
                'article.productInside:id,name',
                'recordedBy:id,first_name' // Pour afficher qui a enregistré la maintenance
            ])
            ->where('agency_id', $userAgencyId)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // 2. Données pour la Modale "Envoyer en maintenance"
        // On cherche les articles qui sont physiquement en production et qui NE SONT PAS déjà en maintenance
        $availableArticlesForMaintenance = Article::with('productInside:id,name')
            ->whereHas('stock', function($q) use ($userAgencyId) {
                $q->where('agency_id', $userAgencyId)
                  ->where('storage_type', 'production')
                  ->where('quantity', '>', 0);
            })
            ->where('state', '!=', 'en_maintenance') // Crucial : on exclut celles déjà en panne
            ->where('type', 'gaz_medical')
            ->get(['id', 'code', 'name', 'product_inside_id']);

        // 3. Retour à la vue Inertia
        return Inertia::render('Direction/ProdMed/MaintenanceIndex', [
            'maintenances'      => $maintenances,
            'availableArticles' => $availableArticlesForMaintenance,
            'userAgencyName'    => $user->agency->name ?? 'Votre Agence',
        ]);
    }
    /**
     * Clôture une intervention de maintenance et libère la bouteille
     */
    public function completeMaintenance($id)
    {
        try {
            DB::beginTransaction();

            // On récupère la maintenance avec la bouteille associée
            $maintenance = ArticleMaintenance::with('article')->findOrFail($id);

            // Vérification de sécurité : s'assurer qu'elle est bien "en_cours"
            if ($maintenance->status !== 'en_cours') {
                throw ValidationException::withMessages([
                    'error' => "Opération impossible : Cette intervention est déjà clôturée ou a été annulée."
                ]);
            }

            // Sécurité additionnelle : l'utilisateur doit être de la même agence
            if ($maintenance->agency_id !== Auth::user()->agency_id) {
                abort(403, "Vous n'êtes pas autorisé à modifier une maintenance d'une autre agence.");
            }

            // A. On met à jour l'historique de la maintenance
            $maintenance->update([
                'status'   => 'terminee',
                'end_date' => now(), // Enregistre la date et l'heure actuelles
            ]);

            // B. On met à jour l'état de la bouteille elle-même
            if ($maintenance->article) {
                $maintenance->article->update([
                    'state'            => 'vide', // La bouteille revient vide
                    'last_maintenance' => now()->toDateString(), // Met à jour sa date de dernière réépreuve
                ]);
            }

            DB::commit();
            return back()->with('success', 'L\'intervention a été clôturée. La bouteille est maintenant disponible (état: vide).');

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
}