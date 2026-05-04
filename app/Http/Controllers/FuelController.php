<?php

namespace App\Http\Controllers;

use App\Exports\FuelSaleHistoryExport;
use App\Models\Agency;
use App\Models\Article;
use App\Models\ArticleCategoryPrice;
use App\Models\Citerne;
use App\Models\ClientCategory;
use App\Models\ReleveIndex; // 🟢 Le nouveau modèle remplace FuelSale
use App\Models\Pistolet; 
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
     * Enregistre un relevé d'index (Clôture de quart)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pistolet_id'     => 'required|exists:pistolets,id',
            'user_id'         => 'required|exists:users,id',
            'index_fermeture' => 'required|numeric|min:0',
            'volume_test'     => 'nullable|numeric|min:0', 
        ]);
        try {
            DB::beginTransaction();

            // 1️⃣ Récupération de l'infrastructure
            $pistolet = Pistolet::with(['citerne.stock', 'citerne.article', 'pompe'])->findOrFail($validated['pistolet_id']);
            $citerne  = $pistolet->citerne;
            $article  = $citerne->article ?? null;
            
            if (!$citerne || !$article) {
                throw ValidationException::withMessages(['pistolet_id' => "Ce pistolet n'est relié à aucune cuve ou produit valide."]);
            }

            // 2️⃣ Calcul du Volume Net Vendu
            $indexOuverture = $pistolet->current_index;
            $indexFermeture = $validated['index_fermeture'];
            $volumeTest     = $validated['volume_test'] ?? 0;
        
            // Gestion du Rollover (Remise à zéro du compteur mécanique)
            $volumeBrut = $indexFermeture - $indexOuverture;
            if ($volumeBrut < 0) {
                $volumeBrut = (9999999 - $indexOuverture) + $indexFermeture; 
            }

            $volumeVendu = $volumeBrut - $volumeTest;
            
            if ($volumeVendu <= 0) {
                throw ValidationException::withMessages(['index_fermeture' => "L'index de fermeture est incohérent. Le volume net doit être positif."]);
            }
            $category= ClientCategory::where("name","Comptoir")->first();
        
            $unitPrice =  ArticleCategoryPrice::where("article_id",$article->id)->where("client_category_id",$category->id)->first();
           
            // 3️⃣ Prix et Montant
            $unitPrice = $unitPrice->price ?? 0;

            if ($unitPrice <= 0) {
                throw ValidationException::withMessages(['pistolet_id' => "Aucun prix de vente n'est défini pour le carburant contenu dans cette cuve."]);
            }

            $montantTotal = $volumeVendu * $unitPrice;

            // 4️⃣ Déduction du Stock
            $stock = $citerne->stock;
            if (!$stock || $stock->quantity < $volumeVendu) {
                throw ValidationException::withMessages([
                    'index_fermeture' => "Stock insuffisant dans la cuve '{$citerne->name}' pour couvrir cette sortie de {$volumeVendu} L."
                ]);
            }

            $isIotManaged = !empty($citerne->sensor_token); 
            if (!$isIotManaged) {
                $stock->quantity -= $volumeVendu;
                $stock->theorical_quantity -= $volumeVendu;
                $stock->save(); 
            }

            // 5️⃣ Création du Relevé d'Index 🟢
            ReleveIndex::create([
                'pistolet_id'     => $pistolet->id,
                'agency_id'       => Auth::user()->agency_id,
                'user_id'         => $validated['user_id'],
                'index_ouverture' => $indexOuverture,
                'index_fermeture' => $indexFermeture,
                'volume_test'     => $volumeTest,
                'volume_vendu'    => $volumeVendu,
                'prix_unitaire'   => $unitPrice,
                'montant_total'   => $montantTotal,
                'date_saisie'     => now(),
                'status'          => 'valide',
            ]);

            // 6️⃣ Sauvegarde du nouvel index pour le quart suivant
            $pistolet->update(['current_index' => $indexFermeture]);

            DB::commit();

            return redirect()->back()->with('success', 'Relevé d\'index enregistré et stock mis à jour.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => "Erreur : " . $e->getMessage()]);
        }
    }
    
    /**
     * Historique des Relevés d'Index
     */
    public function history(Request $request)
    {
        // 🟢 On charge la chaîne complète pour atteindre l'article via le pistolet
        $relations = ['user', 'agency', 'pistolet.pompe', 'pistolet.citerne.article'];
        
        $query = ReleveIndex::with($relations);

        if (Auth::user()->role->name !== "direction") {
            $query->where("agency_id", Auth::user()->agency_id);
            $agencies = Agency::where("id", Auth::user()->agency_id)->get();
        } else {
            $agencies = Agency::all(); 
        }

        // On garde la variable $fuelSales pour ne pas casser la prop React
        $fuelSales = $query->orderByDesc('created_at')->paginate(350);
        $articles = Article::where("type", "produit_petrolier")->get();
        
        return Inertia::render("Fuel/FuelSaleHistory", compact("fuelSales", "articles", "agencies"));
    }

    /**
     * Suppression (Annulation) d'un Relevé d'Index
     */
    public function delete(Request $request, $idReleve)
    {
        $releve = ReleveIndex::with('pistolet.citerne.stock')->where("id", $idReleve)->first();

        if (!$releve) {
            return back()->withErrors(['error' => "Relevé introuvable."]);
        }

        try {
            DB::beginTransaction();

            $pistolet = $releve->pistolet;
            $citerneCible = $pistolet->citerne ?? null;

            // Rétablissement du stock avec le champ 'volume_vendu' 🟢
            if ($citerneCible && $citerneCible->stock) {
                $stock = $citerneCible->stock;
                $stock->quantity += $releve->volume_vendu;
                $stock->theorical_quantity += $releve->volume_vendu;
                $stock->save();
            }

            // Rembobinage de l'index si c'est le dernier enregistré
            if ($pistolet && $pistolet->current_index == $releve->index_fermeture) {
                $pistolet->update(['current_index' => $releve->index_ouverture]);
            }

            $releve->delete();

            DB::commit();

            return back()->with("success", "Relevé annulé. {$releve->volume_vendu} litres rétablis dans la cuve " . ($citerneCible->name ?? ''));
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => "Erreur lors de l'annulation : " . $e->getMessage()]);
        }
    }

    /**
     * Exportation PDF
     */
    public function export(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'agency_id'  => 'nullable|exists:agencies,id',
            'article_id' => 'nullable|exists:articles,id',
        ]);

        $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->input('end_date'))->endOfDay();

        $query = ReleveIndex::with(['agency', 'user', 'pistolet.pompe', 'pistolet.citerne.article'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->filled('agency_id')) {
            $query->where('agency_id', $request->input('agency_id'));
        }

        // 🟢 Filtrage complexe : ReleveIndex n'a pas d'article_id, il faut chercher via le pistolet -> citerne
        if ($request->filled('article_id')) {
            $articleId = $request->input('article_id');
            $query->whereHas('pistolet.citerne', function ($q) use ($articleId) {
                $q->where('current_product_id', $articleId);
            });
        }

        $sales = $query->orderBy('created_at', 'asc')->get();

        $reportTitle = 'Rapport de Saisie des Index et Ventes';
        $period = "Du " . $startDate->format('d/m/Y') . " au " . $endDate->format('d/m/Y');

        $agencyName = $request->filled('agency_id') && $sales->isNotEmpty() ? $sales->first()->agency->name : 'Toutes les stations';
        
        // Pour afficher le nom de l'article dans l'en-tête du PDF
        $articleName = 'Tous les carburants';
        if ($request->filled('article_id')) {
            $article = Article::find($request->input('article_id'));
            $articleName = $article ? $article->name : 'Inconnu';
        }

        $pdf = Pdf::loadView('PDF.fuel_sales_pdf', [
            'sales'       => $sales,
            'reportTitle' => $reportTitle,
            'period'      => $period,
            'filters'     => ['agency_name' => $agencyName, 'article_name' => $articleName],
        ])->setPaper('a4', 'landscape'); 

        $fileName = sprintf('index_carburant_%s_%s.pdf', $startDate->format('Ymd'), $endDate->format('Ymd'));
        return $pdf->download($fileName);
    }

    /**
     * Exportation Excel
     */
    public function exportExcel(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'agency_id'  => 'nullable|exists:agencies,id',
            'article_id' => 'nullable|exists:articles,id',
        ]);

        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'));
        
        $fileNameBase = 'index_carburant_' . $startDate->format('Ymd') . '_' . $endDate->format('Ymd');
        
        return Excel::download(
            new FuelSaleHistoryExport(
                $startDate->toDateString(), 
                $endDate->toDateString(),
                $request->input('agency_id'),
                $request->input('article_id'),
                'Rapport de Saisie des Index' 
            ),
            $fileNameBase . '.xlsx'
        );
    }
}