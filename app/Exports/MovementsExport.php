<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize; // Pour ajuster la taille des colonnes automatiquement
use Maatwebsite\Excel\Concerns\WithTitle; // Pour nommer l'onglet
use Maatwebsite\Excel\Concerns\WithStyles; // Pour styliser
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet; // Pour WithStyles

class MovementsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected $movements;
    protected $filters;

    public function __construct($movements, $filters)
    {
        $this->movements = $movements;
        $this->filters = $filters;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->movements;
    }

    /**
     * Retourne les en-têtes des colonnes pour Excel
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Date du Mouvement',
            'Type',
            'Qualification',
            'Quantité',
            'Article',
            'Agence',
            'Service',
            'Localisation Source',
            'Localisation Destination',
            'Description',
            'Enregistré par',
        ];
    }

    /**
     * Mappe chaque mouvement à une ligne du fichier Excel
     * @param mixed $movement
     * @return array
     */
    public function map($movement): array
    {
        return [
            $movement->id,
            \Carbon\Carbon::parse($movement->recorded_at)->format('d/m/Y H:i'),
            ucfirst($movement->movement_type),
            ucfirst($movement->qualification),
            $movement->quantity,
            $movement->article->name ?? 'N/A',
            $movement->agency->name ?? 'N/A',
            $movement->source_location ?? 'N/A',
            $movement->destination_location ?? 'N/A',
            $movement->description ?? 'Aucune',
            $movement->recordedByUser->name ?? 'N/A',
        ];
    }

    /**
     * Retourne le titre de l'onglet Excel
     * @return string
     */
    public function title(): string
    {
        return 'Mouvements Historique';
    }

    /**
     * Applique des styles à la feuille de calcul
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style la première ligne (les en-têtes)
            1    => ['font' => ['bold' => true, 'size' => 12], 'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE0E0E0']]],
        ];
    }
}