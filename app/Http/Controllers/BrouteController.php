<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Article;
use App\Models\Bordereau_route;
use App\Models\Chauffeur;
use App\Models\Mouvement;
use App\Models\Package;
use App\Models\Stock;
use App\Models\Vehicule;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BrouteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $vehicles = Vehicule::all();
        $drivers = Chauffeur::all();
        $agencies = Agency::all();
        $articles = Article::all();
        
        $roadbillsQuery = Bordereau_route::with("departure", "arrival", "chauffeur", "co_chauffeur", "vehicule");
        
        if (Auth::user()->role->name !== "direction") {
            $roadbillsQuery->where(function ($query) {
                $query->where("departure_location_id", Auth::user()->agency_id)
                      ->orWhere("arrival_location_id", Auth::user()->agency_id);
            });
        }
        
        $roadbills = $roadbillsQuery->paginate(50);
        
        return Inertia::render("Transferts/Broute", compact("roadbills", "agencies", "drivers", "vehicles", "articles"));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id' => ['required', 'exists:vehicules,id'],
            'driver_id' => ['required', 'exists:chauffeurs,id'],
            'co_driver_id' => ['nullable', 'exists:chauffeurs,id'],
            'arrival_location_id' => ['required', 'exists:agencies,id'],
            'departure_date' => ['required', 'date'],
            'arrival_date' => ['nullable', 'date', 'after_or_equal:departure_date'],
            'type' => ['required', 'string', 'in:ramassage,livraison,transit'],
            'note' => ['nullable', 'string'],
        ]);

        DB::beginTransaction();

        try {
            // Create the bordereau route
            Bordereau_route::create([
                'vehicule_id' => $request->input('vehicle_id'),
                'chauffeur_id' => $request->input('driver_id'),
                'co_chauffeur_id' => $request->input('co_driver_id'),
                'departure_location_id' => Auth::user()->agency_id,
                'arrival_location_id' => $request->input('arrival_location_id'),
                'departure_date' => $request->input('departure_date'),
                'arrival_date' => $request->input('arrival_date'),
                'type' => $request->input('type'),
                'note' => $request->input('note'),
                'status' => 'en_cours',
            ]);

            DB::commit();

            return back()->with('success', 'Bordereau de route créé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Une erreur est survenue lors de la création du bordereau : ' . $e->getMessage());
        }
    }

    /**
     * Download the PDF for the specified bordereau route.
     */
    public function downloadPdf($id)
    {
        $roadbill = Bordereau_route::with(['vehicule', 'chauffeur', 'co_chauffeur', 'packages.article', "departure", "arrival"])->findOrFail($id);

        $pdf = Pdf::loadView('PDF.BroutePdfView', compact('roadbill'));
        
        return $pdf->download('bordereau_route_' . $roadbill->id . '.pdf');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $roadbill = Bordereau_route::with('packages')->findOrFail($id);
            
            if ($roadbill->status !== 'en_cours') {
                return back()->with('error', 'Le bordereau ne peut pas être supprimé car il n\'est pas en cours.');
            }

            // Restore stock for each package
            foreach ($roadbill->packages as $package) {
                $stock = Stock::where('article_id', $package->article_id)
                    ->where('agency_id', $roadbill->departure_location_id)
                    ->where('storage_type', 'magasin')
                    ->firstOrFail();
                
                $stock->quantity += $package->qty;
                $stock->save();
            }

            // Delete associated movements
            $description = "sortie transfert automatique #" . $roadbill->id;
            Mouvement::where('description', $description)->delete();

            // Delete packages and the bordereau
            $roadbill->packages()->delete();
            $roadbill->delete();

            DB::commit();

            return back()->with('success', 'Bordereau de route et mouvements associés supprimés avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la suppression du bordereau : ' . $e->getMessage());
        }
    }

    /**
     * Validate the specified bordereau route.
     */
    public function validateRoadbill(Request $request, Bordereau_route $roadbill)
    {
        $request->validate(['note' => ['nullable', 'string', 'max:500']]);
        
        if ($roadbill->status !== 'en_cours') {
            return back()->with('error', 'Le bordereau ne peut pas être validé car il n\'est pas en cours.');
        }
        
        DB::beginTransaction();

        try {
            $roadbill->notes = $request->input('note');
            $roadbill->status = 'termine';
            $roadbill->arrival_date = now();
            $roadbill->save();

            foreach ($roadbill->packages as $package) {
                $stockEntry = Stock::where('agency_id', $roadbill->arrival_location_id)
                    ->where('article_id', $package->article_id)
                    ->where("storage_type", "magasin")
                    ->firstOrCreate([
                        'agency_id' => $roadbill->arrival_location_id,
                        'article_id' => $package->article_id,
                        'storage_type' => 'magasin',
                    ], [
                        'quantity' => 0,
                    ]);
                
                $stockEntry->quantity += $package->qty;
                $stockEntry->save();
                
                $this->createMovement(
                    $package->article_id,
                    Auth::user()->agency_id,
                    Auth::user()->entreprise_id,
                    Auth::user()->id,
                    'entree',
                    'tranfert',
                    $package->qty,
                    $stockEntry->quantity,
                    Auth::user()->role->name,
                    Auth::user()->agency->name
                );
            }

            DB::commit();

            return back()->with('success', 'Le bordereau a été validé et le stock mis à jour.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Une erreur est survenue lors de la validation du bordereau. ' . $e->getMessage());
        }
    }
    
    /**
     * Export bordereau routes based on filters.
     */
    public function export(Request $request)
    {
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
        $departureAgency = $request->input('departureAgency');
        $arrivalAgency = $request->input('arrivalAgency');
        $articleId = $request->input('article');
        
        $query = Bordereau_route::with('packages.article', 'vehicule', 'chauffeur', 'co_chauffeur', 'departure', 'arrival');
        
        if ($startDate) {
            $query->whereBetween('departure_date', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        }
        if ($departureAgency) {
            $query->where('departure_location_id', $departureAgency);
        }
        if ($arrivalAgency) {
            $query->where('arrival_location_id', $arrivalAgency);
        }

        $roadbills = $query->get();

        if ($articleId) {
            $filteredRoadbills = [];
            foreach ($roadbills as $roadbill) {
                foreach ($roadbill->packages as $package) {
                    if ($package->article_id == $articleId) {
                        $filteredRoadbills[] = [
                            'roadbill' => $roadbill,
                            'package' => $package,
                        ];
                    }
                }
            }
            $article = Article::find($articleId);
            $totalQuantity = collect($filteredRoadbills)->sum('package.qty');
            $pdf = Pdf::loadView('PDF.filtered_roadbills_by_article', compact('filteredRoadbills', 'article', 'totalQuantity', 'startDate', 'endDate'));
            return $pdf->download('bordereaux-par-article.pdf');
        } else {
            $pdf = Pdf::loadView('PDF.general_roadbills', compact('roadbills', 'startDate', 'endDate'));
            return $pdf->download('bordereaux-generaux.pdf');
        }
    }
    public function showPackages(Bordereau_route $roadbill)
    {
        // Eager load the packages and their related articles
        $roadbill->load('packages.article',"vehicule","chauffeur","co_chauffeur","departure","arrival");

        return Inertia::render('Transferts/Packages', [
            'roadbill' => $roadbill,
            'packages' => $roadbill->packages,
        ]);
    }
    /**
     * Create a movement record.
     */
    private function createMovement(
        int $articleId,
        int $agencyId,
        int $entrepriseId,
        int $recordedByUserId,
        string $movementType,
        string $qualification,
        float $quantity,
        float $stock,
        ?string $sourceLocation,
        ?string $destinationLocation
    ): Mouvement {
        $movement = new Mouvement();
        $movement->article_id = $articleId;
        $movement->agency_id = $agencyId;
        $movement->entreprise_id = $entrepriseId;
        $movement->recorded_by_user_id = $recordedByUserId;
        $movement->movement_type = $movementType;
        $movement->qualification = $qualification;
        $movement->quantity = $quantity;
        $movement->stock = $stock;
        $movement->source_location = $sourceLocation;
        $movement->destination_location = $destinationLocation;
        $movement->description = "mouvement de " . $movementType . " automatique";
        $movement->save();
        return $movement;
    }
}