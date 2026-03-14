<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorageTank extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'reference_code',
        'gas_id',
        'max_capacity',
        'current_volume',
        'safe_minimum_level',
        'status',
        'agency_id',
    ];

    /**
     * Les attributs qui doivent être castés (convertis) vers des types natifs.
     * Cela garantit que PHP traite ces valeurs comme des nombres décimaux et non des chaînes de caractères.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'max_capacity' => 'float',
        'current_volume' => 'float',
        'safe_minimum_level' => 'float',
    ];

    /**
     * RELATION : Une cuve contient un type de gaz spécifique.
     */
    public function gas()
    {
        return $this->belongsTo(Gas::class);
    }

    /**
     * RELATION : Une cuve est installée dans une agence (site/usine) spécifique.
     * Assurez-vous d'avoir bien créé le modèle Agency !
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }
}