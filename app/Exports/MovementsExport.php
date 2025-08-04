<?php

namespace App\Exports;

use App\Models\Mouvement;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use Maatwebsite\Excel\Concerns\WithTitle;
use Carbon\Carbon;

// La classe n'implémente plus WithHeadings pour permettre les en-têtes multi-lignes
class MovementsExport implements FromCollection, ShouldAutoSize, WithStrictNullComparison, WithTitle
{
    protected $movements;
    protected $startDate;
    protected $endDate;
    protected $agencyName;
    protected $serviceName;
    protected $movementType; // Utilisé pour déterminer si c'est un rapport 'global' ou 'simple'
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
        // movementType sera 'global' ou un type spécifique (ex: 'entree', 'sortie')
        $this->movementType = $movementType;
        $this->articleName = $articleName ?? 'Tous les articles';
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        $dataRows = collect();

        // --- 1. En-têtes du rapport (titre, date de génération, filtres) ---
        // Ces lignes simulent l'en-tête du rapport comme dans le PDF
        $dataRows->push(['Rapport d\'Historique des Mouvements']);
        $dataRows->push(['Généré le: ' . now()->format('d/m/Y à H:i:s')]);
        $dataRows->push([]); // Ligne vide pour espacement

        $dataRows->push(['Filtres Appliqués:']);
        $dataRows->push(['Période: Du ' . $this->startDate . ' au ' . $this->endDate]);
        $dataRows->push(['Agence: ' . $this->agencyName]);
        // Correction: Le service est maintenant affiché correctement en tant que filtre
        $dataRows->push(['Service: ' . $this->serviceName]);
        $dataRows->push(['Type de mouvement: ' . ($this->movementType === 'global' ? 'Entrée / Sortie' : ucfirst($this->movementType))]);
        $dataRows->push(['Article: ' . $this->articleName]);
        $dataRows->push([]); // Ligne vide pour espacement

        // --- 2. En-têtes du tableau (avec gestion des colspan/rowspan via des lignes multiples) ---
        // La structure des en-têtes dépend du type de rapport (global ou simple)
        if ($this->movementType === 'global') {
            // En-têtes pour le rapport global (comme PDF.MovesGlobalPDFView)
            // Correction: Ajout de la colonne 'Service' pour refléter le filtre
            $dataRows->push([
                'Date', 'Article', 'Agence', 'Service', 'Flux', '', 'Qualification', '', '', '', 'Stock Actuel', 'Infos.'
            ]);
            $dataRows->push([
                '', '', '', '', 'Entrée', 'Sortie', 'Perte', 'Achat', 'Repreuve', 'Consigne', '', ''
            ]);
        } else {
            // En-têtes pour le rapport simple (comme PDF.MovesPDFView)
            // Correction: Ajout de la colonne 'Service'
            $dataRows->push([
                'Date', 'Description', 'Service', 'MVT du Stock Total', '', '', '', 'MVT de l\'Article : ' . $this->articleName, '', '', 'Enregistré par'
            ]);
            $dataRows->push([
                '', '', '', 'Achat', 'Consigne', 'Perte', 'Repreuve', 'Entrée', 'Sortie', 'Stock', ''
            ]);
        }

        // --- 3. Initialisation des totaux ---
        $totalEntree = 0;
        $totalSortie = 0;
        $totalPerte = 0;
        $totalAchat = 0;
        $totalRepreuve = 0;
        $totalConsigne = 0;
        $totalEntreeArticle = 0; // Spécifique au rapport simple
        $totalSortieArticle = 0; // Spécifique au rapport simple
        $lastStock = 0; // Spécifique au rapport simple

        // --- 4. Lignes de données des mouvements ---
        foreach ($this->movements as $movement) {
            $row = [];
            if ($this->movementType === 'global') {
                // Logique des données pour le rapport global
                $entree = ($movement->movement_type === 'entree') ? $movement->quantity : 0;
                $sortie = ($movement->movement_type === 'sortie') ? $movement->quantity : 0;
                $perte = ($movement->qualification === 'perte') ? $movement->quantity : 0;
                $achat = ($movement->qualification === 'achat') ? $movement->quantity : 0;
                $repreuve = ($movement->qualification === 'reepreuve') ? $movement->quantity : 0;
                $consigne = ($movement->qualification === 'consigne') ? $movement->quantity : 0;

                // Correction: Ajout de la valeur de la colonne 'Service'
                $row = [
                    Carbon::parse($movement->created_at)->format('d/m/Y H:i'),
                    $movement->article->name ?? 'N/A',
                    $movement->agency->name ?? 'N/A',
                    $movement->source_location ?? 'N/A', // Nouvelle colonne pour le service
                    $entree,
                    $sortie,
                    $perte,
                    $achat,
                    $repreuve,
                    $consigne,
                    $movement->stock ?? 'N/A',
                    ($movement->description ?? 'Aucune') . "\n(" . ($movement->user->first_name ?? 'N/A') . ")",
                ];

                // Accumulation des totaux pour le rapport global
                $totalEntree += $entree;
                $totalSortie += $sortie;
                $totalPerte += $perte;
                $totalAchat += $achat;
                $totalRepreuve += $repreuve;
                $totalConsigne += $consigne;

            } else {
                // Logique des données pour le rapport simple
                $achat = ($movement->qualification === 'achat') ? $movement->quantity : 0;
                $consigne = ($movement->qualification === 'consigne') ? $movement->quantity : 0;
                $perte = ($movement->qualification === 'perte') ? $movement->quantity : 0;
                $repreuve = ($movement->qualification === 'reepreuve') ? $movement->quantity : 0;
                $entreeArticle = ($movement->movement_type === 'entree') ? $movement->quantity : 0;
                $sortieArticle = ($movement->movement_type === 'sortie') ? $movement->quantity : 0;

                // Correction: Ajout de la valeur de la colonne 'Service'
                $row = [
                    Carbon::parse($movement->created_at)->format('d/m/Y H:i'),
                    $movement->description ?? 'Aucune',
                    $movement->source_location ?? 'N/A', // Nouvelle colonne pour le service
                    $achat,
                    $consigne,
                    $perte,
                    $repreuve,
                    $entreeArticle,
                    $sortieArticle,
                    $movement->stock ?? 'N/A',
                    $movement->user->first_name ?? 'N/A',
                ];

                // Accumulation des totaux pour le rapport simple
                $totalAchat += $achat;
                $totalConsigne += $consigne;
                $totalPerte += $perte;
                $totalRepreuve += $repreuve;
                $totalEntreeArticle += $entreeArticle;
                $totalSortieArticle += $sortieArticle;
                $lastStock = $movement->stock ?? $lastStock; // Met à jour le dernier stock vu
            }
            $dataRows->push($row);
        }

        // --- 5. Ligne de total ---
        if ($this->movementType === 'global') {
            // Ligne de total pour le rapport global
            $dataRows->push([
                'Total :', '', '', '', // Simule colspan 4 pour Date, Article, Agence, Service
                $totalEntree,
                $totalSortie,
                $totalPerte,
                $totalAchat,
                $totalRepreuve,
                $totalConsigne,
                '', // Colonne Stock Actuel vide
                ''  // Colonne Infos. vide
            ]);
        } else {
            // Ligne de total pour le rapport simple
            $dataRows->push([
                'Total :', '', '', // Simule colspan 3 pour Date, Description, Service
                $totalAchat,
                $totalConsigne,
                $totalPerte,
                $totalRepreuve,
                $totalEntreeArticle,
                $totalSortieArticle,
                $lastStock, // Affiche le dernier stock
                '' // Colonne Enregistré par vide
            ]);
        }

        return $dataRows;
    }

    /**
     * Pour définir le nom de la feuille.
     * @return string
     */
    public function title(): string
    {
        return 'Historique des Mouvements';
    }

    // La méthode headings() est supprimée car les en-têtes sont générés dans collection()
    // public function headings(): array { ... }
}
