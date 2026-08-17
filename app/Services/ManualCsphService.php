<?php

namespace App\Services;

class ManualCsphService
{
    /**
     * Traite un tableau de données manuelles pour la déclaration CSPH.
     * 
     * @param array $lignes Data brute venant du frontend React
     * @return array
     */
    public function processManualData(array $lignes)
    {
        $grandTotal = 0;
        $totalTonnes = 0;
        $processedLignes = [];

        foreach ($lignes as $ligne) {
            // Sécurisation des entrées en nombres flottants
            $quantite = (float) ($ligne['quantite'] ?? 0);
            $taux = (float) ($ligne['taux'] ?? 0);
            
            // On recalcule le total de la ligne pour éviter toute erreur humaine sur le frontend
            $totalLigne = round($quantite * $taux);

            $processedLignes[] = [
                'ville' => strtoupper($ligne['ville'] ?? 'INCONNUE'),
                'source' => $ligne['source'] ?? 'Ex - SCDP',
                'type' => ucfirst($ligne['type'] ?? 'Conditionné'),
                'quantite' => $quantite,
                'taux' => $taux,
                'total' => $totalLigne,
            ];

            // Incrémentation des totaux généraux
            $grandTotal += $totalLigne;
            $totalTonnes += $quantite;
        }

        // Tri alphabétique par ville pour un rendu propre sur le PDF
        $processedLignes = collect($processedLignes)->sortBy('ville')->values()->toArray();

        return [
            'lignes' => $processedLignes,
            'grandTotal' => $grandTotal,
            'totalTonnes' => $totalTonnes,
        ];
    }
}