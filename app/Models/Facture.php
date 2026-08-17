<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{ 
    // Types possibles de facture
    public const TYPE_VENTE = 'vente';
    public const TYPE_CONSIGNE = 'consigne';

    protected $fillable = [
        'client_id',
        'user_id',
        'agency_id',
        'total_amount',
        'currency',
        'status', // Statut de la facture
        'invoice_type', // vente ou consigne
        'licence',
    ];

    // Relations
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class, 'agency_id');
    }

    public function items()
    {
        return $this->hasMany(FactureItem::class);
    }

    public function mouvements()
    {
        return $this->hasMany(Mouvement::class);
    }

    public function payments()
    {
        return $this->belongsToMany(Payment::class, 'facture_payments')
                    ->withPivot('amount')
                    ->withTimestamps();
    }
}
