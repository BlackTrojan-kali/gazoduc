<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgencyTransferSlip extends Model
{
    use HasFactory;

    /**
     * Les attributs assignables en masse.
     */
    protected $fillable = [
        'reference',
        'source_agency_id',
        'destination_agency_id',
        'vehicule_id',
        'driver_id',
        'status',
        'departure_date',
        'arrival_date',
        'created_by',
        'notes',
    ];

    /**
     * Les conversions de types.
     */
    protected $casts = [
        'departure_date' => 'datetime',
        'arrival_date' => 'datetime',
    ];

    /**
     * Agence d'origine.
     */
    public function sourceAgency(): BelongsTo
    {
        return $this->belongsTo(Agency::class, 'source_agency_id');
    }

    /**
     * Agence de destination.
     */
    public function destinationAgency(): BelongsTo
    {
        return $this->belongsTo(Agency::class, 'destination_agency_id');
    }

    /**
     * Véhicule assigné au transfert.
     */
    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicule::class);
    }

    /**
     * Chauffeur assigné au transfert.
     */
    public function driver(): BelongsTo
    {
        // Changez User::class par Driver::class si nécessaire
        return $this->belongsTo(Chauffeur::class, 'driver_id'); 
    }

    /**
     * Utilisateur ayant créé le bordereau.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Les bouteilles physiques contenues dans ce transfert.
     */
    public function items(): HasMany
    {
        return $this->hasMany(AgencyTransferItem::class);
    }
}