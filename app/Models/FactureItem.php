<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FactureItem extends Model
{
    //

    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }

    public function facture(){
        return $this->belongsTo(Facture::class,"agency_id");
    }
}
