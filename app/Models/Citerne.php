<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Citerne extends Model
{
    //
    protected $fillable = [
        'name',
        'agency_id',
        'entreprise_id',
        'current_product_id',
        'type',
        'product_type',
        'capacity_liter',
        'capacity_kg',
    ];
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }
    public function entreprise(){
        return $this->belongsTo(Entreprise::class,"entreprise_id");
    }
    public function article(){
        return $this->belongsTo(Article::class,"current_product_id");
    }
    public function stock(){
        return $this->hasOne(Stock::class);
    }
    public function pompes(): BelongsToMany
{
    // Utilisation de la table pivot que vous avez spécifiée: "pompe_citernes"
    return $this->belongsToMany(Pompe::class, "pompe_citernes");
}
}
