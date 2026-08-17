<?php

namespace App\Exports;

use App\Models\ProductionHistory;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery; // <-- Changement pour la performance
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\ShouldAutoSize; // <-- Pour des colonnes jolies

class ProductionHistoryExcelExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    use Exportable;

    protected $query;

    /**
     * On injecte directement le Query Builder préparé dans le contrôleur.
     * C'est beaucoup plus léger et évite de dupliquer la logique de filtrage.
     * * @param \Illuminate\Database\Eloquent\Builder $query
     */
    public function __construct($query)
    {
        $this->query = $query;
    }

    /**
     * Retourne la requête pour que Laravel Excel gère le "chunking" (traitement par lots).
     */
    public function query()
    {
        return $this->query;
    }

    /**
     * En-têtes du fichier Excel.
     */
    public function headings(): array
    {
        return [
            'ID',
            'Date & Heure',
            'Source (Vrac)',      // Citerne ou Camion
            'Produit Fini',       // Article
            'Quantité (Unités)',
            'Poids Total (Kg)',   // Ajouté car important pour la compta matière
            'Agence',
            'Opérateur',
            'Statut'              // Pour voir si c'est supprimé (SoftDeleted)
        ];
    }

    /**
     * Mappage des données pour chaque ligne.
     * C'est ici qu'on gère la logique d'affichage (Fixe vs Mobile).
     */
    public function map($move): array
    {
        // 1. Détermination de la Source (Citerne ou Véhicule)
        $sourceName = 'N/A';
        
        if ($move->source_citerne_id && $move->citerne) {
            $sourceName = "[Citerne] " . $move->citerne->name;
        } elseif ($move->vehicle_id && $move->vehicle) {
            $sourceName = "[Camion] " . $move->vehicle->licence_plate;
        }

        // 2. Nom de l'opérateur complet
        $userName = $move->user 
            ? $move->user->last_name . ' ' . $move->user->first_name 
            : 'Inconnu';

        // 3. Statut (Actif ou Supprimé)
        $status = $move->deleted_at ? 'SUPPRIMÉ' : 'Valide';

        return [
            $move->id,
            Carbon::parse($move->created_at)->format('d/m/Y H:i'),
            $sourceName,
            $move->article->name ?? 'Article supprimé',
            $move->quantity_produced,
            $move->total_weight_produced, // Poids total consommé
            $move->agency->name ?? 'N/A',
            $userName,
            $status
        ];
    }
}