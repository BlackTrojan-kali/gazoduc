<?php

namespace App\Http\Controllers;

use App\Models\PosSession;
use App\Models\Boutique;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class PosSessionController extends Controller
{
    /**
     * Affiche l'historique filtrable des sessions de caisse.
     * Directeur : Voit toutes les sessions de toutes les boutiques.
     * Contrôleur : Ne voit que les sessions de sa propre boutique.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // DÉTERMINATION DU RÔLE
        $isDirecteur = $user->role->name === 'direction'; 

        // 1. Initialisation de la requête avec les relations
        $query = PosSession::with(['user', 'boutique']);

        // --- LA RÈGLE D'OR : CONTRÔLEUR VS DIRECTEUR ---
        // On verrouille la requête sur la boutique du contrôleur
        if (!$isDirecteur) {
            $query->where('boutique_id', $user->boutique_id);
        }

        // 2. Filtre par Recherche (Nom du caissier ou ID de session)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // 3. Filtre par Boutique (Seulement pour le Directeur)
        if ($request->filled('boutique_id')) {
            if ($isDirecteur) {
                $query->where('boutique_id', $request->boutique_id);
            }
            // Si pas directeur, on ignore ce paramètre de l'URL car on a déjà verrouillé sa boutique plus haut
        }

        // 4. Filtre par Statut (ex: 'ouvert', 'ferme')
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 5. Filtre par Plage de Dates (ex: du 01/02 au 15/02)
        if ($request->filled('date_start')) {
            $query->whereDate('opened_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('opened_at', '<=', $request->date_end);
        }

        // 6. Tri et Pagination (Les plus récentes en premier)
        $sessions = $query->latest('opened_at')
                          ->paginate(15)
                          ->withQueryString();

        // 7. Données pour les menus déroulants des filtres
        // Le directeur a besoin de toute la liste. Le contrôleur n'a besoin d'aucune (ou juste la sienne).
        if ($isDirecteur) {
            $boutiques = Boutique::orderBy('name')->get(['id', 'name']);
        } else {
            $boutiques = Boutique::where('id', $user->boutique_id)->get(['id', 'name']);
        }

        return Inertia::render('DirBoutique/Pos/SessionIndex', [
            'sessions'    => $sessions,
            'boutiques'   => $boutiques,
            'isDirecteur' => $isDirecteur, // Toujours utile de l'envoyer à React pour masquer le champ "Boutique"
            'filters'     => $request->only(['search', 'boutique_id', 'status', 'date_start', 'date_end']),
        ]);
    }


    /**
     * Affiche les détails d'une session spécifique (avec toutes ses ventes)
     */
    public function show(PosSession $session)
    {
        // On charge la session avec le caissier, la boutique et l'historique des ventes
        // (À activer lorsque le modèle Sale sera prêt)
        $session->load(['user', 'boutique' /*, 'sales.items.product'*/]);

        return Inertia::render('DirBoutique/Pos/SessionShow', [
            'session' => $session,
        ]);
    }

    /**
     * Ouvre une nouvelle session de caisse (Généralement appelé par le caissier au matin)
     */
    /**
     * Ouvre une nouvelle session de caisse.
     */
    public function openSession(Request $request)
    {
        $validated = $request->validate([
            'opening_balance' => ['required', 'numeric', 'min:0'],
        ]);

        $user = Auth::user();

        // 1. Vérifier qu'il n'y a pas déjà une session ouverte pour cet utilisateur
        $activeSession = PosSession::where('user_id', $user->id)
            ->where('boutique_id', $user->boutique_id)
            ->where('status', 'open')
            ->first();

        if ($activeSession) {
            return back()->withErrors(['message' => 'Vous avez déjà une session de caisse ouverte.']);
        }

        // 2. Créer la nouvelle session
        PosSession::create([
            'user_id'         => $user->id,
            'boutique_id'     => $user->boutique_id,
            'opening_balance' => $validated['opening_balance'],
            'opened_at'       => now(),
            'status'          => 'open',
        ]);

        return redirect()->back()->with('success', 'Votre session de caisse est désormais ouverte. Bonnes ventes !');
    }

    /**
     * Clôture une session de caisse (Fermeture le soir)
     */
    public function update(Request $request, PosSession $session)
    {
        $validated = $request->validate([
            'closing_balance' => ['required', 'numeric', 'min:0'],
        ]);

        if ($session->status === 'ferme') {
            return back()->withErrors(['message' => 'Cette session est déjà clôturée.']);
        }

        $session->update([
            'closing_balance' => $validated['closing_balance'],
            'closed_at'       => now(),
            'status'          => 'ferme',
        ]);

        // Optionnel : Vous pourrez ici comparer closing_balance avec les ventes réelles
        // pour calculer l'écart de caisse (manquant ou surplus)

        return redirect()->back()->with('success', 'Session de caisse clôturée avec succès.');
    }
}