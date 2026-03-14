<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgencyTransferItem extends Model
{
    use HasFactory;

    /**
     * Les attributs assignables en masse.
     */
    protected $fillable = [
        'agency_transfer_slip_id',
        'cylinder_id',
        'cylinder_state',
    ];

    /**
     * Le bordereau auquel cet élément appartient.
     */
    public function transferSlip(): BelongsTo
    {
        return $this->belongsTo(AgencyTransferSlip::class, 'agency_transfer_slip_id');
    }

    /**
     * La bouteille physique spécifique liée à cette ligne.
     */
    public function cylinder(): BelongsTo
    {
        return $this->belongsTo(Cylinder::class);
    }
}