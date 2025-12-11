<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FuelSaleCiterne extends Model
{                           
    //
    public function citernes()
{
    return $this->belongsToMany(Citerne::class, 'fuel_sale_citerne')
                ->withPivot('quantite')
                ->withTimestamps();
}

}
