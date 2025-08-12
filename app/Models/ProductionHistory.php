<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductionHistory extends Model
{
    use SoftDeletes;
    //

    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }

    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
    public function citerne(){
        return $this->belongsTo(Citerne::class,"source_citerne_id");
    }

    public function mouvement(){
        return $this->belongsTo(Mouvement::class,"production_movement_id");
    }
    public function user(){
        return $this->belongsTo(User::class,"recorded_by_user_id");
    }
}
