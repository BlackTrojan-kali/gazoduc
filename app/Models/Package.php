<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Package extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'bordereau_route_id',
        'article_id',
        'departure_agency_id',
        'arrival_agency_id',
        'qty',
        'status',
    ];

    /**
     * Get the bordereau route that the package belongs to.
     */
    public function bordereauRoute(): BelongsTo
    {
        return $this->belongsTo(Bordereau_route::class);
    }

    /**
     * Get the article (type of package) that the package belongs to.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * Get the agency from which the package was dispatched.
     */
    public function departureAgency(): BelongsTo
    {
        return $this->belongsTo(Agency::class, 'departure_agency_id');
    }

    /**
     * Get the agency where the package is expected to arrive.
     */
    public function arrivalAgency(): BelongsTo
    {
        return $this->belongsTo(Agency::class, 'arrival_agency_id');
    }
}