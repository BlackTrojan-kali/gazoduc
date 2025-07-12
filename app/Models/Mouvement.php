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
    public function entreprise(){
        return $this->belongsTo(Agency::class,"entreprise_id");
    }
    public function user(){
        return $this->belongsTo(User::class,"recorded_by_user_id");
    }
}
