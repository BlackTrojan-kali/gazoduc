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
     * The bordereau de route instance.
     *
     * @var Bordereau_route
     */
    public $bordereau;

    /**
     * Create a new notification instance.
     *
     * @param Bordereau_route $bordereau
     */
    public function __construct(Bordereau_route $bordereau)
    {
        $this->bordereau = $bordereau;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        // Construction du message de notification.
        $message = "Un nouveau bordereau de route (ID: {$this->bordereau->id}) est en route de l'agence de départ '{$this->bordereau->departure->name}' vers votre agence '{$this->bordereau->arrival->name}'.";
        
        // Ajout des détails pour le chauffeur et le véhicule.
        $message .= " Le véhicule est '{$this->bordereau->vehicule->name}' conduit par '{$this->bordereau->chauffeur->name}'.";
        
        // Ajout de la date de départ.
        $message .= " Départ le {$this->bordereau->departure_date}.";

        return [
            'message' => $message,
            'bordereau_id' => $this->bordereau->id,
            'departure_agency' => $this->bordereau->departure->name,
            'arrival_agency' => $this->bordereau->arrival->name,
            'vehicule' => $this->bordereau->vehicule->name,
            'chauffeur' => $this->bordereau->chauffeur->name,
            'date_depart' => $this->bordereau->departure_date,
        ];
    }
}
