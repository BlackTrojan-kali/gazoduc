<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CylinderType extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse (Mass Assignment).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'water_capacity_liters',
        'working_pressure_bars',
        'description', // Ajout obligatoire pour correspondre à votre contrôleur
    ];

    /**
     * RELATION : Un type d'emballage (format) est associé à plusieurs bouteilles physiques.
     * (Le modèle Cylinder sera créé lors de la modélisation du parc d'emballages)
     */
    public function cylinders()
    {
        return $this->hasMany(Cylinder::class);
    }
}