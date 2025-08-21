<?php

namespace App\Notifications;

use App\Models\Bordereau_route;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class BordereauNotification extends Notification
{
    use Queueable;

    /**
     * L'instance du bordereau de route concerné par la notification.
     *
     * @var Bordereau_route
     */
    public $bordereau;

    /**
     * Crée une nouvelle instance de la notification.
     *
     * @param Bordereau_route $bordereau
     */
    public function __construct(Bordereau_route $bordereau)
    {
        $this->bordereau = $bordereau;
    }

    /**
     * Obtient les canaux de diffusion de la notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        // Nous utilisons le canal de base de données pour stocker les notifications.
        return ['database'];
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
            'message' => "Un nouveau bordereau de route est en route de {$this->bordereau->departure->name} vers votre agence.",
            'bordereau_id' => $this->bordereau->id,
            'departure_agency' => $this->bordereau->departure->name,
            'arrival_agency' => $this->bordereau->arrival->name,
            'vehicule' => $this->bordereau->vehicule->name,
            'chauffeur' => $this->bordereau->chauffeur->name,
            'date_depart' => $this->bordereau->departure_date,
        ];
    }
}
