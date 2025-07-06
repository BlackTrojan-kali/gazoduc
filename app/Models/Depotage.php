<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Depotage extends Model
{
    //

    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }
}
