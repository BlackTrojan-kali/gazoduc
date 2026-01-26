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
}
