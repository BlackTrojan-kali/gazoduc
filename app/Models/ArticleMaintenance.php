<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleMaintenance extends Model
{
    /**
     * Les attributs qui peuvent être assignés en masse.
     */
    protected $fillable = [
        'article_id',          // La bouteille concernée.
        'agency_id',           // L'agence qui a envoyé la bouteille en maintenance.
        'recorded_by_user_id', // L'utilisateur qui a validé l'envoi.
        'type',                // Type d'intervention (ex: 'epreuve', 'peinture', 'reparation_vanne').
        'status',              // L'état de la maintenance (ex: 'en_cours', 'terminee', 'rejetee').
        'start_date',          // Date d'envoi.
        'end_date',            // Date de retour (nullable, remplie quand elle revient).
        'provider',            // Le nom de l'entreprise ou du service qui fait la réparation (nullable).
        'cost',                // Coût de l'intervention (nullable).
        'observations',        // (Optionnel) Notes du technicien
    ];

    /**
     * Les conversions de types automatiques.
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'cost'       => 'decimal:2', // Convertit automatiquement en décimal avec 2 chiffres après la virgule
    ];

    /**
     * Relation : La bouteille concernée par la maintenance
     */
    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * Relation : L'agence ayant initié la maintenance
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * Relation : L'utilisateur ayant enregistré le mouvement
     */
    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }
}