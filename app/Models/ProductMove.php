<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductMove extends Model
{
    //
    protected $fillable= [
         "product_id", "boutique_id", "type", "quantité", "motif",
"user_id"
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
}
