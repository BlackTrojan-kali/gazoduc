<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProductMovesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
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
            'Départ',
            'Destination',
            'Motif',
            'Auteur',
        ];
    }

    public function map($move): array
    {
        return [
            $move->created_at->format('d/m/Y H:i'),
            strtoupper($move->type),
            $move->product->designation,
            $move->product->sku,
            ($move->type === 'entree' ? '+' : '-') . $move->qty,
            $move->departure,
            $move->destination,
            $move->label,
            $move->user->first_name . ' ' . $move->user->last_name,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]], // Première ligne en gras
        ];
    }
}