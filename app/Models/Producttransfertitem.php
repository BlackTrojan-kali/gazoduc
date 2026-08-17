<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producttransfertitem extends Model
{
    //
    protected $fillable = [
        
            "product_id",
            "tranfert_id",
            "move_id",
            "qty"
    ];

    public function product(){
        return $this->belongsTo(Product::class);
    }
    
    public function tranfert(){
        return $this->belongsTo(Producttransfert::class);
    }
    public function move(){
        return $this->belongsTo(ProductMove::class,"move_id");

    }
}
