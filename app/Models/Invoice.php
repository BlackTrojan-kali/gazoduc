<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    //
    protected $fillable = [

           "client_id",
            "agency_id",
            "user_id",
            "total_gas_amount",
            "total_deposit_amount",
            "status",
    ];
}
