<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FactureItem extends Model 
{
    //
    protected $fillable = [
            "facture_id",
            "article_id",
            "quantity",
            "unit_price",
            "subtotal"
    ];
    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }

    public function facture(){
        return $this->belongsTo(Facture::class,"facture_id");
    }
} 
