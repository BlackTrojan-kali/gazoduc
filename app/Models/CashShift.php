<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashShift extends Model
{
    //
    protected $fillable = [
         "agency_id",
            "user_id",
            "opening_time",
            "closing_time",
           "expected_cash",
            "actual_cash_deposited",
          "difference",
          
    ];
}
