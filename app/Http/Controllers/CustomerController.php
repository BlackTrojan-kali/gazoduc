<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Imports\CustomersImport;
use App\Exports\CustomersExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel; // Attention: utilisez la Facade, pas l'interface directe
use Inertia\Inertia;
use Carbon\Carbon;

class CustomerController extends Controller
{
    /**
     * Affiche la liste des clients (avec recherche et pagination).
     */
    public function index(Request $request)
    {
        $query = Customer::query();

        // Recherche simple (Nom, Téléphone ou Email)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('phone', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Tri par défaut : les plus récents en premier
        $customers = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('DirBoutique/Customers/CustomersIndex', [
            'customers' => $customers,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Enregistre un nouveau client.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'phone'       => 'nullable|string|max:20',
            'email'       => 'nullable|email|max:255|unique:customers,email',
            'address'     => 'nullable|string|max:255',
            'dept_amount' => 'nullable|numeric|min:0', // Validation numérique
        ]);

        Customer::create($validated);

        return redirect()->back()->with('success', 'Client enregistré avec succès.');
    }

    /**
     * Exporte la liste des clients en Excel (filtré par période).
     */
    public function export(Request $request)
    {
        // Validation des dates (optionnelles)
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');

        // Génération du nom de fichier avec la date du jour
        $fileName = 'clients_export_' . date('d-m-Y_His') . '.xlsx';

        // Appel de la classe d'export avec les paramètres
        return Excel::download(new CustomersExport($startDate, $endDate), $fileName);
    }

    /**
     * Importe une liste de clients depuis un fichier Excel.
     */
    public function import(Request $request) 
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120', // Max 5Mo
        ]);

        try {
            Excel::import(new CustomersImport, $request->file('file'));
            return redirect()->back()->with('success', 'Importation terminée avec succès.');
        } catch (\Exception $e) {
            // Log l'erreur pour le développeur si besoin: \Log::error($e);
            return redirect()->back()->withErrors(['file' => 'Erreur lors de l\'import : ' . $e->getMessage()]);
        }
    }

    /**
     * Télécharge le modèle Excel pour l'import.
     */
    public function downloadTemplate()
    {
        $path = public_path('templates/clients_import_template.xlsx');
        
        if (!file_exists($path)) {
            return redirect()->back()->withErrors(['error' => 'Le modèle est introuvable sur le serveur.']);
        }

        return response()->download($path);
    }
    /**
     * Met à jour les informations d'un client existant.
     */
    public function update(Request $request, Customer $customer)
    {
        // Validation des données
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'phone'       => 'nullable|string|max:20',
            // Important : On ignore l'ID du client actuel pour la vérification d'unicité de l'email
            'email'       => 'nullable|email|max:255|unique:customers,email,' . $customer->id,
            'address'     => 'nullable|string|max:255',
            'dept_amount' => 'nullable|numeric|min:0',
        ]);

        // Mise à jour
        $customer->update($validated);

        return redirect()->back()->with('success', 'Les informations du client ont été mises à jour.');
    }

    /**
     * Supprime un client de la base de données.
     */
    public function destroy(Customer $customer)
    {
        try {
            // Optionnel : Vérifier si le client a des dettes ou des factures avant de supprimer
            // if ($customer->invoices()->exists()) {
            //     return redirect()->back()->with('error', 'Impossible de supprimer ce client car il possède des factures.');
            // }

            $customer->delete();

            return redirect()->back()->with('success', 'Client supprimé avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Une erreur est survenue lors de la suppression.');
        }
    }
}