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
     * Affiche l'historique filtrable des sessions de caisse (Vision Contrôleur/Directeur)
     */
    public function index(Request $request)
    {
        // 1. Initialisation de la requête avec les relations
        $query = PosSession::with(['user', 'boutique']);

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

        // 3. Filtre par Boutique
        if ($request->filled('boutique_id')) {
            $query->where('boutique_id', $request->boutique_id);
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
        $boutiques = Boutique::orderBy('name')->get(['id', 'name']);

        return Inertia::render('DirBoutique/Pos/SessionIndex', [
            'sessions'  => $sessions,
            'boutiques' => $boutiques,
            'filters'   => $request->only(['search', 'boutique_id', 'status', 'date_start', 'date_end']),
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'boutique_id'     => ['required', 'exists:boutiques,id'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
        ]);

        // Vérifier si l'utilisateur n'a pas déjà une session ouverte
        $hasOpenSession = PosSession::where('user_id', Auth::user()->id)
                                    ->where('status', 'ouvert')
                                    ->exists();

        if ($hasOpenSession) {
            return back()->withErrors(['message' => 'Vous avez déjà une session de caisse ouverte.']);
        }

        PosSession::create([
            'user_id'         => Auth::user()->id,
            'boutique_id'     => $validated['boutique_id'],
            'opening_balance' => $validated['opening_balance'],
            'opened_at'       => now(),
            'status'          => 'ouvert',
        ]);

        return redirect()->back()->with('success', 'Session de caisse ouverte avec succès.');
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