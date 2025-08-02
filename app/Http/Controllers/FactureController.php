<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    //
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
}
