<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CiterneReading extends Model
{
    //

    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }

    public function citerne(){
        return $this->belongsTo(Citerne::class,"agency_id");
    }
}
