<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Receipt extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'purchase_order_id',
        'reference',
        "boutique_id",
        'received_at',
        'status',
    ];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'received_at' => 'datetime',
    ];

    /**
     * Relation : Un bon de réception est lié à un bon de commande.
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Relation future : Un bon de réception contient plusieurs lignes (produits réceptionnés).
     * Décommentez ceci lorsque le modèle ReceiptLine sera créé.
     */
    
    public function lines(): HasMany
    {
        return $this->hasMany(ReceiptLine::class);
    }
    public function boutique(){
        return $this->belongsTo(Boutique::class,"boutique_id");
    }
}