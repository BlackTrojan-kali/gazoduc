<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Productsaleitem extends Model
{
    //
    protected $fillable = [
         "product_id",
        "sale_id",
         "qty",
         "unit_price",
         "discount",
         "sub_total",
    ];
    
    public function product(){
        return $this->belongsTo(Product::class);
    }
    public function sale(){
        return $this->belongsTo(Productsale::class,"sale_id");
    }
}
