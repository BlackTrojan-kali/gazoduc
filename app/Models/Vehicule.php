<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Vehicule extends Model
{
    protected $fillable = [
        'brand',
        'licence_plate',
        'type',
        'capacity_liters', // Capacité de chargement (ex: 30 000L de marchandise)
        'owner_type',
        'archived',
        'gps_device_id',
        
        // --- NOUVEAUX CHAMPS POUR LE TRACKING CARBURANT ---
        'tank_capacity', // Capacité du réservoir MOTEUR (ex: 400L) pour la jauge
        'theft_threshold_percentage', // Seuil d'alerte vol (ex: 5%)
        'fuel_type', // Diesel, Essence
    ];

    /**
     * Conversion automatique des types
     */
    protected $casts = [
        'archived' => 'boolean',
        'tank_capacity' => 'float',
        'theft_threshold_percentage' => 'float',
        'capacity_liters' => 'float',
    ];

    // Relation : Le véhicule possède un boîtier actif
    public function gpsDevice(): BelongsTo
    {
        return $this->belongsTo(GpsDevice::class);
    }

    // Relation : Historique complet des positions
    public function positions(): HasMany
    {
        return $this->hasMany(VehiclePosition::class);
    }

    // Relation : La toute dernière position (pour l'affichage temps réel sur la carte)
    public function latestPosition(): HasOne
    {
        // latestOfMany est plus performant que orderBy->first() pour les gros volumes de GPS
        return $this->hasOne(VehiclePosition::class)->latestOfMany('captured_at');
    }

    // Relation : Historique des alertes de vol (Affiché dans le Dashboard)
    public function fuelAlerts(): HasMany
    {
        return $this->hasMany(FuelAlert::class)->latest();
    }
}