<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Productsale extends Model
{
    //
    protected $fillable= [
        "boutique_id", "user_id", "customer_id", "facture_code", "total_ht", "total_tva", "total_ttc", "amount_paid",
"payment_mode", "status", "sync_status","counter_id"
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
    
    public function counter(){
        return $this->belongTo(Counter::class,"counter_id");
    }
    public function items(){
        return $this->hasMany(Productsaleitem::class,"sale_id");
    }
}
