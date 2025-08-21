<?php

namespace App\Models;

use App\Notifications\BordereauNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Bordereau_route extends Model
{
    use Notifiable; // Permet au modèle d'envoyer des notifications

    protected $fillable = [
        "id Primary",
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
            // Récupère les utilisateurs de l'agence de destination.
            // Assurez-vous d'avoir une relation 'users' dans votre modèle Agency.
            // Par exemple : public function users() { return $this->hasMany(User::class); }
            $arrivalAgencyUsers = $bordereau->arrival->users;

            foreach ($arrivalAgencyUsers as $user) {
                // Envoie la notification à chaque utilisateur de l'agence de destination.
                $user->notify(new BordereauNotification($bordereau));
            }
        });
    }
}
