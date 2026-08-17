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
        'archived'
    ];
}
