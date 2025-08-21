<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification; // Assurez-vous d'avoir un modèle de Notification
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Marque une notification spécifique comme lue.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $notificationId
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(Request $request, string $notificationId)
    {
        // 1. Assurez-vous que l'utilisateur est authentifié
        $user = Auth::user();
     
        // 2. Trouvez la notification par son ID et assurez-vous qu'elle appartient à l'utilisateur
        $notification = $user->notifications()->where('id', $notificationId)->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification introuvable.'], 404);
        }

        // 3. Si la notification n'a pas encore été lue, marquez-la comme lue
        if ($notification->read_at === null) {
            $notification->markAsRead(); // Cette méthode est incluse dans les notifications de Laravel
        }

        return back()->with('info','Notification marquée comme lue.');
    }

    /**
     * Marque toutes les notifications non lues de l'utilisateur comme lues.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
     
        // 2. Ciblez toutes les notifications non lues pour l'utilisateur
        $user->unreadNotifications->markAsRead();

        return back()->with('info', 'Toutes les notifications ont été marquées comme lues.');
    }
}