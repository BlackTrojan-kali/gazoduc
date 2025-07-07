<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    //
    protected $fillable=[
        "user_id",
        "notification_type",
        "message",
        "is_read"
    ];
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }

    public function user(){
        return $this->belongsTo(User::class,"agency_id");
    }
}
