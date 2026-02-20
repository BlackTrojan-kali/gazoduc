<?php

namespace App\Http\Controllers;

use App\Models\GpsDevice;
use App\Models\Vehicule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class VehiculeController extends Controller
{
    //
    public function index(){
        $vehicles = Vehicule::paginate(15);
        $gpsdevices = GpsDevice::all();
        return inertia("Transferts/Vehicule",compact("vehicles","gpsdevices"));
    }

public function store(Request $request)
{
    // 1. Validation complète
    $validatedData = $request->validate([
        // Champs standards
        'licence_plate'   => 'required|string|min:4|unique:vehicules,licence_plate',
        'brand'           => 'required|string', // J'ai mis 'required' car il y avait une * rouge dans votre formulaire React
        'type'            => 'required|string',
        'owner_type'      => 'required|string',
        'capacity_liters' => 'nullable|numeric', // Capacité de chargement marchandise

        // --- NOUVEAUX CHAMPS TRACKING (Nullables) ---
        
        // Vérifie que l'ID existe dans la table 'gps_devices' ET qu'il n'est pas déjà utilisé par un autre véhicule
        'gps_device_id'   => 'nullable|exists:gps_devices,id|unique:vehicules,gps_device_id',
        
        'tank_capacity'   => 'nullable|numeric', // Réservoir moteur
        'theft_threshold_percentage' => 'nullable|numeric|between:0,100', // Pourcentage entre 0 et 100
        'fuel_type'       => 'nullable|string',
    ]);

    // 2. Création du véhicule (Utilisation de Mass Assignment grâce au $fillable du Modèle)
    Vehicule::create($validatedData);

    // 3. Retour
    return back()->with('success', 'Véhicule enregistré avec succès.');
}
    public function update(Request $request, $Vid)
{
    // 1. Récupération du véhicule
    $vehicle = Vehicule::findOrFail($Vid);

    // 2. Validation avec exclusion de l'ID actuel (ignore)
    $validatedData = $request->validate([
        "licence_plate" => [
            "required", 
            "string", 
            "min:4", 
            Rule::unique('vehicules')->ignore($vehicle->id) // Autorise à garder sa propre plaque
        ],
        "type"            => "required|string",
        "brand"           => "required|string",
        "owner_type"      => "required|string",
        "capacity_liters" => "nullable|numeric",

        // --- NOUVEAUX CHAMPS TRACKING ---
        
        "gps_device_id" => [
            "nullable",
            "exists:gps_devices,id",
            Rule::unique('vehicules')->ignore($vehicle->id) // Autorise à garder son propre GPS
        ],
        
        "tank_capacity"              => "nullable|numeric",
        "theft_threshold_percentage" => "nullable|numeric|between:0,100",
        "fuel_type"                  => "nullable|string",
    ]);

    // 3. Mise à jour automatique (grâce au $fillable du modèle)
    $vehicle->update($validatedData);

    return back()->with("info", "Véhicule modifié avec succès");
}
    public function archive($Vid){
        $vehicle = Vehicule::findOrFail($Vid);
        $vehicle->archived = !$vehicle->archived;
        $vehicle->save();
        return back()->with("warning","vehicule ,archive avec success");
    }
}
