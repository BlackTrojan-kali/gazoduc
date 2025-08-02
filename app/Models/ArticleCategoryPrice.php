<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model; 

class ArticleCategoryPrice extends Model
{
    //

    protected $fillable = [
        'article_id',
        'client_category_id', // Si vous liez directement à la catégorie de client
        'agency_id',
        'price',
        'consigne_price',
    ];
    public function category(){
        return $this->belongsTo(ClientCategory::class,"client_category_id");
    }

    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }
}
