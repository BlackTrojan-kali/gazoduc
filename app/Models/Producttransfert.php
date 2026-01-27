<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producttransfert extends Model
{
    //
    protected $fillable = [
        
            "boutique_departure_id",
            "boutique_arrival_id",
            "departure_date",
            "arrival_date",
            "status",// pending, cancelled ,finished 
            "user_emitting_id",
            "user_receiving_id",
    ];
    public function boutique_departure (){
        return $this->belongsTo(Boutique::class,"boutique_departure_id");
    }
    public function boutique_arrival (){
        return $this->belongsTo(Boutique::class,"boutique_arrival_id");
    }
    
    public function user_emitting (){
        return $this->belongsTo(User::class,"user_emitting_id");
    }
    public function user_receiving (){
        return $this->belongsTo(User::class,"user_receiving_id");
    }
}
