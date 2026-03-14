<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_number',
        'gas_id',
        'production_date',
        'expiry_date',
        "status"
    ];

    /**
     * Convertit automatiquement ces colonnes en instances Carbon (manipulation des dates facilitée).
     */
    protected $casts = [
        'production_date' => 'date',
        'expiry_date' => 'date',
    ];

    /**
     * RELATION : Un lot de production concerne un seul type de gaz.
     */
    public function gas()
    {
        return $this->belongsTo(Gas::class);
    }
}