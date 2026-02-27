<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Productcategory extends Model
{
    //
    protected $fillable =[
        
            "name",
            "parent_id"
    ];

    public function products(){
        return $this->hasMany(Product::class,);
    }
    public function parent(){
        return $this->belongsTo(Productcategory::class,"id","parent_id");
    }
}
