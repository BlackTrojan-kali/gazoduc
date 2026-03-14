<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gas extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'category',
        'un_code',
        'description', // Ajout obligatoire pour correspondre à votre formulaire
    ];

    /**
     * RELATION : Un type de gaz est associé à plusieurs bouteilles physiques.
     * (Nous créerons le modèle Cylinder plus tard)
     */
    public function cylinders()
    {
        return $this->hasMany(Cylinder::class);
    }

    /**
     * RELATION : Un type de gaz est stocké dans plusieurs cuves (réservoirs) de l'usine.
     * (Nous créerons le modèle StorageTank plus tard)
     */
    public function storageTanks()
    {
        return $this->hasMany(StorageTank::class);
    }

    /**
     * RELATION : Un type de gaz est produit à travers plusieurs lots de production.
     * (Nous créerons le modèle ProductionBatch plus tard, crucial pour le gaz médical)
     */
    public function productionBatches()
    {
        return $this->hasMany(ProductionBatch::class);
    }
}