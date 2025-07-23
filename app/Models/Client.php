<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    //
    protected $fillable =[
        "client_category_id",
        "client_type",
        "name",
        "phone_number",
        "email_address",
        "address",
        "NUI",
    ];
    public function category(){
        return $this->belongsTo(ClientCategory::class,"client_category_id");
    }
}
