<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bordereau_route extends Model
{
    //

    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }

    public function chauffeur(){
        return $this->belongsTo(Chauffeur::class,"chauffeur_id");
    }

    public function co_chauffeur(){
        return $this->belongsTo(Chauffeur::class,"co_chauffeur_id");
    }

    public function vehicule(){
        return $this->belongsTo(Vehicule::class,"vehicule_id");
    }
}
