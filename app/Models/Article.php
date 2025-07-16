<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    //
    public function stock(){
        return $this->hasMany(Stock::class);
    }
    public function entreprise(){
        return $this->belongsTo(Entreprise::class,"entreprise_id");
    }
    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
}
