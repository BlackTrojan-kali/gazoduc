<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use SoftDeletes;
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
