<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GlobalMovesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $moves;

    public function __construct($moves)
    {
        $this->moves = $moves;
    }

    /**
    * Retourne la collection de données.
    */
    public function collection()
    {
        return $this->moves;
    }

    /**
    * Définit les entêtes des colonnes dans le fichier Excel.
    */
    public function headings(): array
    {
        return [
            'Date',
            'Heure',
            'Boutique', // Colonne spécifique pour le Directeur
            'Produit',
            'Code SKU',
            'Type Mouvement',
            'Quantité',
            'Origine > Destination',
            'Auteur',
            'Motif / Label'
        ];
    }

    /**
    * Mappe chaque ligne de données pour formater l'affichage.
    */
    public function map($move): array
    {
        $typeLabel = $move->type === 'entree' ? 'ENTRÉE' : 'SORTIE';
        $qtyPrefix = $move->type === 'entree' ? '+' : '-';

        return [
            $move->created_at->format('d/m/Y'),
            $move->created_at->format('H:i:s'),
            $move->boutique->name ?? 'N/A', // Nom de la boutique
            $move->product->designation ?? 'Produit supprimé',
            $move->product->sku ?? '-',
            $typeLabel,
            $qtyPrefix . floatval($move->qty), // Ex: +10 ou -5
            $move->departure . ' > ' . $move->destination,
            $move->user ? $move->user->first_name . ' ' . $move->user->last_name : 'Système',
            $move->label
        ];
    }

    /**
    * Applique des styles (Mettre la première ligne en gras).
    */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style de la ligne 1 (Entêtes)
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFEFEFEF'],
                ],
            ],
        ];
    }
}