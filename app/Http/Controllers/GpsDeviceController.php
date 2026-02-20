<?php

namespace App\Http\Controllers;

use App\Models\GpsDevice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class GpsDeviceController extends Controller
{
    /**
     * Affiche la liste des boîtiers GPS.
     */
    public function index(Request $request)
    {
        // Récupération des paramètres de recherche/tri
        $query = GpsDevice::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('imei', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('sim_number', 'like', "%{$search}%");
        }

        // Pagination des résultats (10 par page par exemple)
        $gpsDevices = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('GpsDevices/Index', [
            'gpsDevices' => $gpsDevices,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Enregistre un nouveau boîtier GPS.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'imei'       => 'required|string|unique:gps_devices,imei',
            'model'      => 'required|string|max:50', // Ex: Teltonika FMB920
            'sim_number' => 'nullable|string|max:20',
            'is_active'  => 'boolean',
        ]);

        GpsDevice::create($validatedData);

        return back()->with('success', 'Boîtier GPS ajouté avec succès.');
    }

    /**
     * Met à jour les informations d'un boîtier existant.
     */
    public function update(Request $request, GpsDevice $gpsDevice)
    {
        $validatedData = $request->validate([
            // On ignore l'ID actuel pour la règle unique lors de la modification
            'imei'       => ['required', 'string', Rule::unique('gps_devices')->ignore($gpsDevice->id)],
            'model'      => 'required|string|max:50',
            'sim_number' => 'nullable|string|max:20',
            'is_active'  => 'boolean',
        ]);

        $gpsDevice->update($validatedData);

        return back()->with('success', 'Informations du boîtier mises à jour.');
    }

    /**
     * Supprime un boîtier GPS.
     */
    public function destroy(GpsDevice $gpsDevice)
    {
        // Optionnel : Vérifier si le boîtier est lié à un véhicule avant de supprimer
        // Si vous avez défini la relation hasOne dans GpsDevice :
        /*
        if ($gpsDevice->vehicule) {
             return back()->with('error', 'Impossible de supprimer ce boîtier car il est lié au véhicule ' . $gpsDevice->vehicule->licence_plate);
        }
        */

        $gpsDevice->delete();

        return back()->with('success', 'Boîtier GPS supprimé.');
    }
}