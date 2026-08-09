<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $fillable = ['region_id', 'name', 'transport_cost_per_tonne'];
    //
    public function region(){
        return $this->belongsTo(Region::class,"region_id");
    }
}
