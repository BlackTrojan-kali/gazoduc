<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia; // Ajout de l'import d'Inertia

class ClosureController extends Controller
{
    /**
     * Affiche une liste paginée des fermetures avec leurs agences associées.
     */
    public function index()
    {
        // Chargement eager (eager loading) de la relation 'agency'
        $closures = Closure::with("agency")->paginate(100);
        $agencies = Agency::all();
        return Inertia::render("Closures/Closures", [
            "closures" => $closures,
            "agencies"=>$agencies
        ]);
    }

    /**
     * Stocke une nouvelle fermeture dans la base de données.
     */
    public function store(Request $request)
    {
        // Note: L'utilisation de 'agency_id' est cohérente avec le contrôleur,
        // et le modèle a été mis à jour pour correspondre.
        $validatedData = $request->validate([
            "agency_id" => "required|integer|exists:agencies,id|unique:closures,agency_id", // Ajout de la validation integer et exists
            "starting_date" => "date|required|before:ending_date", // Ajout de la règle de logique de date
            "ending_date" => "date|required|after:starting_date",
        ]);

        Closure::create($validatedData);

        return back()->with("success", "Fermeture créée avec succès.");
    }

    /**
     * Met à jour une fermeture existante dans la base de données.
     */
    public function update(Request $request, $idClosure)
    {
        $validatedData = $request->validate([
            "agency_id" => "required|integer|exists:agencies,id",
            "starting_date" => "date|required|before:ending_date",
            "ending_date" => "date|required|after:starting_date",
        ]);

        $closure = Closure::findOrFail($idClosure);
        
        // Utilisation du fill and save (ou update) pour le mass assignment
        $closure->update($validatedData);
        
        return back()->with("success", "Fermeture mise à jour avec succès.");
    }

    /**
     * Supprime une fermeture spécifique.
     * (Ajout de la méthode destroy pour un contrôleur CRUD complet)
     */
    public function destroy($idClosure)
    {
        $closure = Closure::findOrFail($idClosure);
        $closure->delete();


        return back()->with("success", "Fermeture supprimée avec succès.");
    }
}
