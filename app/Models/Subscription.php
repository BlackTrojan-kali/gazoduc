<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    //
    protected $fillable=[
        "entreprise_id",
        "licence_id",
        "price",
        "nombre_agence",
        "date_souscription",
        "date_expiration",
        "is_active",
    ];
    public function entreprise(){
        return $this->belongsTo(Entreprise::class,"entreprise_id");
    }
    public function licence(){
        return $this->belongsTo(Licence::class,"licence_id");
    }
}
