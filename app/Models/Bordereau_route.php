<?php

namespace App\Models;

use App\Notifications\BordereauNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Notifications\Notifiable;

class Bordereau_route extends Model
{
    use Notifiable;

    protected $fillable = [
        "vehicule_id",
        "chauffeur_id",
        "co_chauffeur_id",
        "departure_location_id",
        "arrival_location_id",
        "arrival_date",
        "departure_date",
        "status",
    ];

    /**
     * Get the departure agency associated with the bordereau route.
     */
    public function departure(): BelongsTo
    {
        return $this->belongsTo(Agency::class, "departure_location_id");
    }

    /**
     * Get the arrival agency associated with the bordereau route.
     */
    public function arrival(): BelongsTo
    {
        return $this->belongsTo(Agency::class, "arrival_location_id");
    }

    /**
     * Get the primary driver for the bordereau route.
     */
    public function chauffeur(): BelongsTo
    {
        return $this->belongsTo(Chauffeur::class, "chauffeur_id");
    }

    /**
     * Get the co-driver for the bordereau route.
     */
    public function co_chauffeur(): BelongsTo
    {
        return $this->belongsTo(Chauffeur::class, "co_chauffeur_id");
    }

    /**
     * Get the vehicle for the bordereau route.
     */
    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicule::class, "vehicule_id");
    }
    
    /**
     * Get the packages for the bordereau route.
     */
    public function packages(): HasMany
    {
        return $this->hasMany(Package::class, "bordereau_route_id");
    }
    
    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::created(function ($bordereau) {
            // NOTE: Replace `User` with your actual User model class if it's in a different namespace.
            // Retrieve users to be notified in a single optimized query.
            $usersToNotify = User::where(function ($query) use ($bordereau) {
                // Condition 1: Users at the arrival agency with 'magasin' or 'controleur' roles.
                $query->where('agency_id', $bordereau->arrival_location_id)
                      ->whereHas('role', function ($q) {
                          $q->whereIn('name', ['magasin', 'controleur']);
                      });
            })->orWhere(function ($query) {
                // Condition 2: Users with the 'direction' role and no associated agency.
                $query->whereNull('agency_id')
                      ->whereHas('role', function ($q) {
                          $q->where('name', 'direction');
                      });
            })->get();
            
            // Send the notification to each unique user found.
            foreach ($usersToNotify as $user) {
                $user->notify(new BordereauNotification($bordereau));
            }
        });
    }
}