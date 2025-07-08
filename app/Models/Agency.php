<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    //
    public function entreprise(){
        return $this->belongsTo(Entreprise::class,"entreprise_id");
    }
    public function licence(){
        return $this->belongsTo(Licence::class,"licence_id");
    }
    public function region(){
        return $this->belongsTo(Region::class,"region_id");
    }
    public function city(){
        return $this->belongsTo(City::class);
    }
}
