<?php

namespace App\Exports;

use App\Models\Mouvement;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
// Retire WithMapping, car le mapping est fait directement dans collection()
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use Maatwebsite\Excel\Concerns\WithTitle;
use Carbon\Carbon;

// La classe n'implémente plus WithMapping
class MovementsExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStrictNullComparison, WithTitle
{
    protected $movements;
    protected $startDate;
    protected $endDate;
    protected $agencyName;
    protected $serviceName;
    protected $movementType;
    protected $articleName;

    public function __construct(
        Collection $movements,
        string $startDate,
        string $endDate,
        ?string $agencyName,
        ?string $serviceName,
        string $movementType,
        ?string $articleName
    ) {
        $this->movements = $movements;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->agencyName = $agencyName ?? 'Tous';
        $this->serviceName = $serviceName ?? 'Tous';
        $this->movementType = $movementType === 'global' ? 'Entrée / Sortie' : ucfirst($movementType);
        $this->articleName = $articleName ?? 'Tous les articles';
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        $dataRows = collect();

        // On crée les lignes de données en mappant chaque mouvement
        foreach ($this->movements as $movement) {
            if ($this->movementType === 'Entrée / Sortie') {
                $entree = 0;
                $sortie = 0;
                $perte = 0;
                $achat = 0;
                $repreuve = 0;
                $consigne = 0;

                if ($movement->movement_type === 'entree') {
                    $entree = $movement->quantity;
                } elseif ($movement->movement_type === 'sortie') {
                    $sortie = $movement->quantity;
                }

                switch ($movement->qualification) {
                    case 'perte':
                        $perte = $movement->quantity;
                        break;
                    case 'achat':
                        $achat = $movement->quantity;
                        break;
                    case 'repreuve':
                        $repreuve = $movement->quantity;
                        break;
                    case 'consigne':
                        $consigne = $movement->quantity;
                        break;
                }

                $dataRows->push([
                    Carbon::parse($movement->created_at)->format('d/m/Y H:i'),
                    $movement->article->name ?? 'N/A',
                    $movement->agency->name ?? 'N/A',
                    $entree,
                    $sortie,
                    $perte,
                    $achat,
                    $repreuve,
                    $consigne,
                    $movement->stock ?? 'N/A',
                    $movement->description ?? 'Aucune',
                    $movement->recordedByUser->name ?? 'N/A',
                ]);
            } else {
                $dataRows->push([
                    Carbon::parse($movement->created_at)->format('d/m/Y H:i'),
                    $movement->article->name ?? 'N/A',
                    $movement->agency->name ?? 'N/A',
                    $movement->quantity,
                    $movement->stock ?? 'N/A',
                    $movement->description ?? 'Aucune',
                    $movement->recordedByUser->name ?? 'N/A',
                ]);
            }
        }

        // Calculer et ajouter la ligne de total à la collection
        if ($this->movementType === 'Entrée / Sortie') {
            $totalEntree = 0;
            $totalSortie = 0;
            $totalPerte = 0;
            $totalAchat = 0;
            $totalRepreuve = 0;
            $totalConsigne = 0;

            foreach ($this->movements as $movement) {
                if ($movement->movement_type === 'entree') {
                    $totalEntree += $movement->quantity;
                } elseif ($movement->movement_type === 'sortie') {
                    $totalSortie += $movement->quantity;
                }
                switch ($movement->qualification) {
                    case 'perte': $totalPerte += $movement->quantity; break;
                    case 'achat': $totalAchat += $movement->quantity; break;
                    case 'repreuve': $totalRepreuve += $movement->quantity; break;
                    case 'consigne': $totalConsigne += $movement->quantity; break;
                }
            }

            $dataRows->push([
                'Total :', // Libellé
                '', '', // Colonnes vides pour alignement du libellé
                $totalEntree,
                $totalSortie,
                $totalPerte,
                $totalAchat,
                $totalRepreuve,
                $totalConsigne,
                '', // Stock Actuel (vide)
                '', // Description (vide)
                ''  // Enregistré par (vide)
            ]);
        } else {
            $totalQuantiteSimple = $this->movements->sum('quantity');
            $dataRows->push([
                'Total :',
                '', '', // Colonnes vides pour alignement du libellé
                $totalQuantiteSimple,
                '', // Stock Actuel (vide)
                '', // Description (vide)
                ''  // Enregistré par (vide)
            ]);
        }

        return $dataRows;
    }

    /**
     * Définir les en-têtes de colonnes et les informations de rapport.
     * @return array
     */
    public function headings(): array
    {
        $header = [
            ['Rapport d\'Historique des Mouvements'],
            ['Généré le: ' . now()->format('d/m/Y à H:i:s')],
            [],

            ['Filtres Appliqués:'],
            ['Période: Du ' . $this->startDate . ' au ' . $this->endDate],
            ['Agence: ' . $this->agencyName],
            ['Service: ' . $this->serviceName],
            ['Type de mouvement: ' . $this->movementType],
            ['Article: ' . $this->articleName],
            [],
        ];

        if ($this->movementType === 'Entrée / Sortie') {
            $tableHeaders = [
                'Date',
                'Article',
                'Agence',
                'Entrée (Qté)',
                'Sortie (Qté)',
                'Perte',
                'Achat',
                'Repreuve',
                'Consigne',
                'Stock Actuel',
                'Description',
                'Enregistré par',
            ];
        } else {
            $tableHeaders = [
                'Date',
                'Article',
                'Agence',
                'Quantité',
                'Stock Actuel',
                'Description',
                'Enregistré par',
            ];
        }

        return array_merge(array_map(fn($row) => $row, $header), [$tableHeaders]);
    }

    // La méthode map() n'est plus nécessaire ici puisque le mapping est fait dans collection()
    // public function map($movement): array { ... }

    /**
     * Pour définir le nom de la feuille.
     * @return string
     */
    public function title(): string
    {
        return 'Historique des Mouvements';
    }
}