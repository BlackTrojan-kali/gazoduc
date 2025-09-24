<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Citerne; // New import for the Citerne model
use App\Models\Stock; // Your Stock model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // For transactions

class StockController extends Controller
{
    /**
     * Crée des entrées de stock initiales (quantité 0) pour un article
     * dans toutes les agences d'une entreprise spécifique.
     */
    public function createForArticle($idAr)
    {
        $articleId = $idAr;
        $entrepriseId = Auth::user()->entreprise_id;

        $article = Article::findOrFail($articleId);
        $agencies = Agency::where('entreprise_id', $entrepriseId)->get();

        if ($agencies->isEmpty()) {
            return back()->with('error' , 'Aucune agence trouvée pour cette entreprise.');
        }

        DB::beginTransaction(); // Démarre une transaction

        try {
            // Determine the product type to handle different stock creation logics
            if ($article->type === 'produit_petrolier') {
                foreach ($agencies as $agency) {
                    // Create 5 citernes for each agency
                    for ($i = 1; $i <= 5; $i++) {
                        $citerneName = 'cuve_' . strtolower(str_replace(' ', '_', $article->name)) . '_' . strtolower(str_replace(' ', '_', $agency->name)) . '_' . $i;
                        
                        // Check if a citerne with this name already exists
                        $existingCiterne = Citerne::where('name', $citerneName)
                                                  ->where('agency_id', $agency->id)
                                                  ->first();

                        if (!$existingCiterne) {
                            // Create the citerne
                            $citerne = Citerne::create([
                                'name' => $citerneName,
                                'current_product_id' => $articleId,
                                'agency_id' => $agency->id,
                                "capacity_liter"=>10000,
                                'entreprise_id' => $entrepriseId,
                                'type' => 'carburant', // Assuming type is 'carburant' for fuel products
                                'product_type' => 'produit_petrolier',
                            ]);

                            // Create a fixed stock for this new citerne
                            Stock::create([
                                'article_id' => $articleId,
                                'agency_id' => $agency->id,
                                'citerne_id' => $citerne->id,
                                'storage_type' => 'carburant',
                                'quantity' => 0,
                                'theorical_quantity' => null,
                            ]);
                        }
                    }
                }
            } else if ($article->type !== 'matiere_premiere') {
                // Logic for other non-raw-material products
                $storageTypes = ['magasin', 'commercial', 'production'];
                
                foreach ($agencies as $agency) {
                    foreach ($storageTypes as $type) {
                        $existingStock = Stock::where('article_id', $articleId)
                                              ->where('agency_id', $agency->id)
                                              ->where('storage_type', $type)
                                              ->first();

                        if (!$existingStock) {
                            Stock::create([
                                'article_id' => $articleId,
                                'agency_id' => $agency->id,
                                'storage_type' => $type,
                                'quantity' => 0,
                                'theorical_quantity' => null,
                                'citerne_id' => null,
                            ]);
                        }
                    }
                }
            } else {
                // For 'matiere_premiere', stock cannot be created
                return back()->with("error", "impossible de créer le stock, veuillez vérifier s'il s'agit d'un produit ou d'une citerne");
            }

            DB::commit(); // Valide la transaction

            return back()->with('info', 'Stocks initialisés avec succès pour l\'article et les agences de l\'entreprise.');

        } catch (\Exception $e) {
            DB::rollBack(); // Annule la transaction en cas d'erreur
            // Log the error for debugging
            dd($e);
            return back()->with('error' , 'Erreur lors de l\'initialisation des stocks. Veuillez contacter l\'équipe technique.');
        }
    }
}
