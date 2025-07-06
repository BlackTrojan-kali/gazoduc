<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    //
    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
}
