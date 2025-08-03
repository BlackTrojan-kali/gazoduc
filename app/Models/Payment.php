<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    //

    protected $fillable = [
        "user_id",
        "agency_id",
        "bank_id",
        "client_id",
        "amout",
        "type",
        "notes",
        "amout_notes",
        "bordereau",
    ];
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }

    public function bank(){
        return $this->belongsTo(Bank::class,"bank_id");
    }
    public function associated(){
        return $this->hasMany(FacturePayment::class);
    }
    public function client(){
        return $this->belongsTo(Client::class,"client_id");
    }
    public function factures(){
        return $this->belongsToMany(Facture::class,"facture_payments")
                ->withPivot('amount')
                ->withTimestamps();
    }
}
