<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Agency;
use App\Models\Stock;

class PerequationService
{
    /**
     * Calcule le prix final d'une bouteille dans une agence spécifique.
     */
    public function calculateFinalPrice(Article $article, Agency $agency, float $basePriceAtDepot)
    {
        // 1. Récupérer le coût de transport de la ville de l'agence (0 si non défini)
        $costPerTonne = $agency->city->transport_cost_per_tonne ?? 0;
        
        // 2. Récupérer le poids de l'article en Kg (ex: 12.5)
        $weightInKg = $article->weight_per_unit;

        // Si ce n'est pas un article pesable ou si le transport est gratuit
        if (!$weightInKg || $costPerTonne <= 0) {
            return $basePriceAtDepot;
        }

        // 3. LA FORMULE MAGIQUE : 
        // Coût du transport = Coût pour 1 Tonne (1000kg) * (Poids de la bouteille / 1000)
        $perequation = $costPerTonne * ($weightInKg / 1000);

        // 4. On additionne le prix de base + le transport (et on arrondit pour éviter les centimes)
        return round($basePriceAtDepot + $perequation);
    }
   
    public function calculateExpectedCsphReimbursement(Stock $stock): float
    {
        // 1. On récupère la ville via l'agence liée à ce stock
        $city = $stock->agency->city;
        
        // 2. On récupère le coût de transport de cette ville (0 par défaut si non renseigné)
        $costPerTonne = $city->transport_cost_per_tonne ?? 0;

        // 3. On récupère le poids de l'article (ex: 12.5)
        $weightInKg = (float) $stock->article->weight_per_unit;

        // S'il n'y a pas de coût de transport, pas de poids, ou pas de stock, la CSPH ne doit rien
        if ($weightInKg <= 0 || $costPerTonne <= 0 || $stock->quantity <= 0) {
            return 0.0;
        }

        // 4. On calcule le poids total en Tonnes
        $totalTonnes = ($stock->quantity * $weightInKg) / 1000;

        // 5. On calcule la subvention totale (Poids en Tonnes * Coût par Tonne)
        $expectedReimbursement = $totalTonnes * $costPerTonne;

        // On arrondit au FCFA près
        return round($expectedReimbursement);
    }
}