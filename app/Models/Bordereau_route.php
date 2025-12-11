<?php

namespace App\Models;

use App\Notifications\BordereauNotification;
use Illuminate\Database\Eloquent\Model;
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
        "types",
        "notes"     
    ];

    public function departure(){
        return $this->belongsTo(Agency::class, "departure_location_id");
    }

    public function arrival(){
        return $this->belongsTo(Agency::class, "arrival_location_id");
    }

    public function chauffeur(){
        return $this->belongsTo(Chauffeur::class, "chauffeur_id");
    }

    public function co_chauffeur(){
        return $this->belongsTo(Chauffeur::class, "co_chauffeur_id");
    }

    public function vehicule(){
        return $this->belongsTo(Vehicule::class, "vehicule_id");
    }
    
    public function articles(){
        return $this->belongsToMany(Article::class, "article_bordereau_route", "bordereau_route_id", "article_id")->withPivot('qty');
    }
    
    /**
     * La méthode boot() est appelée au démarrage du modèle.
     * Nous y attachons un écouteur sur l'événement 'created' pour envoyer la notification.
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($bordereau) {
            // Récupère les utilisateurs à notifier en une seule requête optimisée.
            $usersToNotify = User::where(function ($query) use ($bordereau) {
                // Condition 1: Utilisateurs de l'agence de destination avec les rôles 'magasin' ou 'controleur'.
                $query->where('agency_id', $bordereau->arrival_location_id)
                      ->whereHas('role', function ($q) {
                          $q->whereIn('name', ['magasin', 'controleur']);
                      });
            })->orWhere(function ($query) {
                // Condition 2: Utilisateurs 'direction' sans agence.
                $query->where('agency_id', null)
                      ->whereHas('role', function ($q) {
                          $q->where('name', 'direction');
                      });
            })->get();
            
            // Envoie la notification à chaque utilisateur trouvé, en s'assurant qu'il n'y a pas de doublons.
            foreach ($usersToNotify->unique() as $user) {
                $user->notify(new BordereauNotification($bordereau));
            }
        });
    }
}