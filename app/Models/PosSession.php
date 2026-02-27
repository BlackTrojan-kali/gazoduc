<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosSession extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'boutique_id',
        'opened_at',
        'closed_at',
        'opening_balance',
        'closing_balance',
        'status',
    ];

    /**
     * Les attributs qui doivent être castés (convertis) vers des types natifs.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'opened_at' => 'datetime', 
        'closed_at' => 'datetime',
        'opening_balance' => 'decimal:2',
        'closing_balance' => 'decimal:2',
    ];

    /**
     * Relation : Une session de caisse appartient à un caissier (User).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation : Une session de caisse est ouverte dans une boutique spécifique.
     */
    public function boutique(): BelongsTo
    {
        return $this->belongsTo(Boutique::class);
    }

    /**
     * Relation future : Une session de caisse contiendra plusieurs ventes.
     * Décommentez ceci lorsque le modèle Sale sera créé.
     */
    /*
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
    */
}