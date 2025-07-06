<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Citerne extends Model
{
    //
    
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }
}
