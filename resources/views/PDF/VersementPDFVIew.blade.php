<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport des versements</title>
    <style>
        body { font-family: sans-serif; margin: 15px; font-size: 10px; }
        h1, h2, h3 { text-align: center; color: #333; margin-bottom: 5px; }
        .filters-summary { margin: 10px 0 20px; border: 1px solid #ddd; padding: 8px; border-radius: 4px; font-size: 9px; }
        .filters-summary p { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #aaa; padding: 6px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; }
        .red-text { color: red; font-weight: bold; }
        .blue-text { color: blue; font-weight: bold; }
        tfoot td { font-weight: bold; background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Rapport des versements</h1>
    <p style="text-align: center;">Généré le : {{ now()->format('d/m/Y') }}</p>

    <div class="filters-summary">
        <h3>Filtres appliqués</h3>
        <p><strong>Client :</strong> {{ $filters['client_id'] ?? 'Tous' }}</p>
        <p><strong>Agence :</strong> {{ $filters['agency_id'] ?? 'Toutes' }}</p>
        <p><strong>Type de facture :</strong> {{ $filters['invoice_type'] ?? 'Tous' }}</p>
        <p><strong>Banque :</strong> {{ $filters['bank_id'] ?? 'Toutes' }}</p>
        <p><strong>Période :</strong> Du {{ $filters['start_date'] ?? 'début' }} au {{ $filters['end_date'] ?? "aujourd'hui" }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Date</th>
                <th>Client</th>
                <th>Banque</th>
                <th>Agence</th>
                <th>Type</th>
                <th>Montant Versement</th>
                <th>Montant Note</th>
                <th>Montant Factures</th>
                <th>Écart</th>
                <th>Factures associées</th>
            </tr>
        </thead>
        <tbody>
            @php
                $grandTotalAmount = 0;
                $grandTotalNotes = 0;
                $grandTotalFactures = 0;
                $grandTotalEcart = 0;
            @endphp

            @foreach($versements as $versement)
                @php
                    $totalFactures = $versement->factures->sum('total_amount');
                    $montantNote = $versement->amout_notes ?? 0;
                    $ecart = ($versement->amout + $montantNote) - $totalFactures;
                    $ecartClass = $ecart >= 0 ? 'blue-text' : 'red-text';

                    $grandTotalAmount += $versement->amout;
                    $grandTotalNotes += $montantNote;
                    $grandTotalFactures += $totalFactures;
                    $grandTotalEcart += $ecart;
                @endphp

                <tr>
                    <td>{{ $versement->id }}</td>
                    <td>{{ $versement->created_at->format('d/m/Y') }}</td>
                    <td>{{ $versement->client->name ?? 'N/A' }}</td>
                    <td>{{ $versement->bank->name ?? 'N/A' }}</td>
                    <td>{{ $versement->agency->name ?? 'N/A' }}</td>
                    <td>{{ $versement->type ?? '-' }}</td>
                    <td>{{ number_format($versement->amout, 2, ',', ' ') }} F</td>
                    <td>{{ number_format($montantNote, 2, ',', ' ') }} F</td>
                    <td>{{ number_format($totalFactures, 2, ',', ' ') }} F</td>
                    <td class="{{ $ecartClass }}">{{ number_format($ecart, 2, ',', ' ') }} F</td>
                    <td>
                        @if($versement->factures->count() > 0)
                            @foreach($versement->factures as $facture)
                                • {{ $facture->id }} ({{ number_format($facture->total_amount, 2, ',', ' ') }} F)<br>
                            @endforeach
                        @else
                            Aucune
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            @php $grandTotalEcartClass = $grandTotalEcart >= 0 ? 'blue-text' : 'red-text'; @endphp
            <tr>
                <td colspan="6" style="text-align: right;">Totaux généraux :</td>
                <td>{{ number_format($grandTotalAmount, 2, ',', ' ') }} F</td>
                <td>{{ number_format($grandTotalNotes, 2, ',', ' ') }} F</td>
                <td>{{ number_format($grandTotalFactures, 2, ',', ' ') }} F</td>
                <td class="{{ $grandTotalEcartClass }}">{{ number_format($grandTotalEcart, 2, ',', ' ') }} F</td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
