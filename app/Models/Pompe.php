<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pompe extends Model
{
    // L'attribut 'table' est optionnel si le nom suit la convention (pompes)
    // protected $table = 'pompes'; 

    protected $fillable = [
        "name",
        "agency_id",
    ];

    /**
     * Une pompe appartient à une agence.
     */
    public function agency(): BelongsTo
    {
        // Correction de la méthode de relation (il faut 'return' la relation)
        return $this->belongsTo(Agency::class, "agency_id");
    }

    /**
     * Une pompe peut être reliée à plusieurs citernes (cuves).
     * C'est la relation 'plusieurs-à-plusieurs' dont nous parlions.
     * Table pivot standard: pompe_citerne
     */
    public function cuves(): BelongsToMany
    {
        // Utilisation de la table pivot que vous avez spécifiée: "pompe_citernes"
        return $this->belongsToMany(Citerne::class, "pompe_citernes");
    }
}