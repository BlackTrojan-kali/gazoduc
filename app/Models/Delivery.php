<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    //
    protected $fillable=[
        "sale_id", "vehicle_id", "driver_id", "status", "delivery_date"
    ];
    public function sale(){
        return $this->belongsTo(Productsale::class);
    }
    public function vehicle(){
        return $this->belongsTo(Vehicule::class);
    }
    public function driver(){
        return $this->belongsTo(Chauffeur::class);
    }
}
