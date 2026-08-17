<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Productstock extends Model
{
    //
    protected $fillable= [
 
           "product_id",
            "boutique_id",
            "available_qty",
            "service"
              ];
    public function boutique(){
        return $this->belongsTo(Boutique::class);

    }
    public function product(){
        return $this->belongsTo(Product::class);
    }
}
