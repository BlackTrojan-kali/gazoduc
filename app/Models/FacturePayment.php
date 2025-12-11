<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacturePayment extends Model
{
    //

    public function facture(){
        return $this->belongsTo(Facture::class,"facture_id");
    }

    public function payment(){
        return $this->belongsTo(Payment::class,"payment_id");
    }
}
