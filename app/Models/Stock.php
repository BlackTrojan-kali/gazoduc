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
        return $this->belongsTo(Article::class);
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }
}
