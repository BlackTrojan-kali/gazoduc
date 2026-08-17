<?php

namespace App\Models;

use App\Notifications\StockLevelNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Stock extends Model
{
    use Notifiable;

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

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($stock) {
            // Vérifie si la quantité est égale ou inférieure à 100 et si elle a été modifiée.
            if ($stock->quantity <= 10 && $stock->isDirty('quantity')) {
                // Détermine les rôles de stockage pertinents pour la notification.
                $rolesToNotify = ['controleur'];
                // La propriété storage_type du stock correspond au rôle.
                $rolesToNotify[] = $stock->storage_type;
                
                // Récupère les utilisateurs à notifier en une seule requête optimisée.
                $usersToNotify = User::where(function ($query) use ($stock, $rolesToNotify) {
                    // Condition 1: Utilisateurs de l'agence avec les rôles spécifiés.
                    $query->where('agency_id', $stock->agency_id)
                          ->whereHas('role', function ($q) use ($rolesToNotify) {
                              $q->whereIn('name', $rolesToNotify);
                          });
                })->orWhere(function ($query) {
                    // Condition 2: Utilisateurs "direction" sans agence.
                    $query->where('agency_id', null)
                          ->whereHas('role', function ($q) {
                              $q->where('name', 'direction');
                          });
                })->get();
                
                // Envoie la notification à chaque utilisateur.
                foreach ($usersToNotify->unique() as $user) {
                    $user->notify(new StockLevelNotification($stock));
                }
            }
        });
    }
}