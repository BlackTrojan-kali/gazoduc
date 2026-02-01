<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnFormatting; // Nécessaire pour le formatage des nombres
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class GlobalMovesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles, WithColumnFormatting
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
            'Heure',
            'Boutique',
            'Produit',
            'Code SKU',
            'Type Mouvement',
            'Quantité',
            'Stock Après', // Nouvelle Colonne
            'Origine > Destination',
            'Auteur',
            'Motif / Label'
        ];
    }

    public function map($move): array
    {
        // On calcule la valeur signée pour Excel (ex: -5.00 ou 10.00)
        // Cela permet de faire des SOMMES automatiques dans Excel
        $signedQty = $move->type === 'entree' ? floatval($move->qty) : -floatval($move->qty);

        return [
            $move->created_at->format('d/m/Y'),
            $move->created_at->format('H:i:s'),
            $move->boutique->name ?? 'N/A',
            $move->product->designation ?? 'Produit supprimé',
            $move->product->sku ?? '-',
            strtoupper($move->type),
            $signedQty, // Valeur numérique réelle
            floatval($move->remaining_stock), // Valeur numérique réelle
            $move->departure . ' > ' . $move->destination,
            $move->user ? $move->user->first_name . ' ' . $move->user->last_name : 'Système',
            $move->label
        ];
    }

    /**
     * Définit le format des cellules pour qu'Excel les reconnaisse comme des nombres
     */
    public function columnFormats(): array
    {
        return [
            'G' => NumberFormat::FORMAT_NUMBER_00, // Colonne Quantité (2 décimales)
            'H' => NumberFormat::FORMAT_NUMBER_00, // Colonne Stock Après (2 décimales)
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // 1. Style de l'en-tête (Bleu professionnel comme le PDF)
        $sheet->getStyle('A1:K1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFFFF'], // Texte blanc
                'size' => 11
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF2C3E50'], // Bleu foncé
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // 2. Bordures sur tout le tableau
        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle('A1:K' . $lastRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // 3. Alignements spécifiques
        return [
            // Centrer Date, Heure, SKU, Type
            'A' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'B' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'E' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'F' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            
            // Aligner à droite les chiffres (Quantité, Stock)
            'G' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]],
            'H' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]],
        ];
    }
}