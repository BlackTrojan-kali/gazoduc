<?php

namespace App\Exports;

use App\Models\ProductionHistory; // N'oubliez pas d'importer votre modèle
use Illuminate\Support\Carbon; // Pour formater les dates

// Importations nécessaires de Maatwebsite\Excel
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\Exportable; // Pour l'utilisation du trait Exportable

class ProductionHistoryExcelExport implements FromCollection, WithHeadings, WithMapping
{
    use Exportable; // Permet d'utiliser des méthodes comme Excel::download()

    // Propriétés pour stocker les filtres passés au constructeur
    protected $agency_id;
    protected $article_id;
    protected $citerne_id;
    protected $start_date;
    protected $end_date;

    /**
     * Le constructeur reçoit les IDs des filtres et les dates.
     */
    public function __construct($agency_id, $article_id, $citerne_id, $start_date, $end_date)
    {
        $this->agency_id = $agency_id;
        $this->article_id = $article_id;
        $this->citerne_id = $citerne_id;
        $this->start_date = $start_date;
        $this->end_date = $end_date;
    }

    /**
     * La méthode 'collection' est responsable de la récupération des données.
     * Elle applique les filtres pour récupérer l'historique de production.
     *
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = ProductionHistory::query()
            ->with(['agency', 'article', 'citerne', 'user']); // Charge les relations

        // Applique les filtres si présents
        if ($this->agency_id) {
            $query->where('agency_id', $this->agency_id);
        }
        if ($this->article_id) {
            $query->where('article_id', $this->article_id);
        }
        if ($this->citerne_id) {
            $query->where('source_citerne_id', $this->citerne_id);
        }
        if ($this->start_date) {
            $query->whereDate('created_at', '>=', $this->start_date);
        }
        if ($this->end_date) {
            $query->whereDate('created_at', '<=', $this->end_date);
        }

        return $query->get(); // Retourne la collection de ProductionHistory
    }

    /**
     * La méthode 'headings' définit les en-têtes de colonnes pour le fichier Excel.
     *
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Date de Production',
            'Citerne Source',
            'Article Produit',
            'Quantité Produite',
            'Agence',
            'Enregistré par',
        ];
    }

    /**
     * La méthode 'map' définit comment chaque enregistrement de données est mappé à une ligne Excel.
     * Cela vous permet de formater les données et d'inclure des relations.
     *
     * @param mixed $move L'enregistrement ProductionHistory actuel
     * @return array
     */
    public function map($move): array
    {
        return [
            $move->id,
            Carbon::parse($move->created_at)->format('d/m/Y H:i'), // Formatage de la date
            $move->citerne->name ?? 'N/A', // Accède au nom de la citerne via la relation
            $move->article->name ?? 'N/A', // Accède au nom de l'article via la relation
            $move->quantity_produced,
            $move->agency->name ?? 'N/A', // Accède au nom de l'agence via la relation
            $move->user->first_name ?? 'N/A', // Accède au nom de l'utilisateur via la relation
        ];
    }
}