<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mouvement extends Model
{
    //
    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }
}
