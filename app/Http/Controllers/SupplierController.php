<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class SupplierController extends Controller
{
    /**
     * Affiche la liste des fournisseurs avec recherche et pagination.
     */
    public function index(Request $request)
    {
        $query = Supplier::query();

        // Filtre de recherche globale
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('tax_id', 'like', "%{$search}%");
            });
        }

        // Tri alphabétique par défaut pour faciliter la lecture
        $suppliers = $query->orderBy('name', 'asc')
                           ->paginate(15)
                           ->withQueryString();

        return Inertia::render('DirBoutique/Suppliers/SupplierIndex', [
            'suppliers' => $suppliers,
            'filters'   => $request->only(['search']),
        ]);
    }

    /**
     * Enregistre un nouveau fournisseur dans la base de données.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255', 'unique:suppliers,name'],
            'contact_name'  => ['nullable', 'string', 'max:255'],
            'phone'         => ['nullable', 'string', 'max:50'],
            'tax_id'        => ['nullable', 'string', 'max:100', 'unique:suppliers,tax_id'], // NIU unique
            'address'       => ['nullable', 'string', 'max:500'],
            'payment_terms' => ['nullable', 'string', 'max:50'],
        ], [
            'name.required' => 'La raison sociale du fournisseur est obligatoire.',
            'name.unique'   => 'Un fournisseur avec ce nom existe déjà.',
            'tax_id.unique' => 'Ce numéro de contribuable (NIU) est déjà enregistré pour un autre fournisseur.',
        ]);

        Supplier::create($validated);

        return redirect()->back()->with('success', 'Fournisseur ajouté avec succès.');
    }

    /**
     * Met à jour les informations d'un fournisseur existant.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255', Rule::unique('suppliers')->ignore($supplier->id)],
            'contact_name'  => ['nullable', 'string', 'max:255'],
            'phone'         => ['nullable', 'string', 'max:50'],
            'tax_id'        => ['nullable', 'string', 'max:100', Rule::unique('suppliers')->ignore($supplier->id)],
            'address'       => ['nullable', 'string', 'max:500'],
            'payment_terms' => ['nullable', 'string', 'max:50'],
        ], [
            'name.required' => 'La raison sociale du fournisseur est obligatoire.',
            'name.unique'   => 'Un fournisseur avec ce nom existe déjà.',
            'tax_id.unique' => 'Ce numéro de contribuable (NIU) est déjà enregistré.',
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('success', 'Informations du fournisseur mises à jour.');
    }

    /**
     * Supprime un fournisseur de la base de données.
     */
    public function destroy(Supplier $supplier)
    {
        // ATTENTION : Grâce à votre `onDelete('cascade')` dans la migration `purchase_orders`,
        // supprimer un fournisseur supprimera AUSSI tous ses bons de commande associés.
        // C'est un comportement très destructeur en comptabilité.
        
        $supplierName = $supplier->name;
        $supplier->delete();

        return redirect()->back()->with('success', "Le fournisseur {$supplierName} a été supprimé.");
    }
}