<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Closure extends Model
{
    // Correction de 'agenci_id' à 'agency_id' pour suivre la convention de nommage
    protected $fillable = [
        "agency_id",
        "starting_date",
        "ending_date",
    ];

    /**
     * Une fermeture appartient à une agence.
     * Eloquent utilise par défaut 'agency_id' comme clé étrangère.
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }
}
