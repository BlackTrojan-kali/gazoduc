<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PompeCiterne extends Model
{
    //
      public function pompe(){
        return $this->belongsTo(Pompe::class,"pompe_id");
    }

    public function citerne(){
        return $this->belongsTo(Citerne::class,"citerne_id");
    }
    
}
