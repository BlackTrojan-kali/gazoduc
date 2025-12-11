<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use App\Models\FuelSale;
use Carbon\Carbon;

class FuelSaleHistoryExport implements FromCollection, WithHeadings, ShouldAutoSize, WithMapping, WithTitle
{
    protected $startDate;
    protected $endDate;
    protected $agencyId;
    protected $articleId;
    protected $reportTitle;

    public function __construct($startDate, $endDate, $agencyId, $articleId, $reportTitle)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->agencyId = $agencyId;
        $this->articleId = $articleId;
        $this->reportTitle = $reportTitle;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // On récupère les ventes
        $salesQuery = FuelSale::with(['client', 'article', 'agency'])
            ->whereBetween('created_at', [
                Carbon::parse($this->startDate)->startOfDay(),
                Carbon::parse($this->endDate)->endOfDay()
            ])
            ->orderBy('created_at', 'asc');

        if ($this->agencyId) {
            $salesQuery->where('agency_id', $this->agencyId);
        }

        if ($this->articleId) {
            $salesQuery->where('article_id', $this->articleId);
        }

        return $salesQuery->get();
    }

    /**
     * Définit les en-têtes de colonnes
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID Vente',
            'Date & Heure',
            'Client',
            'Carburant',
            'Agence',
            'Quantité (L)',
            'Prix Unitaire (XOF)',
            'Montant Total (XOF)',
        ];
    }

    /**
     * Mappe les données de chaque ligne
     * @param mixed $sale
     * @return array
     */
    public function map($sale): array
    {
        return [
            $sale->id,
            $sale->created_at->format('d/m/Y H:i'),
            $sale->client->name ?? 'N/A',
            $sale->article->name ?? 'N/A',
            $sale->agency->name ?? 'N/A',
            $sale->quantity,
            $sale->unitPrice,
            $sale->total_price,
        ];
    }

    /**
     * Définit le titre de la feuille Excel
     * @return string
     */
    public function title(): string
    {
        return $this->reportTitle;
    }
}
