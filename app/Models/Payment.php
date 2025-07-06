<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    //

    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }

    public function bank(){
        return $this->belongsTo(Bank::class,"agency_id");
    }
}
