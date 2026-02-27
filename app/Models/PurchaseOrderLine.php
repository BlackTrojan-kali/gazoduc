<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderLine extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'quantity_ordered',
        'quantity_recieved', // J'ai gardé l'orthographe exacte de votre migration
        'unit_price',
        'subtotal',
    ];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity_ordered'  => 'float',
        'quantity_recieved' => 'float',
        'unit_price'        => 'float',
        'subtotal'          => 'float',
    ];

    /**
     * Relation : Une ligne appartient à un bon de commande.
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Relation : Une ligne concerne un produit spécifique du catalogue.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}