<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicule extends Model
{
    //
    protected $fillable = [
        'brand', // <--- AJOUTÉ
        'licence_plate',
        'type',
        'capacity_liters',
        'owner_type',
        'archived',
        'gps_device_id' // <--- AJOUTÉ
    ];
    // Relation : Le véhicule possède un boîtier actif
    public function gpsDevice()
    {
        return $this->belongsTo(GpsDevice::class);
    }

    // Relation : Historique complet des positions
    public function positions()
    {
        return $this->hasMany(VehiclePosition::class);
    }

    // Relation : La toute dernière position (pour l'affichage temps réel sur la carte)
    public function latestPosition()
    {
        return $this->hasOne(VehiclePosition::class)->latestOfMany('captured_at');
    }
}
