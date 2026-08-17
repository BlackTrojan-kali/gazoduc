<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductionHistory extends Model
{
    use SoftDeletes;
    //
    protected $fillable =[
 "source_citerne_id",
   "vehicle_id",
   "article_id",
   "quantity_produced",
   "total_weight_produced",
   "production_movement_id",
   "agency_id",
    "recorded_by_user_id",
    "stock_citern",
           
    ];
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }

    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
    public function citerne(){
        return $this->belongsTo(Citerne::class,"source_citerne_id");
    }

    public function mouvement(){
        return $this->belongsTo(Mouvement::class,"production_movement_id");
    }
    public function user(){
        return $this->belongsTo(User::class,"recorded_by_user_id");
    }
    public function vehicle(){
        return $this->belongsTo(Vehicule::class,"vehicle_id");
    }
}
