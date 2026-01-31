<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producttransfert extends Model
{
    //
    protected $fillable = [
        'vehicule_id' ,
                    'chauffeur_id' ,    
            "boutique_departure_id",
            "boutique_arrival_id",
            "departure_date",
            "arrival_date",
            "status",// pending, cancelled ,finished 
            "user_emitting_id",
            "user_receiving_id",
    ];
    public function vehicule(){
        return $this->belongsTo(Vehicule::class);
    }
    public function chauffeur(){
        return $this->belongsTo(Chauffeur::class);
    }
    public function boutiqueDeparture (){
        return $this->belongsTo(Boutique::class,"boutique_departure_id");
    }
    public function boutiqueArrival (){
        return $this->belongsTo(Boutique::class,"boutique_arrival_id");
    }
    
    public function userEmitting (){
        return $this->belongsTo(User::class,"user_emitting_id");
    }
    public function userReceiving (){
        return $this->belongsTo(User::class,"user_receiving_id");
    }
    public function items (){
        return $this->hasMany(Producttransfertitem::class,"tranfert_id");
    }
}
