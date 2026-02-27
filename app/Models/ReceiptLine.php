<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceiptLine extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'receipt_id',
        'product_id',
        'quantity_accepted',
        'quantity_rejected',
        'service',
        'boutique_id',
    ];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity_accepted' => 'float',
        'quantity_rejected' => 'float',
    ];

    /**
     * Relation : Cette ligne appartient à un bon de réception précis.
     */
    public function receipt(): BelongsTo
    {
        return $this->belongsTo(Receipt::class);
    }

    /**
     * Relation : Le produit physique qui est réceptionné.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relation : La boutique physique où la marchandise est déchargée.
     */
    public function boutique(): BelongsTo
    {
        return $this->belongsTo(Boutique::class);
    }
}