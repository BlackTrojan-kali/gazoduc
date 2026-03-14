<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoodsReceipt extends Model
{
    //
    protected $fillable = [
            "purchase_order_id",
            "user_id",
            "delivery_note_number",
            
    ];
}
