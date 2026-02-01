<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boutique extends Model
{
   //
    //
    protected $fillable=[
        "region_id",
        "city_id",
        "name",
        "address",
        "archived",
        "counters",
        "is_central"
        
    ];
    public function region(){
        return $this->belongsTo(Region::class,"region_id");
    }
    public function city(){
        return $this->belongsTo(City::class);
    }
    public function counters(){
        return $this->hasMany(Counter::class);
    }
}
