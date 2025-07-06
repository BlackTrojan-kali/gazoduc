<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    //

    public function client(){
        return $this->belongsTo(Client::class,"client_id");
    }

    public function user(){
        return $this->belongsTo(User::class,"user_id");
    }
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }
}
