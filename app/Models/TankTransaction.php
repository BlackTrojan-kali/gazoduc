<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TankTransaction extends Model
{
    use HasFactory;

    /**
     * Les attributs qui peuvent être assignés en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'storage_tank_id',
        'transaction_type',
        'volume_change',
        'production_batch_id',
        'user_id',
    ];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'volume_change' => 'decimal:2',
    ];

    /**
     * Obtient le réservoir associé à la transaction.
     */
    public function storageTank(): BelongsTo
    {
        return $this->belongsTo(StorageTank::class);
    }

    /**
     * Obtient le lot de production associé à la transaction.
     */
    public function productionBatch(): BelongsTo
    {
        return $this->belongsTo(ProductionBatch::class);
    }

    /**
     * Obtient l'utilisateur ayant effectué la transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}