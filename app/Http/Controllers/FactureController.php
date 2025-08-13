<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Client;
use App\Models\Facture;
use App\Models\FactureItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FactureController extends Controller
{
    //
     public function sales()
    {
        // 1. Récupérer l'utilisateur actuellement authentifié
        $user = Auth::user();

        // 2. Définir une requête de base pour les FactureItems en chargeant les relations
        $query = FactureItem::with(['facture.agency', 'article']);

        // 3. Appliquer le filtre de l'agence si l'utilisateur n'est pas "direction"
        if ($user && $user->role->name !== 'direction') {
            // Utilise whereHas pour filtrer les items dont la facture appartient à l'agence de l'utilisateur
            $query->whereHas('facture', function ($q) use ($user) {
                $q->where('agency_id', $user->agency_id);
            });
            $agencies = Agency::all();
        }
        
        // 4. Exécuter la requête et récupérer les résultats
        $factureItems = $query->paginate(100);
        $articles = Article::all();
        $agencies = Agency::where("id",Auth::user()->agency_id)->get();
        // 5. Retourner les données en format JSON
        return inertia("Commercial/ComItems",compact("factureItems","agencies","articles"));
    }
      public function printFacture(Facture $facture)
    {
        // Charge les relations nécessaires pour la facture
        $facture->load('client', 'items.article', 'user', 'agency');

        // Crée une instance de Dompdf en lui passant la vue et les données
        $pdf = Pdf::loadView('factures.FactureClient', compact('facture'));

        // Télécharge le fichier PDF avec un nom spécifique
        return $pdf->download('facture-' . $facture->id . '.pdf');
    }
    public function delete($idFac){
        $idFac = Facture::findOrFail($idFac);
        $idFac->delete();
        return back()->with("warning","facture supprimee avec success");
    }
     public function exportPdf(Request $request)
    {
        // 1. Récupération des paramètres de filtre depuis la requête
        $clientId = $request->input('client_id');
        $agencyId = $request->input('agency_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // 2. Création d'une requête de base pour les ventes
        $query = Facture::with(['client', 'agency',"items.article"]);

        // 3. Application des filtres si les paramètres existent
        if ($clientId && $clientId !== 'all') {
            $query->where('client_id', $clientId);
        }

        if ($agencyId && $agencyId !== 'all') {
            $query->where('agency_id', $agencyId);
        }

        if ($startDate) {
            $query->where('created_at', '>=', Carbon::parse($startDate)->startOfDay());
        }

        if ($endDate) {
            $query->where('created_at', '<=', Carbon::parse($endDate)->endOfDay());
        }
        
        // 4. Exécution de la requête et récupération des données
        $sales = $query->get();
        $clients = Client::all();
        $agencies = Agency::all();

        // 5. Génération du PDF à partir de la vue Blade 'sales_report'
        $pdf = PDF::loadView('PDF.SalesHistPDFView', compact('sales', 'clients', 'agencies', 'clientId', 'agencyId', 'startDate', 'endDate'));

        // 6. Retourne le PDF en tant que téléchargement
        $filename = 'rapport_ventes_' . Carbon::now()->format('Y-m-d_H-i-s') . '.pdf';
        return $pdf->download($filename);
    }
     public function exportItemPdf(Request $request)
    {
        // 1. Récupération des filtres de la requête
        $filters = $request->only(['selectedArticle', 'selectedAgency', 'startDate', 'endDate']);

        // 2. Requête pour filtrer les données
        $query = FactureItem::with(['facture.agency', 'article']);

        if ($filters['selectedArticle']) {
            $query->whereHas('article', function ($q) use ($filters) {
                $q->where('name', $filters['selectedArticle']);
            });
        }

        if ($filters['selectedAgency']) {
            $query->whereHas('facture.agency', function ($q) use ($filters) {
                $q->where('name', $filters['selectedAgency']);
            });
        }

        if ($filters['startDate']) {
            $query->whereHas('facture', function ($q) use ($filters) {
                $q->whereDate('created_at', '>=', $filters['startDate']);
            });
        }

        if ($filters['endDate']) {
            $query->whereHas('facture', function ($q) use ($filters) {
                $q->whereDate('created_at', '<=', $filters['endDate']);
            });
        }

        $items = $query->get();

        // 3. Génération du PDF
        $pdf = PDF::loadView('PDF.itemPDFView', [
            'items' => $items,
            'filters' => $filters,
        ]);

        // 4. Retourne le PDF en tant que téléchargement
        return $pdf->download('articles-vendus.pdf');
    }
}
