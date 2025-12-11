<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mouvement extends Model
{
    use SoftDeletes;
    //
    protected $fillable = [
        'article_id',
        'agency_id',
        'entreprise_id',
        'recorded_by_user_id',
        'movement_type',
        'quantity', // Quantité négative pour la sortie
        'facture_id',
    ];
    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }
    public function entreprise(){
        return $this->belongsTo(Agency::class,"entreprise_id");
    }
    public function user(){
        return $this->belongsTo(User::class,"recorded_by_user_id");
    }
}
