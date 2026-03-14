<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FillingRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'cylinder_id',
        'production_batch_id',
        'storage_tank_id',
        'filled_by',
        'volume_filled',
    ];

    // Relations pour récupérer les informations dans l'historique
    public function cylinder() { return $this->belongsTo(Cylinder::class); }
    public function batch() { return $this->belongsTo(ProductionBatch::class, 'production_batch_id'); }
    public function tank() { return $this->belongsTo(StorageTank::class, 'storage_tank_id'); }
    public function operator() { return $this->belongsTo(User::class, 'filled_by'); }
}