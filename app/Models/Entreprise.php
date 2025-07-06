<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    //
    public function agency(){
        return $this->hasMany(Agency::class);
    }
    public function subcription(){
        return $this->hasOne(Subscription::class);
    }
}
