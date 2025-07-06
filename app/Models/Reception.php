<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reception extends Model
{
    //

    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }

    public function citerne(){
        return $this->belongsTo(Citerne::class,"citerne_mobile_id");
    }
}
