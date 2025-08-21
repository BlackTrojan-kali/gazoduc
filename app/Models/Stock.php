<?php

namespace App\Models;

use App\Notifications\StockLevelNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Stock extends Model
{
    use Notifiable; // Permet au modèle d'envoyer des notifications

    protected $fillable = [
        'article_id',
        'agency_id',
        'storage_type',
        'quantity',
        'theorical_quantity',
        'citerne_id'
    ];

    // Relations
    public function article()
    {
        return $this->belongsTo(Article::class, "article_id");
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class, "agency_id");
    }

    public function citerne()
    {
        return $this->belongsTo(Citerne::class, "citerne_id");
    }

    /**
     * La méthode boot() est appelée au démarrage du modèle.
     * Nous y attachons un écouteur sur l'événement 'saving'.
     * C'est l'endroit parfait pour vérifier la quantité et envoyer la notification.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($stock) {
            // Vérifie si la quantité est égale ou inférieure à 10 et si elle a été modifiée.
            if ($stock->quantity <= 10 && $stock->isDirty('quantity')) {
                // Récupère tous les utilisateurs de l'agence.
                $agencyUsers = $stock->agency->users;

                // Filtre les utilisateurs pour ne garder que ceux qui ont le même rôle
                // que le type de stockage du stock.
                $usersToNotify = $agencyUsers->filter(function ($user) use ($stock) {
                    return $user->role->name === $stock->storage_type;
                });

                // Envoie la notification à chaque utilisateur filtré.
                foreach ($usersToNotify as $user) {
                    $user->notify(new StockLevelNotification($stock));
                }
            }
        });
    }
}
