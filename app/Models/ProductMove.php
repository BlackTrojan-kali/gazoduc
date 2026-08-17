<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductMove extends Model
{
    //
    protected $fillable= [
        
        "product_id",        
        "boutique_id",
        "qty",
        "type",
        "label",
        "departure",
        "destination",
        "user_id",
        "move_id",
        "remaining_stock"
    ];
    public function product(){
        return $this->belongsTo(Product::class);
    }
    public function boutique(){
        return $this->belongsTo(Boutique::class);   
    }
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function move(){
        return $this->belongsTo(ProductMove::class,"move_id");
    }
}
