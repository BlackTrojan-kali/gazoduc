<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pistolet extends Model
{
    use HasFactory;

    /**
     * Les attributs assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'pompe_id',
        'citerne_id',
        'current_index',
        'is_active',
    ];

    /**
     * Le cast des attributs natifs.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'current_index' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Récupère la pompe à laquelle ce pistolet est rattaché.
     */
    public function pompe(): BelongsTo
    {
        return $this->belongsTo(Pompe::class);
    }

    /**
     * Récupère la citerne dans laquelle ce pistolet puise son produit.
     */
    public function citerne(): BelongsTo
    {
        return $this->belongsTo(Citerne::class);
    }

    /**
     * Récupère tout l'historique des relevés d'index de ce pistolet.
     * (En prévision de la table des relevés)
     */
    public function releves(): HasMany
    {
        return $this->hasMany(ReleveIndex::class);
    }
}