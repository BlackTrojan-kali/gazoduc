<?php

namespace App\Http\Controllers;

use App\Models\Pompe;
use App\Models\Agency; // Supposons que ce modèle existe pour la relation
use App\Models\Citerne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia; // Ajout de l'import Inertia

use function PHPUnit\Framework\isEmpty;
use function PHPUnit\Framework\isNull;

class PompeController extends Controller
{
    /**
     * Affiche la liste de toutes les pompes.
     * Rendu vers le composant DirectionFuel/Pompes/Index.
     */
    public function index()
    {
        // Charge toutes les pompes avec leur agence associée et les cuves associées.
        // Utilisation de select() pour limiter les données transférées à Inertia.
        $pompes = Pompe::with(['agency:id,name', 'cuves:id,name,product_type'])
                        ->get();
        $agencies = Agency::all();
        $citernes = Citerne::where("product_type","produit_petrolier")->get();
        // Retourne la vue Inertia en passant les données des pompes
        return Inertia::render('DirectionFuel/Pompes/FuelPompes', [
            'pompes' => $pompes,
            'agencies' => $agencies,
            'citernes' => $citernes,
        ]);
    }


    /**
     * Enregistre une nouvelle pompe dans la base de données.
     */
    public function store(Request $request)
    {
        // Validation des données entrantes
        $request->validate([
            'name' => 'required|string|max:255',
            'agency_id' => 'required|exists:agencies,id',
        ], [
            'name.required' => 'Le nom de la pompe est requis.',
            'agency_id.required' => "L'agence est requise.",
            'agency_id.exists' => "L'agence sélectionnée n'est pas valide.",
        ]);

        try {
            Pompe::create([
                'name' => $request->name,
                'agency_id' => $request->agency_id,
            ]);

            // Redirection vers l'index avec un message flash de succès (Inertia)
            return redirect()->route('pompes.index')->with('success', 'Pompe créée avec succès.');
        } catch (\Exception $e) {
            Log::error("Erreur lors de la création de la pompe: " . $e->getMessage());
            // Retour en arrière avec un message flash d'erreur
            return back()->with('error', "Erreur lors de la création de la pompe: " . $e->getMessage());
        }
    }


    /**
     * Met à jour la pompe spécifiée dans la base de données.
     */
    public function update(Request $request, Pompe $pompe)
    {
        // Validation des données entrantes
        $request->validate([
            'name' => 'required|string|max:255',
            'agency_id' => 'required|exists:agencies,id',
        ], [
            'name.required' => 'Le nom de la pompe est requis.',
            'agency_id.required' => "L'agence est requise.",
            'agency_id.exists' => "L'agence sélectionnée n'est pas valide.",
        ]);

        try {
            $pompe->update([
                'name' => $request->name,
                'agency_id' => $request->agency_id,
            ]);

            // Redirection vers l'index avec un message flash de succès
            return redirect()->route('pompes.index')->with('success', 'Pompe mise à jour avec succès.');
        } catch (\Exception $e) {
            Log::error("Erreur lors de la mise à jour de la pompe: " . $e->getMessage());
            // Retour en arrière avec un message flash d'erreur
            return back()->with('error', "Erreur lors de la mise à jour de la pompe: " . $e->getMessage());
        }
    }

    /**
     * Supprime la pompe spécifiée de la base de données.
     */
    public function destroy(Pompe $pompe)
    {
        try {
            $pompe->delete();

            // Redirection vers l'index avec un message flash de succès
            return redirect()->route('pompes.index')->with('success', 'Pompe supprimée avec succès.');
        } catch (\Exception $e) {
            Log::error("Erreur lors de la suppression de la pompe: " . $e->getMessage());
            // Retour en arrière avec un message flash d'erreur
            return back()->with('error', "Erreur lors de la suppression de la pompe: " . $e->getMessage());
        }
    }
    // ... dans la classe PompeController

/**
 * Associe une pompe à une ou plusieurs citernes.
 */
public function associateCiternes(Request $request, Pompe $pompe)
{
    /*$request->validate([
        'citernes_to_associate' => 'required|array',
        'citernes_to_associate.*' => 'exists:citernes,id',
    ], [
        'citernes_to_associate.required' => 'Veuillez sélectionner au moins une citerne.',
        'citernes_to_associate.*.exists' => "Une citerne sélectionnée n'existe pas.",
        
    ]);*/

    try {
        // La méthode syncWithoutDetaching ajoute uniquement les IDs qui n'existent pas déjà.
        // Si vous voulez une association simple, 'attach' est suffisant, mais 'sync' ou 
        // 'syncWithoutDetaching' sont plus robustes pour gérer les listes.
        // Puisque nous filtrons déjà en frontend, 'attach' est suffisant et plus rapide.
        
        $pompe->cuves()->attach($request->input('citernes_to_associate'));

        // Important : Redirigez ou renvoyez une réponse pour rafraîchir la liste côté client.
        return redirect()->back()->with('success', 'Association(s) de citernes réussie(s).');

    } catch (\Exception $e) {
        Log::error("Erreur d'association de citerne: " . $e->getMessage());
        return back()->with('error', "Une erreur est survenue lors de l'association des citernes.");
    }
}
// ... dans la classe PompeController

/**
 * Dissocie une pompe des citernes sélectionnées.
 */
public function dissociateCiternes(Request $request, Pompe $pompe)
{
    // Note : La validation 'exists' n'est pas strictement nécessaire ici 
    // car on se base sur les IDs déjà liés, mais elle assure la sécurité.
  /*  $request->validate([
        'citernes_to_dissociate' => 'required|array',
        'citernes_to_dissociate.*' => 'exists:citernes,id',
    ], [
        'citernes_to_dissociate.required' => 'Veuillez sélectionner au moins une citerne à dissocier.',
    ]);
*/
    try {
        // La méthode detach() est la bonne pour retirer des entrées de la table pivot.
        $pompe->cuves()->detach($request->input('citernes_to_dissociate'));

        return redirect()->back()->with('success', 'Dissociation(s) de citernes réussie(s).');

    } catch (\Exception $e) {
        Log::error("Erreur de dissociation de citerne: " . $e->getMessage());
        return back()->with('error', "Une erreur est survenue lors de la dissociation des citernes.");
    }
}
}