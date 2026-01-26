<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    //
    protected $fillable= [
        "category_id", 
        "designation", 
        "sku", 
        "barcode", 
        "prix_achat", 
        "prix_vente",
        "tva",
        "unité",
        "stock_alerte"
    ];

    public function category (){
    return $this->belongsTo(Productcategory::class);
    }
    public function stocks (){
        return $this->hasMany(Productstock::class,"product_id","id");
    }
}
