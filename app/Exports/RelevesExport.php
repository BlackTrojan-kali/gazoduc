<?php

namespace App\Exports;

use App\Models\CiterneReading;
use Illuminate\Support\Collection; // N'oubliez pas d'importer Collection
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RelevesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $releves;

    public function __construct(Collection $releves) // Type-hinting Collection
    {
        $this->releves = $releves;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->releves;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID Relevé',
            'Citerne',
            'Agence',
            'Quantité Théorique (L)',
            'Quantité Mesurée (L)',
            'Différence (L)',
            'Date Lecture',
            'Enregistré par',
            'Date Création',
        ];
    }

    /**
     * @param mixed $releve (CiterneReading model)
     * @return array
     */
    public function map($releve): array
    {
        return [
            $releve->id,
            $releve->citerne->name ?? 'N/A', // Accès sécurisé à la relation
            $releve->agency->name ?? 'N/A',
            $releve->theorical_quantity,
            $releve->measured_quantity,
            $releve->difference,
            \Carbon\Carbon::parse($releve->reading_date)->format('Y-m-d'), // Format pour Excel
            $releve->user->first_name . ' ' . $releve->user->last_name ?? 'N/A',
            $releve->created_at->format('Y-m-d H:i:s'),
        ];
    }
}