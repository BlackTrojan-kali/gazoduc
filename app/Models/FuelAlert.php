<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelAlert extends Model
{
    /**
     * Les champs autorisés pour l'insertion en masse.
     */
    protected $fillable = [
        'vehicule_id',
        'position_id', // L'endroit exact du vol
        'type',        // 'THEFT' (Vol), 'LEAK' (Fuite), etc.
        'volume_lost', // La quantité volée (ex: 50.5 Litres)
        'level_before',
        'level_after',
        'detected_at', // L'heure exacte de l'incident
        'is_resolved', // Si un admin a traité l'alerte
        'admin_notes',
    ];

    /**
     * Conversion automatique des types (Casting).
     * C'est ici qu'on évite l'erreur "Call to a member function diffForHumans() on string".
     */
    protected $casts = [
        'detected_at' => 'datetime', // Important pour les dates !
        'is_resolved' => 'boolean',
        'volume_lost' => 'float',
        'level_before' => 'float',
        'level_after' => 'float',
    ];

    /**
     * Relation : L'alerte concerne un véhicule.
     */
    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicule::class);
    }

    /**
     * Relation : L'alerte est liée à une position GPS précise.
     * Cela permet d'afficher le marqueur rouge sur la carte.
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(VehiclePosition::class, 'position_id');
    }
}