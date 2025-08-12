<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Depotage extends Model
{
    use SoftDeletes;
    //

    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }
    public function citerne_fixe(){
        return $this->belongsTo(Citerne::class,"citerne_fixe_id");
    }
    public function citerne_mobile(){
        return $this->belongsTo(Citerne::class,"citerne_mobile_id");
    }
    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
    public function user(){
        return $this->belongsTo(User::class,"recorded_by_user_id");
    }
}
