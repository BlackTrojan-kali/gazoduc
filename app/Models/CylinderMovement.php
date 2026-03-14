<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CylinderMovement extends Model
{
    use HasFactory;

    /**
     * Les attributs assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'cylinder_id',
        'agency_id',
        'user_id',
        'client_id',
        'movement_type',
        'document_reference',
    ];

    /**
     * RELATION : La bouteille qui a été déplacée.
     */
    public function cylinder()
    {
        return $this->belongsTo(Cylinder::class);
    }

    /**
     * RELATION : L'agence/le site où le mouvement a été enregistré.
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * RELATION : L'utilisateur (magasinier, chauffeur) qui a validé le mouvement.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * RELATION : Le client concerné (peut être nul si c'est un transfert inter-site).
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}