<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscribeHistory extends Model
{
    //
    public function subs(){
        return $this->belongsTo(Subscription::class,"subs_id");
    }
}
