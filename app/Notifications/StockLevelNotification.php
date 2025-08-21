<?php

namespace App\Notifications;

use App\Models\Stock;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class StockLevelNotification extends Notification
{
    use Queueable;

    /**
     * L'instance du stock concerné par la notification.
     *
     * @var Stock
     */
    public $stock;

    /**
     * Crée une nouvelle instance de la notification.
     *
     * @param Stock $stock
     */
    public function __construct(Stock $stock)
    {
        $this->stock = $stock;
    }

    /**
     * Obtient les canaux de diffusion de la notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['database']; // Nous utiliserons le canal de base de données pour la table de notifications.
    }

    /**
     * Obtient la représentation de la notification en tant que tableau.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'message' => "Le stock de l'article '{$this->stock->article->name}' de l'agence '{$this->stock->agency->name}' est tombé à {$this->stock->quantity}.",
            'article_id' => $this->stock->article_id,
            'article_name' => $this->stock->article->name,
            'agency_id' => $this->stock->agency_id,
            'agency_name' => $this->stock->agency->name,
            'current_quantity' => $this->stock->quantity
        ];
    }
}
