<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionHistory extends Model
{
    //

    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }

    public function citerne(){
        return $this->belongsTo(Citerne::class,"source_citerne_id");
    }

    public function mouvement(){
        return $this->belongsTo(Mouvement::class,"production_movement_id");
    }
}
