<?php

namespace App\Exports;

use App\Models\Reception; // Assurez-vous d'importer le modèle
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping; // Pour mapper les données et inclure les relations

class ReceptionsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $receptions;

    public function __construct($receptions)
    {
        $this->receptions = $receptions;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->receptions;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Citerne Mobile',
            'Article',
            'Quantité Reçue (L)',
            'Agence Destination',
            'Enregistré par (Prénom)',
            'Enregistré par (Nom)',
            'Origine',
            'Date de Création',
        ];
    }

    /**
     * @var Reception $reception
     * @return array
     */
    public function map($reception): array
    {
        return [
            $reception->id,
            $reception->citerne->name ?? 'N/A', // Utilisez 'citerne' si c'est le nom de la relation
            $reception->article->name ?? 'N/A',
            $reception->received_quantity,
            $reception->agency->name ?? 'N/A', // Utilisez 'agency' si c'est le nom de la relation pour destination_agency_id
            $reception->user->first_name ?? 'N/A', // Utilisez 'user' si c'est le nom de la relation pour recorded_id_user
            $reception->user->last_name ?? 'N/A',
            $reception->origin ?? 'N/A',
            $reception->created_at->format('Y-m-d H:i:s'),
        ];
    }
}