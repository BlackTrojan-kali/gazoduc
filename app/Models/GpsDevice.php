<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GpsDevice extends Model
{
    //
    protected $fillable = [
        
        'imei', // L'identifiant unique du boîtier
        'sim_number', // Numéro de la puce M2M
        'model',// Ex: Teltonika, Coban
        'is_active',
    ];
} 
