<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory,SoftDeletes;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'contact_name',
        'phone',
        'tax_id',
        'address',
        'payment_terms',
    ];

    /**
     * Relation future : Un fournisseur peut avoir plusieurs bons de commande.
     * Décommentez ceci lorsque le modèle PurchaseOrder sera créé.
     */
    /*
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }
    */
}