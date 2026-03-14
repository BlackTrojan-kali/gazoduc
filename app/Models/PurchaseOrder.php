<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    //
    protected $fillable = [
        
            "supplier_id",
            "agency_id",
            "order_date",
            "expected_delivery-date",
            "status",
            "total_amount",
    ];
}
