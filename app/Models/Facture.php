<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{ 
    //

    protected $fillable = [
                'client_id',
                'user_id',
                'agency_id',
                'total_amount',
                'currency',
                'status', // Ou un autre statut par défaut si nécessaire
                'invoice_type',
                "licence",
    ];
    public function client(){
        return $this->belongsTo(Client::class,"client_id");
    }

    public function user(){
        return $this->belongsTo(User::class,"user_id");
    }
    public function agency(){
        return $this->belongsTo(Agency::class,"agency_id");
    }
    public function items(){
        return $this->hasMany(FactureItem::class);
    }
    public function mouvement(){
        return $this->hasMany(Mouvement::class);
    }
    public function payments()
{
    return $this->belongsToMany(Payment::class, 'facture_payments')
                ->withPivot('amount')
                ->withTimestamps();
}
}
