<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FuelSale extends Model
{
    protected $fillable = [
        'citerne_id',
        'agency_id',
        'article_id',
        'user_id',
        'client_id',
        'total_price',
        'sub_total',
        'unitPrice', // Si vous avez suivi ma suggestion de renommage en snake_case
        'quantity',
        'status',
    ];
    //
    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
    public function user(){
        return $this->belongsTo(User::class,"user_id");
    }
    
    public function agency(){
        return $this->belongsTo(agency::class,"agency_id");
    }
    
    public function citerne(){
        return $this->belongsTo(Citerne::class,"citerne_id");
    }
    
    public function client(){
        return $this->belongsTo(Client::class,"client_id");
    }
}
