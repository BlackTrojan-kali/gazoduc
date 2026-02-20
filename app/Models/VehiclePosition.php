<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehiclePosition extends Model
{
    protected $fillable = [
        'vehicule_id',
        'gps_device_id',
        'latitude',
        'longitude',
        'speed',
        'heading',
        'fuel_level',
        'fuel_variance',
        'captured_at', // <--- C'est lui le coupable
    ];

    // AJOUTEZ CECI :
    protected $casts = [
        'captured_at' => 'datetime', // <--- La magie opère ici
        'fuel_level' => 'float',
        'speed' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function vehicule()
    {
        return $this->belongsTo(Vehicule::class);
    }
}