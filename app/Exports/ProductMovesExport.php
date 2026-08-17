<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnFormatting; // Indispensable pour le formatage numérique
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ProductMovesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles, WithColumnFormatting
{
    protected $moves;

    public function __construct($moves)
    {
        $this->moves = $moves;
    }

    public function collection()
    {
        return $this->moves;
    }

    public function headings(): array
    {
        return [
            'Date',
            'Type',
            'Produit',
            'SKU',
            'Quantité',
            'Stock Après', // Nouvelle Colonne (F)
            'Départ',
            'Destination',
            'Motif',
            'Auteur',
        ];
    }

    public function map($move): array
    {
        // Conversion en nombre réel (positif ou négatif) pour permettre les sommes dans Excel
        $signedQty = $move->type === 'entree' ? floatval($move->qty) : -floatval($move->qty);

        return [
            $move->created_at->format('d/m/Y H:i'),
            strtoupper($move->type),
            $move->product->designation ?? 'Produit supprimé',
            $move->product->sku ?? '-',
            $signedQty, // Valeur numérique
            floatval($move->remaining_stock), // Valeur numérique (Stock Après)
            $move->departure,
            $move->destination,
            $move->label,
            $move->user ? $move->user->first_name . ' ' . $move->user->last_name : 'Système',
        ];
    }

    /**
     * Définit le format numérique des colonnes
     */
    public function columnFormats(): array
    {
        return [
            'E' => NumberFormat::FORMAT_NUMBER_00, // Colonne Quantité
            'F' => NumberFormat::FORMAT_NUMBER_00, // Colonne Stock Après
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // 1. Style de l'en-tête (Bleu foncé, texte blanc)
        $sheet->getStyle('A1:J1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFFFF'],
                'size' => 11
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF2C3E50'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // 2. Bordures sur l'ensemble du tableau
        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle('A1:J' . $lastRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // 3. Alignements spécifiques
        return [
            'A' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]], // Date
            'B' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]], // Type
            'D' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]], // SKU
            'E' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]],  // Quantité
            'F' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]],  // Stock Après
        ];
    }
}