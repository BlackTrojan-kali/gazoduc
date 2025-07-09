<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscribeHistory extends Model
{
    //
    public function entreprise(){
        return $this->belongsTo(Entreprise::class,"entreprise_id");
    }
    public function licence(){
        return $this->belongsTo(Licence::class,"licence_id");
    }
}
