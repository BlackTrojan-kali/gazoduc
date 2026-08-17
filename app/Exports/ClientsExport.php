<?php

namespace App\Exports;

use App\Models\Client;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ClientsExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // On récupère les clients avec leur catégorie et agence pour éviter les requêtes N+1
        return Client::with(['category', 'agency'])->get();
    }

    /**
     * Définit les entêtes du fichier Excel (1ère ligne)
     */
    public function headings(): array
    {
        return [
            'Nom',
            'Type de Client',
            'Catégorie',
            'Agence',
            'Téléphone',
            'Email',
            'Adresse',
            'NUI',
            'Date Création'
        ];
    }

    /**
     * Mappe les données de la base vers les colonnes Excel
     */
    public function map($client): array
    {
        return [
            $client->name,
            $client->client_type,
            $client->category ? $client->category->name : '', // Gère le cas où catégorie est null
            $client->agency ? $client->agency->name : '',     // Gère le cas où agence est null
            $client->phone_number,
            $client->email_address,
            $client->address,
            $client->NUI,
            $client->created_at->format('d/m/Y'),
        ];
    }
}