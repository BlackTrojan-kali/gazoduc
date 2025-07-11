<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article; // Assurez-vous d'importer vos modèles
use App\Models\Agency;
use App\Models\Stock; // Votre modèle Stock
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Pour les transactions

class StockController extends Controller
{
    /**
     * Crée des entrées de stock initiales (quantité 0) pour un article
     * dans toutes les agences d'une entreprise spécifique.
     */
    public function createForArticle($idAr)
    {;

        $articleId = $idAr;
        $entrepriseId = Auth::user()->entreprise_id;

        // Récupérer toutes les agences de l'entreprise spécifiée
        $agencies = Agency::where('entreprise_id', $entrepriseId)->get();

         $article = Article::findOrFail($articleId);

        // Récupérer toutes les agences de l'entreprise spécifiée
        $agencies = Agency::where('entreprise_id', $entrepriseId)->get();

        if ($agencies->isEmpty()) {
            return back()->with('error' , 'Aucune agence trouvée pour cette entreprise.');
        }
        DB::beginTransaction(); // Démarre une transaction

        try {
            // Déterminer les types de stock à créer
            $storageTypes = ['general']; // Type par défaut pour tous les articles

            if ($article->type === 'produit') {
                // Si c'est un produit, ajouter les types spécifiques
                $storageTypes = ['magasin', 'commercial', 'production'];
            }else {
                return back()->with("error","impossible de creer se stock verifier si il sagit d'un produit ou d'une citerne");
            }

            foreach ($agencies as $agency) {
                foreach ($storageTypes as $type) {
                    // Vérifier si un stock pour cet article, cette agence et ce type existe déjà

                    $existingStock = Stock::where('article_id', $articleId)
                                          ->where('agency_id', $agency->id)
                                          ->where('storage_type', $type) // Vérifie aussi le type de stockage
                                          ->first();

                    if (!$existingStock) {
                        Stock::create([
                            'article_id' => $articleId,
                            'agency_id' => $agency->id,
                            'storage_type' => $type, // Utilise le type de stockage actuel
                            'quantity' => 0,
                            'theorical_quantity' => null, // Nouveau champ, défini à null
                            'citerne_id' => null,         // Nouveau champ, défini à null
                        ]);
                    }
                }
            }

            DB::commit(); // Valide la transaction

            return back()->with('info', 'Stocks initialisés avec succès pour l\'article et les agences de l\'entreprise.');

        } catch (\Exception $e) {
            DB::rollBack(); // Annule la transaction en cas d'erreur
            // Log l'erreur pour le débogage
            dd($e);
           return back()->with('error' , 'Erreur lors de l\'initialisation des stocks. Veuillez contacter l\'equipe technique.');
        }
    }
    
}