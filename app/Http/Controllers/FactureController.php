<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\City;
use App\Models\Client;
use App\Models\Entreprise;
use App\Models\Facture;
use App\Models\FactureItem;
use App\Models\Mouvement;
use App\Models\Stock;
use App\Services\ManualCsphService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FactureController extends Controller
{
    /**
     * VUE DES ARTICLES VENDUS (AVEC FILTRES BACKEND)
     */
    public function sales(Request $request)
    {
        $user = Auth::user();
        $query = FactureItem::with(['facture.agency', 'article']);

        // Sécurité : Un utilisateur normal ne voit que les factures de son agence
        if ($user && $user->role->name !== 'direction') {
            $query->whereHas('facture', function ($q) use ($user) {
                $q->where('agency_id', $user->agency_id);
            });
        }

        // --- APPLICATION DES FILTRES ---
        if ($request->filled('selectedArticle')) {
            $query->whereHas('article', function ($q) use ($request) { 
                $q->where('name', $request->selectedArticle); 
            });
        }
        if ($request->filled('selectedAgency')) {
            $query->whereHas('facture.agency', function ($q) use ($request) { 
                $q->where('name', $request->selectedAgency); 
            });
        }
        if ($request->filled('startDate')) {
            $query->whereHas('facture', function ($q) use ($request) { 
                $q->whereDate('created_at', '>=', $request->startDate); 
            });
        }
        if ($request->filled('endDate')) {
            $query->whereHas('facture', function ($q) use ($request) { 
                $q->whereDate('created_at', '<=', $request->endDate); 
            });
        }

        // On paginate ET on garde les filtres dans l'URL pour les boutons Suivant/Précédent
        // Ajout d'un tri par date décroissante pour voir les plus récents en premier
        $factureItems = $query->orderBy('id', 'desc')->paginate(100)->withQueryString();
        
        $articles = Article::where('entreprise_id', $user->entreprise_id)->get();
        $agencies = $user->role->name === 'direction' 
            ? Agency::where('entreprise_id', $user->entreprise_id)->get() 
            : Agency::where("id", $user->agency_id)->get();
            
        // On renvoie les filtres actuels pour que React garde les inputs remplis
        $filters = $request->only(['selectedArticle', 'selectedAgency', 'startDate', 'endDate']);

        return inertia("Commercial/ComItems", compact("factureItems", "agencies", "articles", "filters"));
    }

    /**
     * EXPORT PDF DES ARTICLES VENDUS (AVEC LES MÊMES FILTRES)
     */
    public function exportItemPdf(Request $request)
    {
        $user = Auth::user();
        $filters = $request->only(['selectedArticle', 'selectedAgency', 'startDate', 'endDate']);
        
        $query = FactureItem::with(['facture.agency', 'article']);

        // Sécurité identique
        if ($user && $user->role->name !== 'direction') {
            $query->whereHas('facture', function ($q) use ($user) {
                $q->where('agency_id', $user->agency_id);
            });
        }

        // Application des mêmes filtres
        if (!empty($filters['selectedArticle'])) {
            $query->whereHas('article', function ($q) use ($filters) { $q->where('name', $filters['selectedArticle']); });
        }
        if (!empty($filters['selectedAgency'])) {
            $query->whereHas('facture.agency', function ($q) use ($filters) { $q->where('name', $filters['selectedAgency']); });
        }
        if (!empty($filters['startDate'])) {
            $query->whereHas('facture', function ($q) use ($filters) { $q->whereDate('created_at', '>=', $filters['startDate']); });
        }
        if (!empty($filters['endDate'])) {
            $query->whereHas('facture', function ($q) use ($filters) { $q->whereDate('created_at', '<=', $filters['endDate']); });
        }

        // On récupère TOUS les résultats correspondants (sans pagination) pour le rapport PDF
        $items = $query->orderBy('id', 'desc')->get();
        
        $pdf = Pdf::loadView('PDF.itemPDFView', ['items' => $items, 'filters' => $filters]);
        
        $dateStr = Carbon::now()->format('d-m-Y_H-i');
        return $pdf->download('rapport_articles_vendus_' . $dateStr . '.pdf');
    }

    // =========================================================================
    // VOS AUTRES METHODES INTACTES (printFacture, delete, exportPdf, csphIndex, exportCsphPdf...)
    // =========================================================================
    
    public function printFacture(Facture $facture)
    {
        $facture->load('client', 'items.article', 'user', 'agency');
        $entreprise = Entreprise::where("id",Auth::user()->entreprise_id)->first();
        $pdf = Pdf::loadView('factures.FactureClient', compact('facture',"entreprise"));
        return $pdf->download('facture-' . $facture->id . '.pdf');
    }

    public function delete($idFac, $licence)
    {
        if ($licence == "gaz") {
            $facture_a_supprimer = Facture::findOrFail($idFac); 
            $facture_a_supprimer->delete();
            return back()->with("warning", "facture supprimee avec success");
        } else {
            $facture = Facture::where("id", $idFac)->with("mouvement.article")->first();
            if ($facture->invoice_type == "vente") {
                foreach ($facture->mouvement as $move) {
                    $stock = Stock::where("article_id", $move->article_id)
                                  ->where("agency_id", Auth::user()->agency_id)
                                  ->where("storage_type", Auth::user()->role->name)->first();
                    if ($stock) {
                        $stock->quantity += intval($move->quantity);
                        if ($move->article->type == "produit_fini") {
                            $parent_stock = Stock::where('article_id', $move->article->article_id)
                                                 ->where("agency_id", Auth::user()->agency_id)
                                                 ->where("storage_type", Auth::user()->role->name)->first();
                            if ($parent_stock) {
                                $parent_stock->quantity -= intval($move->quantity); 
                                $parent_stock->save();
                            }
                        }
                        $stock->save();
                    }
                }
                $facture->delete();
                return back()->with("success", "Facture supprimee et stocks mis a jour avec success.");
            } else {
                foreach ($facture->mouvement as $move) {
                    $stock = Stock::where("article_id", $move->article_id)
                                  ->where("agency_id", Auth::user()->agency_id)
                                  ->where("storage_type", Auth::user()->role->name)->first();
                    if ($stock) {
                        $stock->quantity += intval($move->quantity);
                        $stock->save();
                    }
                }
                $facture->delete();
                return back()->with("success", "Facture supprimee et stocks mis a jour avec success.");
            }
        }
    }

    public function exportPdf(Request $request)
    {
        $clientId = $request->input('client_id');
        $agencyId = $request->input('agency_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $query = Facture::with(['client', 'agency',"items.article"]);
        if ($clientId && $clientId !== 'all') { $query->where('client_id', $clientId); }
        if ($agencyId && $agencyId !== 'all') { $query->where('agency_id', $agencyId); }
        if ($startDate) { $query->where('created_at', '>=', Carbon::parse($startDate)->startOfDay()); }
        if ($endDate) { $query->where('created_at', '<=', Carbon::parse($endDate)->endOfDay()); }
        
        $sales = $query->get();
        $clients = Client::all();
        $agencies = Agency::all();
        $pdf = Pdf::loadView('PDF.SalesHistPDFView', compact('sales', 'clients', 'agencies', 'clientId', 'agencyId', 'startDate', 'endDate'));
        return $pdf->download('rapport_ventes_' . Carbon::now()->format('Y-m-d_H-i-s') . '.pdf');
    }

    /********************************************************************************** */
    /*|                      MODULE DE DECLARATION CSPH (GAZ)                       | */
    /********************************************************************************** */

   /********************************************************************************** */
    /*|                      MODULE DE DECLARATION CSPH (GAZ)                       | */
    /********************************************************************************** */

    /**
     * Affiche la page de déclaration mensuelle sur React.
     */
    public function csphIndex(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        $reportData = $this->generateCsphData($startDate, $endDate);
        
        // NOUVEAU : On récupère toutes les villes et leurs taux pour la saisie manuelle
        $cities = City::orderBy('name')->get(['id', 'name', 'transport_cost_per_tonne']);

        return Inertia("Direction/CsphDeclaration", [
            'reportData' => $reportData['lignes'],
            'grandTotal' => $reportData['grandTotal'],
            'totalTonnes' => $reportData['totalTonnes'],
            'startDate' => $startDate,
            'endDate' => $endDate,
            'cities' => $cities // On envoie les villes au Frontend
        ]);
    }

    /**
     * Reçoit les données saisies manuellement depuis React et génère le PDF.
     */
    public function exportManualPdf(Request $request, ManualCsphService $manualService)
    {
        $request->validate([
            'periode' => 'required|string',
            'lignes' => 'required|array|min:1',
            'lignes.*.ville' => 'required|string',
            'lignes.*.quantite' => 'required|numeric|min:0.0001',
            'lignes.*.taux' => 'required|numeric', 
        ]);

        $periode = $request->input('periode');
        $lignesBrutes = $request->input('lignes');

        $reportData = $manualService->processManualData($lignesBrutes);

        $pdf = Pdf::loadView('pdfs.csph_manual_declaration', [
            'lignes' => $reportData['lignes'],
            'grandTotal' => $reportData['grandTotal'],
            'totalTonnes' => $reportData['totalTonnes'],
            'periode' => strtoupper($periode)
        ]);

        return $pdf->download("Declaration_CSPH_Manuelle.pdf");
    }
    public function exportCsphPdf(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
        
        $reportData = $this->generateCsphData($startDate, $endDate);
        
        // Formatage des dates pour le titre du PDF
        $dateStr = "DU " . Carbon::parse($startDate)->format('d/m/Y') . " AU " . Carbon::parse($endDate)->format('d/m/Y');

        $pdf = Pdf::loadView('pdfs.csph_declaration', [
            'lignes' => $reportData['lignes'],
            'grandTotal' => $reportData['grandTotal'],
            'totalTonnes' => $reportData['totalTonnes'],
            'periode' => $dateStr
        ]);

        return $pdf->download("Declaration_CSPH_{$startDate}_au_{$endDate}.pdf");
    }

    private function generateCsphData($startDate, $endDate)
    {
        // 1. Filtrage par PÉRIODE et correction du problème NULL en base de données
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $factureItems = FactureItem::whereHas('facture', function ($q) use ($start, $end) {
            $q->whereBetween('created_at', [$start, $end])
              ->where('archived', false) 
              ->where('invoice_type', 'vente') 
              ->where(function($subQ) {
                  // CORRECTION ICI : On prend 'gaz' OU si c'est NULL (car votre BDD a des NULL)
                  $subQ->where('licence', 'gaz')->orWhereNull('licence'); 
              });
        })->with(['facture.agency.city', 'article'])->get();

        $groupedData = [];
        $grandTotal = 0;
        $totalTonnes = 0;

        foreach ($factureItems as $item) {
            $article = $item->article;
            $weightInKg = (float) ($article->weight_per_unit ?? 0);

            // Ignorer les articles qui n'ont pas de poids (ils ne sont pas soumis à la CSPH)
            if ($weightInKg <= 0) continue; 

            $agency = $item->facture->agency;
            $city = $agency ? $agency->city : null;
            
            $cityName = $city ? strtoupper($city->name) : 'INCONNUE';
            $taux = $city ? (float) $city->transport_cost_per_tonne : 0;

            // Calculs
            $tonnes = ($item->quantity * $weightInKg) / 1000;
            $totalLigne = round($tonnes * $taux);

            $isVrac = stripos($article->name, 'vrac') !== false || $article->type === 'matiere_premiere';
            $typeGaz = $isVrac ? 'Vrac' : 'Conditionné';
            
            $source = 'Ex - SCDP'; 
            
            $groupKey = $cityName . '_' . $source . '_' . $typeGaz;

            if (!isset($groupedData[$groupKey])) {
                $groupedData[$groupKey] = [
                    'ville' => $cityName,
                    'source' => $source,
                    'type' => $typeGaz,
                    'quantite' => 0,
                    'taux' => $taux,
                    'total' => 0
                ];
            }

            $groupedData[$groupKey]['quantite'] += $tonnes;
            $groupedData[$groupKey]['total'] += $totalLigne;
            
            $grandTotal += $totalLigne;
            $totalTonnes += $tonnes;
        }

        $lignesTriees = collect($groupedData)->sortBy('ville')->values()->toArray();

        return [
            'lignes' => $lignesTriees,
            'grandTotal' => $grandTotal,
            'totalTonnes' => $totalTonnes
        ];
    }

    
}