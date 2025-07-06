<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleCategoryPrice extends Model
{
    //

    public function category(){
        return $this->belongsTo(ClientCategory::class,"client_category_id");
    }

    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
}
