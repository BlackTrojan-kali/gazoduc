<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnassociatedFacture extends Model
{
    protected $fillable = ['product_sales_id'];

    // C'est la partie la plus importante pour que ça fonctionne
    protected $casts = [
        'product_sales_id' => 'array', 
    ];
}