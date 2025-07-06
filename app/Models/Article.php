<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    //
    public function stock(){
        return $this->hasOne(Stock::class);
    }
}
