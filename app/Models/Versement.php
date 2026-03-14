<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Versement extends Model
{
    //
    protected $fillable=[
            "invoice_id",
           "amount_paid",
            "payment_method",
    ];
}
