<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boutiquepayment extends Model
{
    //
    protected $fillable = [
        
        "counter_id",
        "user_id",
        "amount",
        "label",
        "reference",
    ];
    public function counter(){
        return $this->belongsTo(Counter::class);
    
    }
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function productsales(){
        return $this->belongsToMany(Productsale::class,"boutiquepayment_productsales");
    }
}
