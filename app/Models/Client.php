<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    //

    public function category(){
        return $this->belongsTo(ClientCategory::class,"client_category_id");
    }
}
