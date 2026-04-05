<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReleveIndex extends Model
{
    use HasFactory;

    /**
     * Spécifie le nom exact de la table pour éviter les erreurs 
     * de pluralisation de Laravel (indices vs index).
     *
     * @var string
     */
    protected $table = 'releves_index';

    /**
     * Les attributs assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'pistolet_id',
        'agency_id',
        'user_id',
        'index_ouverture',
        'index_fermeture',
        'volume_test',
        'volume_vendu',
        'prix_unitaire',
        'montant_total',
        'date_saisie',
        'status',
    ];

    /**
     * Le cast des attributs natifs.
     * Cela garantit que PHP manipule des chiffres exacts et des objets Carbon (dates).
     *
     * @var array<string, string>
     */
    protected $casts = [
        'index_ouverture' => 'decimal:2',
        'index_fermeture' => 'decimal:2',
        'volume_test'     => 'decimal:2',
        'volume_vendu'    => 'decimal:2',
        'prix_unitaire'   => 'decimal:2',
        'montant_total'   => 'decimal:2',
        'date_saisie'     => 'datetime',
    ];

    /**
     * Récupère le pistolet sur lequel cet index a été relevé.
     */
    public function pistolet(): BelongsTo
    {
        return $this->belongsTo(Pistolet::class);
    }

    /**
     * Récupère l'agence (la station-service) où a eu lieu la saisie.
     */
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * Récupère l'utilisateur (pompiste ou gérant) qui a effectué la saisie.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}