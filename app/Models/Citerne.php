<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Import ajouté pour la propreté

class Citerne extends Model
{
    protected $fillable = [
        'name',
        'agency_id',
        'entreprise_id',
        'current_product_id',
        'type',
        'product_type',
        'capacity_liter',
        'capacity_kg',
        
        // --- NOUVEAUX CHAMPS IOT & SONDES ---
        'sensor_token',     // Pour identifier la sonde (ESP32)
        'total_height_cm',  // Pour le calcul du volume
        'diameter_cm',      // Pour le calcul du volume
        'archived',         // Pour la gestion (soft delete "maison")
    ];

    // Relations existantes
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class, "agency_id");
    }

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Entreprise::class, "entreprise_id");
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class, "current_product_id");
    }

    // Attention : Assurez-vous que la table 'stocks' a bien une colonne 'citerne_id'
    // Sinon, cette relation ne fonctionnera pas par défaut.
    public function stock()
    {
        return $this->hasOne(Stock::class);
    }

    public function pompes(): BelongsToMany
    {
        return $this->belongsToMany(Pompe::class, "pompe_citernes");
    }

    // --- NOUVELLE RELATION ---
    
    /**
     * Récupérer l'historique des relevés (sondes ou manuels)
     */
    public function readings(): HasMany
    {
        return $this->hasMany(CiterneReading::class)->orderBy('created_at', 'desc');
    }

    /**
     * Helper pour obtenir le dernier relevé rapidement
     */
    public function lastReading()
    {
        return $this->hasOne(CiterneReading::class)->latestOfMany();
    }
}