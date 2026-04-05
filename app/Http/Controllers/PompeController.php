<?php

namespace App\Http\Controllers;

use App\Models\Pompe;
use App\Models\Agency;
use App\Models\Citerne;
use App\Models\Pistolet; // Ne pas oublier d'importer le modèle Pistolet
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PompeController extends Controller
{
    /**
     * Affiche la liste de toutes les pompes.
     * Rendu vers le composant DirectionFuel/Pompes/Index.
     */
    public function index()
    {
        // On charge les pompes avec leurs pistolets, et pour chaque pistolet, la citerne associée.
        $pompes = Pompe::with(['agency:id,name', 'pistolets.citerne:id,name,product_type'])->get();
        
        $agencies = Agency::all();
        $citernes = Citerne::where("product_type", "produit_petrolier")->get();
        
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

            return redirect()->route('pompes.index')->with('success', 'Pompe créée avec succès.');
        } catch (\Exception $e) {
            Log::error("Erreur lors de la création de la pompe: " . $e->getMessage());
            return back()->with('error', "Erreur lors de la création de la pompe: " . $e->getMessage());
        }
    }

    /**
     * Met à jour la pompe spécifiée dans la base de données.
     */
    public function update(Request $request, Pompe $pompe)
    {
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

            return redirect()->route('pompes.index')->with('success', 'Pompe mise à jour avec succès.');
        } catch (\Exception $e) {
            Log::error("Erreur lors de la mise à jour de la pompe: " . $e->getMessage());
            return back()->with('error', "Erreur lors de la mise à jour de la pompe: " . $e->getMessage());
        }
    }

    /**
     * Supprime la pompe spécifiée de la base de données.
     */
    public function destroy(Pompe $pompe)
    {
        try {
            // La suppression de la pompe supprimera aussi les pistolets associés 
            // si la migration contient bien onDelete('cascade') sur pompe_id
            $pompe->delete();

            return redirect()->route('pompes.index')->with('success', 'Pompe supprimée avec succès.');
        } catch (\Exception $e) {
            Log::error("Erreur lors de la suppression de la pompe: " . $e->getMessage());
            return back()->with('error', "Erreur lors de la suppression de la pompe: " . $e->getMessage());
        }
    }

    /**
     * Associe une pompe à une ou plusieurs citernes (Création des pistolets).
     */
    public function associateCiternes(Request $request, Pompe $pompe)
    {
        $request->validate([
            'citernes_to_associate' => 'required|array',
            'citernes_to_associate.*' => 'exists:citernes,id',
        ], [
            'citernes_to_associate.required' => 'Veuillez sélectionner au moins une citerne.',
            'citernes_to_associate.*.exists' => "Une citerne sélectionnée n'existe pas.",
        ]);

        try {
            $citernesIds = $request->input('citernes_to_associate');

            foreach ($citernesIds as $citerneId) {
                // On récupère la citerne pour utiliser son nom
                $citerne = Citerne::find($citerneId);
                
                if ($citerne) {
                    // firstOrCreate évite de créer des pistolets en double 
                    // si la pompe est déjà reliée à cette citerne
                    $pompe->pistolets()->firstOrCreate(
                        ['citerne_id' => $citerneId],
                        [
                            'name' => 'Pistolet ' . $citerne->name,
                            'current_index' => 0,
                            'is_active' => true
                        ]
                    );
                }
            }

            return redirect()->back()->with('success', 'Pistolet(s) créé(s) et citerne(s) associée(s) avec succès.');

        } catch (\Exception $e) {
            Log::error("Erreur d'association (création pistolets): " . $e->getMessage());
            return back()->with('error', "Une erreur est survenue lors de la création des pistolets.");
        }
    }

    /**
     * Dissocie une pompe des citernes sélectionnées (Suppression des pistolets).
     */
    public function dissociateCiternes(Request $request, Pompe $pompe)
    {
        $request->validate([
            'citernes_to_dissociate' => 'required|array',
            'citernes_to_dissociate.*' => 'exists:citernes,id',
        ], [
            'citernes_to_dissociate.required' => 'Veuillez sélectionner au moins une citerne à dissocier.',
        ]);

        try {
            $citernesIds = $request->input('citernes_to_dissociate');

            // Au lieu de 'detach', on supprime physiquement les pistolets 
            // qui relient cette pompe aux citernes sélectionnées
            $pompe->pistolets()->whereIn('citerne_id', $citernesIds)->delete();

            return redirect()->back()->with('success', 'Pistolet(s) retiré(s) et citerne(s) dissociée(s) avec succès.');

        } catch (\Exception $e) {
            Log::error("Erreur de dissociation (suppression pistolets): " . $e->getMessage());
            return back()->with('error', "Une erreur est survenue lors de la suppression des pistolets.");
        }
    }
}