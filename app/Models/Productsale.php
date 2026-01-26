<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Productsale extends Model
{
    //
    protected $fillable= [
        "boutique_id", "user_id", "customer_id", "code_facture", "total_ht", "total_tva", "total_ttc", "amount_paid",
"payment_mode", "status", "sync_status"
    ];
    public function boutique(){
        return $this->belongsTo(Boutique::class);

    }
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function customer(){
        return $this->belongsTo(Customer::class);
    }
}
