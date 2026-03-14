<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Cylinder;
use App\Models\AgencyTransferSlip;
use App\Models\ProductionBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // <-- Import crucial pour les transactions
use Inertia\Inertia;

class MagMedController extends Controller
{
    /**
     * Affiche le tableau de bord du magasin.

     * Affiche le tableau de bord du magasin.
     */
    public function index(Request $request)
    {
        // On récupère l'agence du magasinier actuellement connecté
        $agencyId = Auth::user()->agency_id; 

        // 1. Volume total du stock physique sur le site
        $totalCylinders = Cylinder::where('current_agency_id', $agencyId)->count();

        // 2. Répartition exacte par état (Pleine_Usine, Vide_Usine, En_Maintenance, etc.)
        $cylindersByState = Cylinder::selectRaw('status, count(*) as count')
            ->where('current_agency_id', $agencyId)
            ->groupBy('status')
            ->pluck('count', 'status');

        // 3. Les camions en approche (Bordereaux en transit vers cette agence)
        $pendingIncomingTransfers = AgencyTransferSlip::with(['vehicule', 'driver'])
            ->where('destination_agency_id', $agencyId)
            ->where('status', 'in_transit')
            ->get();

        // 4. Alerte de sécurité : Bouteilles nécessitant une maintenance (ex: épreuve de plus de 5 ans)
        $cylindersToTest = Cylinder::where('current_agency_id', $agencyId)
            ->where('last_test_date', '<', now()->subYears(5))
            ->count();

        // 5. Liste des bouteilles en stock, filtrable et paginée
        $search = $request->input('search');
        $statusFilter = $request->input('status');

        $cylinders = Cylinder::where('current_agency_id', $agencyId)
            ->with(['cylinderType', 'gas']) // Charge les relations pour affichage
            ->when($search, function ($query, $search) {
                // Recherche par code-barres ou numéro de série
                $query->where(function($q) use ($search) {
                    $q->where('barcode', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%");
                });
            })
            ->when($statusFilter, function ($query, $statusFilter) {
                // Filtre par statut exact
                $query->where('status', $statusFilter);
            })
            ->orderBy('updated_at', 'desc') // Les dernières modifiées en premier
            ->paginate(15)
            ->withQueryString(); // Conserve les filtres lors du changement de page

        // 6. NOUVEAU : Préparation des données pour la Modale de Transfert (Expédition)
        // On récupère toutes les agences SAUF l'agence actuelle
        $agencies = Agency::where('id', '!=', $agencyId)->get();
        
        $vehicules = \App\Models\Vehicule::all();
        
        // Ajustez cette ligne si vous avez un modèle Driver distinct ou un rôle spécifique
        $drivers = \App\Models\Chauffeur::all(); 
        
        $cylinderTypes = \App\Models\CylinderType::all();

        return Inertia::render('MagMed/Index', [
            'totalCylinders' => $totalCylinders,
            'cylindersByState' => $cylindersByState,
            'pendingIncomingTransfers' => $pendingIncomingTransfers,
            'cylindersToTest' => $cylindersToTest,
            'cylinders' => $cylinders, 
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
            // NOUVEAU : Props envoyées à la modale
            'agencies' => $agencies,
            'vehicules' => $vehicules,
            'drivers' => $drivers,
            'cylinderTypes' => $cylinderTypes,
        ]);
    }
    /**
     * Recherche de bouteilles pour l'autocomplétion (Saisie manuelle).
     */
    public function searchCylinders(Request $request)
    {
        $query = $request->input('q');
        $agencyId = Auth::user()->agency_id;

        if (empty($query)) {
            return response()->json([]);
        }

        // On cherche uniquement les bouteilles "Vide_Usine" dans l'agence actuelle
        $cylinders = Cylinder::where('current_agency_id', $agencyId)
            ->where('status', 'Vide_Usine')
            ->where(function($q) use ($query) {
                $q->where('barcode', 'like', "%{$query}%")
                  ->orWhere('serial_number', 'like', "%{$query}%");
            })
            ->limit(10) // On limite à 10 résultats pour ne pas surcharger l'interface
            ->get(['id', 'barcode', 'serial_number']);

        return response()->json($cylinders);
    }
    /**
     * Affiche l'interface de scan pour envoyer des bouteilles vides à la production.
     */
    public function toProduction(Request $request)
    {
        $agencyId = Auth::user()->agency_id;

        // Lots de production actuellement "ouverts" ou "en cours"
        $activeBatches = ProductionBatch::where('status', 'in_progress')
            ->with('gas')
            ->get();

        // On compte les bouteilles avec le statut EXACT "Vide_Usine"
        $availableEmptyCylinders = Cylinder::where('current_agency_id', $agencyId)
            ->where('status', 'Vide_Usine')
            ->count();

        return Inertia::render('MagMed/ToProduction', [
            'activeBatches' => $activeBatches,
            'availableEmptyCylinders' => $availableEmptyCylinders,
        ]);
    }

    /**
     * Traite le scan d'une bouteille vide pour l'affecter à un lot de production.
     * Appelée en POST par l'interface React lors du "bip" de la douchette.
     */
    public function storeToProduction(Request $request)
    {
        // Validation des données reçues
        $request->validate([
            'barcode' => 'required|string',
            'batch_id' => 'required|exists:production_batches,id',
        ]);

        try {
            DB::beginTransaction();

            // 1. Rechercher la bouteille physique par son code-barres
            $cylinder = Cylinder::where('barcode', $request->barcode)->first();

            if (!$cylinder) {
                return back()->withErrors(['barcode' => "Bouteille introuvable : {$request->barcode}"]);
            }

            // 2. Vérifier si l'état actuel permet l'enfûtage
            if ($cylinder->status !== 'Vide_Usine') {
                return back()->withErrors(['barcode' => "Impossible : La bouteille {$request->barcode} est actuellement en statut '{$cylinder->status}', et non 'Vide_Usine'."]);
            }

            // 3. Contrôle de sécurité (Date d'épreuve)
            if ($cylinder->last_test_date && $cylinder->last_test_date < now()->subYears(5)) {
                // On l'isole automatiquement en maintenance au lieu de la remplir
                $cylinder->update(['status' => 'En_Maintenance']);
                DB::commit();
                
                return back()->withErrors(['barcode' => "Alerte Sécurité : Bouteille {$request->barcode} périmée. Statut changé automatiquement en 'En_Maintenance'."]);
            }

            // 4. Lier la bouteille au lot de production dans la table pivot
            DB::table('production_batch_cylinders')->insert([
                'production_batch_id' => $request->batch_id,
                'cylinder_id' => $cylinder->id,
                'fill_status' => 'filled',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 5. Mettre à jour le statut global de la bouteille
            $cylinder->update([
                'status' => 'Pleine_Usine'
            ]);

            DB::commit();

            // Retourner un message de succès (récupérable dans les props Inertia)
            return back()->with('success', "Bouteille {$request->barcode} remplie (Lot #{$request->batch_id}).");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['barcode' => "Erreur système : " . $e->getMessage()]);
        }
    }
    /**
     * Affiche le formulaire pour créer un nouveau bordereau d'expédition.
     */
 /**
     * Crée le bordereau et affecte les bouteilles selon le mode (auto ou manuel).
     */
   /**
     * Crée le bordereau et affecte les bouteilles selon le mode (auto ou manuel).
     */
    public function storeDispatch(Request $request)
    {
        // Validation dynamique selon le mode choisi
        $request->validate([
            'destination_agency_id' => 'required|exists:agencies,id',
            'vehicule_id' => 'required|exists:vehicules,id',
            'driver_id' => 'required|exists:chauffeurs,id', // Correction ici (table chauffeurs)
            'selection_mode' => 'required|in:auto,manual',
            'notes' => 'nullable|string',
            
            // Validation spécifique au mode MANUEL
            'manual_cylinders' => 'required_if:selection_mode,manual|array',
            'manual_cylinders.*' => 'exists:cylinders,id',
            
            // Validation spécifique au mode AUTOMATIQUE
            'auto_type_id' => 'required_if:selection_mode,auto|exists:cylinder_types,id',
            'auto_state' => 'required_if:selection_mode,auto|string',
            'auto_quantity' => 'required_if:selection_mode,auto|integer|min:1',
        ]);

        $currentAgencyId = Auth::user()->agency_id;

        try {
            DB::beginTransaction();

            // 1. Création de l'en-tête du bordereau
            $count = AgencyTransferSlip::count() + 1;
            $reference = 'TRF-' . date('Ym') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $slip = AgencyTransferSlip::create([
                'reference' => $reference,
                'source_agency_id' => $currentAgencyId,
                'destination_agency_id' => $request->destination_agency_id,
                'vehicule_id' => $request->vehicule_id,
                'driver_id' => $request->driver_id,
                'status' => 'in_transit', // Le camion part immédiatement
                'departure_date' => now(), // <-- NOUVEAU: On enregistre l'heure de départ
                'created_by' => Auth::id(),
                'notes' => $request->notes,
            ]);

            $cylindersToTransfer = collect();

            // 2. Récupération des bouteilles selon le mode sélectionné
            if ($request->selection_mode === 'manual') {
                // Mode MANUEL : L'utilisateur a sélectionné via react-select
                $cylindersToTransfer = Cylinder::whereIn('id', $request->manual_cylinders)
                    ->where('current_agency_id', $currentAgencyId)
                    ->get();
                    
                if ($cylindersToTransfer->count() !== count($request->manual_cylinders)) {
                    throw new \Exception("Certaines bouteilles sélectionnées ne sont plus disponibles dans votre stock.");
                }
                
            } else {
                // Mode AUTO : Le système sélectionne aléatoirement la quantité demandée
                $cylindersToTransfer = Cylinder::where('current_agency_id', $currentAgencyId)
                    ->where('cylinder_type_id', $request->auto_type_id) 
                    ->where('status', $request->auto_state)
                    ->take($request->auto_quantity)
                    ->get();

                if ($cylindersToTransfer->count() < $request->auto_quantity) {
                    throw new \Exception("Stock insuffisant. Seulement {$cylindersToTransfer->count()} bouteilles disponibles pour ces critères (Format et État).");
                }
            }

            // 3. Affectation des bouteilles au bordereau (Table pivot)
            $itemsData = [];
            foreach ($cylindersToTransfer as $cylinder) {
                $itemsData[] = [
                    'agency_transfer_slip_id' => $slip->id,
                    'cylinder_id' => $cylinder->id,
                    'cylinder_state' => $cylinder->status, // On garde l'état initial (Pleine, Vide, etc.)
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('agency_transfer_items')->insert($itemsData);

            // 4. Mettre à jour le statut des bouteilles (Elles sont maintenant "En Transit")
            // Note: On ne modifie pas 'current_agency_id' tant qu'elles ne sont pas réceptionnées
            Cylinder::whereIn('id', $cylindersToTransfer->pluck('id'))
                ->update(['status' => 'En_Transit']);

            DB::commit();

            return back()->with('success', "Le transfert {$reference} a été validé. {$cylindersToTransfer->count()} bouteilles sont en transit.");

        } catch (\Exception $e) {
            DB::rollBack();
            // Renvoie l'erreur sous la clé 'error' pour l'afficher dans le SweetAlert
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}