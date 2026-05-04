<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscribeHistory extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse (Mass Assignment).
     */
    protected $fillable = [
        'subs_id',
        'old_price',
        'new_price',
        'old_number_of_agencies',
        'new_number_of_agencies',
        'licence_name_at_time',
        'action_type',
    ];

    /**
     * Relation : Un historique appartient à un seul abonnement.
     */
    public function subscription()
    {
        return $this->belongsTo(Subscription::class, 'subs_id');
    }
}