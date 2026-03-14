<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrderLine extends Model
{
    //
    protected $fillable = [
        
            "purchase_order_id",
            "item_type",
            "description",
            "quantity",
            "unit_price",
    ];
}
