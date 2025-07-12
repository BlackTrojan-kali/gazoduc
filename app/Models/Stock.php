<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    //
  
    protected $fillable = [
        'article_id',
        'agency_id',
        'storage_type',
        'quantity',
        'theorical_quantity',// Nouveau champ, défini à null
        'citerne_id'
    ];

    // Relations (facultatif mais recommandé)
    public function article()
    {
        return $this->belongsTo(Article::class,"article_id");
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class,"agency_id");
    }
    public function citerne(){
        return $this->belongsTo(Citerne::class,"citerne_id");
    }
}
