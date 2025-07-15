<?php

namespace App\Exports;

use App\Models\Depotage;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles; // Pour styliser (optionnel)
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet; // Pour WithStyles

class DepotagesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles // Ajout de WithStyles
{
    protected $depotages;

    public function __construct(Collection $depotages)
    {
        $this->depotages = $depotages;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->depotages;
    }

    /**
     * Définit les en-têtes de colonne pour le fichier Excel.
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID Depotage',
            'Date Depotage',
            'Citerne Mobile',
            'Citerne Fixe',
            'Article',
            'Quantite (L)',
            'Agence',
            'Numero BL',
            'Observations',
            'Enregistre par',
            'Date Creation',
        ];
    }

    /**
     * Mappe chaque dépotage aux données des colonnes.
     * @param mixed $depotage (Depotage model)
     * @return array
     */
    public function map($depotage): array
    {
        // Utilisez ?? 'N/A' ou ?? '—' pour gérer les relations ou champs nuls proprement
        return [
            $depotage->id,
            \Carbon\Carbon::parse($depotage->depotage_date)->format('Y-m-d'), // Format de date standard
            $depotage->citerne_mobile->name ?? 'N/A',
            $depotage->citerne_fixe->name ?? 'N/A',
            $depotage->article->name ?? 'N/A',
            $depotage->quantity, // Maatwebsite formatte les nombres automatiquement
            $depotage->agency->name ?? 'N/A',
            $depotage->bl_number ?? '—',
            $depotage->observation ?? '—',
            ($depotage->user->first_name ?? '') . ' ' . ($depotage->user->last_name ?? ''), // Nom complet
            $depotage->created_at->format('Y-m-d H:i:s'), // Date et heure complètes
        ];
    }

    /**
     * Applique des styles à la feuille de calcul.
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style la première ligne (les en-têtes)
            1    => ['font' => ['bold' => true, 'size' => 11], 'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['argb' => 'FFE0E0E0']]], // Fond gris clair
            // Vous pouvez ajouter d'autres styles ici, par exemple:
            // 'F' => ['numberFormat' => ['formatCode' => \PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_NUMBER_00]], // Format numérique pour la colonne Quantité
        ];
    }
}