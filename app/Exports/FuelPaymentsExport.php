<?php

namespace App\Exports;

use App\Models\Payment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class FuelPaymentsExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Payment::where('is_fuel', true)
            ->with(['agency', 'bank', 'client'])
            ->get()
            ->map(function ($p) {
                return [
                    'ID' => $p->id,
                    'Agence' => $p->agency->name ?? '',
                    'Client' => $p->client->name ?? '',
                    'Banque' => $p->bank->name ?? '',
                    'Montant' => $p->amout,
                    'Type' => $p->type,
                    'Date' => $p->created_at->format('d/m/Y'),
                ];
            });
    }

    public function headings(): array
    {
        return ['ID', 'Agence', 'Client', 'Banque', 'Montant', 'Type', 'Date'];
    }
}
