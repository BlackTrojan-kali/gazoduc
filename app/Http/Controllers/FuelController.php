<?php

namespace App\Http\Controllers;

use App\Exports\FuelSaleHistoryExport;
use App\Models\Agency;
use App\Models\Article;
use App\Models\ArticleCategoryPrice;
use App\Models\Citerne;
use App\Models\Client;
use App\Models\FuelSale;
use App\Models\Pompe;
use App\Models\Stock;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class FuelController extends Controller
{
 
    /**
     * Enregistre une vente de carburant (avec tarification dynamique selon la catégorie client)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pompe_id'   => 'required|exists:pompes,id',
            'agency_id'  => 'required|exists:agencies,id',
            'article_id' => 'required|exists:articles,id',
            'client_id'  => 'required|exists:clients,id',
            'quantity'   => 'required|numeric|min:0.01',
            'user_id'    => 'required|exists:users,id',
        ]);

        try {
            DB::beginTransaction();

            // 1️⃣ Récupération des entités de base
            $pompe   = Pompe::with('cuves.stock')->findOrFail($validated['pompe_id']);
            $article = Article::findOrFail($validated['article_id']);
            $client  = Client::with('category')->findOrFail($validated['client_id']);
            $quantiteDemandee = $validated['quantity'];

            // 2️⃣ Vérifier les cuves reliées à la pompe
            if ($pompe->cuves->isEmpty()) {
                throw ValidationException::withMessages([
                    'pompe_id' => "Cette pompe n’est reliée à aucune cuve. Impossible d’effectuer la vente.",
                ]);
            }

            // 3️⃣ Filtrer les cuves contenant le bon produit
            $citernesCompatibles = $pompe->cuves->filter(function ($citerne) use ($article) {
                return $citerne->current_product_id == $article->id;
            });

            if ($citernesCompatibles->isEmpty()) {
                throw ValidationException::withMessages([
                    'article_id' => "Aucune cuve reliée à cette pompe ne contient le produit sélectionné.",
                ]);
            }

            // 4️⃣ Trouver le prix applicable à cette catégorie de client dans cette agence
            $prixPersonnalise = ArticleCategoryPrice::where('article_id', $article->id)
                ->where('client_category_id', $client->client_category_id)
                ->where('agency_id', $request->agency_id)
                ->first();
            $unitPrice = $prixPersonnalise
                ? $prixPersonnalise->price
                : ($article->unit_price ?? 0);

            if ($unitPrice <= 0) {
                throw ValidationException::withMessages([
                    'article_id' => "Aucun prix défini pour ce produit dans cette agence et cette catégorie de client.",
                ]);
            }

            // 5️⃣ Déduire la quantité demandée depuis les cuves reliées
            $quantiteRestante = $quantiteDemandee;
            $cuvesUtilisees = [];

            foreach ($citernesCompatibles as $citerne) {
                $stock = $citerne->stock;
                if (!$stock || $stock->quantity <= 0) continue;

                if ($stock->quantity >= $quantiteRestante) {
                    // Suffisant : on déduit et sort de la boucle
                    $stock->quantity -= $quantiteRestante;
                    $stock->theorical_quantity = $stock->quantity;
                    $stock->save();

                    $cuvesUtilisees[] = [
                        'citerne_id' => $citerne->id,
                        'quantite_tiree' => $quantiteRestante,
                    ];

                    $quantiteRestante = 0;
                    break;
                } else {
                    // Pas assez, on vide cette citerne et on continue
                    $cuvesUtilisees[] = [
                        'citerne_id' => $citerne->id,
                        'quantite_tiree' => $stock->quantity,
                    ];

                    $quantiteRestante -= $stock->quantity;
                    $stock->quantity = 0;
                    $stock->save();
                }
            }

            // 6️⃣ Vérification finale du stock
            if ($quantiteRestante > 0) {
                throw ValidationException::withMessages([
                    'quantity' => "Stock insuffisant dans les cuves reliées à cette pompe pour cette quantité.",
                ]);
            }

            // 7️⃣ Création de la vente
            $fuelSale = FuelSale::create([
                'pompe_id'    => $validated['pompe_id'],
                'agency_id'   => $validated['agency_id'],
                'article_id'  => $validated['article_id'],
                'user_id'     => $validated['user_id'],
                'client_id'   => $validated['client_id'],
                'quantity'    => $quantiteDemandee,
                'unitPrice'  => $unitPrice,
                'sub_total'   => $unitPrice * $quantiteDemandee,
                'total_price' => $unitPrice * $quantiteDemandee,
                'status'      => 'VALIDATED',
            ]);

            // 8️⃣ (Optionnel) Sauvegarder les cuves utilisées pour traçabilité
            // if (!empty($cuvesUtilisees)) {
            //     foreach ($cuvesUtilisees as $entry) {
            //         DB::table('fuel_sale_citerne')->insert([
            //             'fuel_sale_id' => $fuelSale->id,
            //             'citerne_id'   => $entry['citerne_id'],
            //             'quantite'     => $entry['quantite_tiree'],
            //             'created_at'   => now(),
            //         ]);
            //     }
            // }

            DB::commit();

            return redirect()->back()->with('success', 'Vente enregistrée avec succès et stock mis à jour.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => "Erreur lors de l’enregistrement de la vente : " . $e->getMessage()
            ]);
        }
    }


    public function history(Request $request){
        $fuelSales = FuelSale::with("article","user","agency","pompe","client")->paginate(350);
  
        $articles = Article::where("type","produit_petrolier")->get();
        $agencies = Agency::all(); 
        if(Auth::user()->role->name !== "direction"){
            $agencies= Agency::where("id",Auth::user()->agency_id)->get();
            $fuelSales = FuelSale::where("agency_id",Auth::user()->agency_id)->with("article","user","agency","client","pompe")->paginate(350);
        
        }
        
        return Inertia("Fuel/FuelSaleHistory",compact("fuelSales","articles","agencies"));
    }
    // app/Http/Controllers/FuelSaleController.php (Exemple)

public function delete(Request $request, $idFuelSale)
    {
        // 1. Récupérer la vente
        $fuelSale = FuelSale::with('article', 'pompe.cuves.stock')
                            ->where("id", $idFuelSale)
                            ->first();

        if (!$fuelSale) {
            return back()->withErrors(['error' => "Vente de carburant non trouvée."]);
        }

        $quantiteVendue = $fuelSale->quantity;
        $articleId = $fuelSale->article_id;
        $pompe = $fuelSale->pompe;

        try {
            DB::beginTransaction();

            // 2. Trouver les citernes compatibles (contenant le même article)
            $citernesCompatibles = $pompe->cuves->filter(function ($citerne) use ($articleId) {
                return $citerne->current_product_id == $articleId;
            });

            if ($citernesCompatibles->isEmpty()) {
                // Si aucune citerne compatible n'est trouvée, on supprime juste la vente
                // et loggue l'anomalie si besoin, car le stock n'est pas traçable
                $fuelSale->delete();
                DB::commit();
                return back()->with("warning", "Vente de carburant supprimée. ATTENTION: Stock de cuve non rétabli (aucune cuve compatible trouvée).");
            }

            // 3. Identifier la citerne où remettre le stock
            // Stratégie simple : prendre la citerne compatible avec le plus de stock actuel (ou la première)
            $citerneCible = $citernesCompatibles
                ->sortByDesc(fn($c) => optional($c->stock)->quantity ?? 0)
                ->first();

            // S'assurer que la citerne cible a une entrée de stock
            $stock = $citerneCible->stock ?? $citerneCible->stock()->firstOrCreate([
                'article_id' => $articleId,
                'agency_id' => $fuelSale->agency_id,
            ]);

            // 4. Rétablir la quantité dans la citerne cible
            $stock->quantity += $quantiteVendue;
            $stock->theorical_quantity = $stock->quantity; // Mettre à jour le stock théorique
            $stock->save();
            
            // 5. Supprimer la vente
            $fuelSale->delete();

            DB::commit();

            return back()->with("success", "Vente de carburant supprimée et **{$quantiteVendue} litres** rétablis dans la citerne.");
        } catch (\Exception $e) {
            DB::rollBack();
            // Gérer l'exception, par exemple pour un problème de base de données
            return back()->withErrors([
                'error' => "Erreur lors de la suppression et du rétablissement du stock : " . $e->getMessage()
            ]);
        }
    }
public function export(Request $request)
{
    // 1. Validation des données d'entrée
    $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'agency_id' => 'nullable|exists:agencies,id',
        'article_id' => 'nullable|exists:articles,id',
    ]);

    // 2. Préparation des dates
    $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
    $endDate = Carbon::parse($request->input('end_date'))->endOfDay();

    // 3. Requête avec filtres dynamiques
    $sales = FuelSale::with(['agency', 'article', 'client', 'user'])
        ->whereBetween('created_at', [$startDate, $endDate])
        ->when($request->filled('agency_id'), fn($query) => 
            $query->where('agency_id', $request->input('agency_id'))
        )
        ->when($request->filled('article_id'), fn($query) => 
            $query->where('article_id', $request->input('article_id'))
        )
        ->orderBy('created_at', 'asc')
        ->get();

    // 4. Détermination du titre et de la période
    $reportTitle = 'Rapport de Ventes de Carburant';
    $period = "Du " . $startDate->format('d/m/Y') . " au " . $endDate->format('d/m/Y');

    // 5. Détermination sécurisée des filtres affichés
    $agencyName = 'Toutes les agences';
    $articleName = 'Tous les articles';

    if ($request->filled('agency_id') && $sales->isNotEmpty()) {
        $agencyName = optional($sales->first()->agency)->name ?? 'Inconnue';
    }

    if ($request->filled('article_id') && $sales->isNotEmpty()) {
        $articleName = optional($sales->first()->article)->name ?? 'Inconnu';
    }

    // 6. Génération du PDF
    $pdf = Pdf::loadView('PDF.fuel_sales_pdf', [
        'sales' => $sales,
        'reportTitle' => $reportTitle,
        'period' => $period,
        'filters' => [
            'agency_name' => $agencyName,
            'article_name' => $articleName,
        ],
    ])->setPaper('a4', 'landscape'); // Optionnel : format horizontal pour tableaux larges

    // 7. Nom du fichier exporté
    $fileName = sprintf(
        'ventes_carburant_%s_%s.pdf',
        $startDate->format('Ymd'),
        $endDate->format('Ymd')
    );

    // 8. Téléchargement
    return $pdf->download($fileName);
}
public function exportExcel(Request $request)
    {
        // 1. Validation des données de base
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'agency_id' => 'nullable|exists:agencies,id',
            'article_id' => 'nullable|exists:articles,id',
        ]);

        // 2. Préparation des variables de filtre (utiliser toDateString car la classe Export le convertit en Carbon)
        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'));
        $agencyId = $request->input('agency_id');
        $articleId = $request->input('article_id');

        // 3. Définition du titre
        $reportTitle = 'Rapport de Ventes de Carburant';
        $fileNameBase = 'ventes_carburant_' . $startDate->format('Ymd') . '_' . $endDate->format('Ymd');
        
        // 4. EXPORTATION EXCEL
        // La classe FuelSaleHistoryExport gère la récupération et le filtrage des données.
        return Excel::download(
            new FuelSaleHistoryExport(
                $startDate->toDateString(), 
                $endDate->toDateString(),
                $agencyId,
                $articleId,
                $reportTitle 
            ),
            $fileNameBase . '.xlsx'
        );
    }
}
