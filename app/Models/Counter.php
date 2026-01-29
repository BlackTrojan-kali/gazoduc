<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Counter extends Model
{
    //
    protected $fillable = [
        "boutique_id",
        "transfert_point",
         "name",
         "type",
    ];

    public function boutique(){
        return $this->belongsTo(Boutique::class,"boutique_id");
    }
    public function user(){
        return $this->hasMany(User::class);
    }
}
