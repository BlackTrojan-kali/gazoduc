<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cylinder extends Model
{
    use HasFactory;

    /**
     * Les attributs assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'serial_number',
        'barcode',
        'cylinder_type_id',
        'current_agency_id', // NOUVEAU : Localisation multi-site
        'gas_id',            // NOUVEAU : Produit exclusif affecté
        'tare_weight',
        'last_test_date',
        'status',
    ];

    /**
     * Les conversions de types.
     */
    protected $casts = [
        'last_test_date' => 'date',
        'tare_weight' => 'float',
    ];

    /**
     * RELATION : Format d'emballage (Ex: B50).
     */
    public function cylinderType()
    {
        return $this->belongsTo(CylinderType::class);
    }

    /**
     * RELATION : Agence / Site actuel de la bouteille.
     */
    public function currentAgency()
    {
        return $this->belongsTo(Agency::class, 'current_agency_id');
    }

    /**
     * RELATION : Type de gaz exclusivement autorisé pour cette bouteille.
     */
    public function gas()
    {
        return $this->belongsTo(Gas::class);
    }
}