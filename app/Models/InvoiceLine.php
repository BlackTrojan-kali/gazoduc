<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceLine extends Model
{
    //
    protected $fillable=[
        
            "invoice_id",
            "item_type",
            "amount",
    ];
}
