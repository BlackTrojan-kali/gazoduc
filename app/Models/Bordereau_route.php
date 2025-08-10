<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bordereau_route extends Model
{
    //

    public function departure(){
        return $this->belongsTo(Agency::class,"departure_location_id");
    }

    public function arrival(){
        return $this->belongsTo(Agency::class,"arrival_location_id");
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
    
 public function articles(){
        return $this->belongsToMany(Article::class, "article_bordereau_route", "bordereau_route_id", "article_id")->withPivot('qty');
    }
}
