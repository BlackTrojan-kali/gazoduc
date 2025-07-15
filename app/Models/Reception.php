<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reception extends Model
{
    //

    public function agency(){
        return $this->belongsTo(Agency::class,"destination_agency_id");
    }

    public function citerne(){
        return $this->belongsTo(Citerne::class,"citerne_mobile_id");
    }
    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
    public function user(){
        return $this->belongsTo(User::class,"recorded_id_user");
    }
}
