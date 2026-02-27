<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'supplier_id',
        'reference',
        'status',
        'order_date',
        'boutique_id', // <-- AJOUT ICI
        'expected_delivery_date',
        'total_amount',
    ];

    /**
     * Les attributs qui doivent être castés (convertis).
     *
     * @var array<string, string>
     */
    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Relation : Un bon de commande appartient à un seul fournisseur.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
public function boutique(): BelongsTo
    {
        return $this->belongsTo(Boutique::class);
    }
    /**
     * Relation future : Un bon de commande contient plusieurs lignes (articles).
     * Décommentez ceci lorsque le modèle PurchaseOrderLine sera créé.
     */
    
    public function lines(): HasMany
    {
        return $this->hasMany(PurchaseOrderLine::class);
    }


    /**
     * Relation future : Un bon de commande peut générer plusieurs bons de réception (livraisons partielles).
     * Décommentez ceci lorsque le modèle Receipt sera créé.
     */
    /*
    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class);
    }
    */
}