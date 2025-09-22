<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport des versements</title>
    <style>
        body { font-family: sans-serif; margin: 20px; font-size: 10px; }
        h1, h2, h3 { text-align: center; color: #333; }
        .filters-summary { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        .filters-summary p { margin: 0; }
        .table-container { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; }
        .page-break { page-break-after: always; }
        .red-text { color: red; }
        .blue-text { color: blue; }
        .invoice-list-table {
            width: 100%;
            border-collapse: collapse;
        }
        .invoice-list-table th, .invoice-list-table td {
            border: none;
            padding: 4px;
        }
        .inner-table {
            width: 100%;
            border-collapse: collapse;
        }
        .inner-table td {
            border: none;
            padding: 8px;
        }
        .totals-table {
            margin-top: 40px;
            width: 100%;
        }
        .totals-table th, .totals-table td {
            text-align: right;
        }
        .totals-table th {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>Rapport des versements</h1>
    <p style="text-align: center;">Généré le: {{ now()->format('d/m/Y') }}</p>

    <div class="filters-summary">
        <h2>Filtres appliqués</h2>
        <p><strong>Client:</strong> {{ $filters['client_id'] ?? 'Tous' }}</p>
        <p><strong>Agence:</strong> {{ $filters['agency_id'] ?? 'Toutes' }}</p>
        <p><strong>Type de facture:</strong> {{ $filters['invoice_type'] ?? 'Tous' }}</p>
        <p><strong>Banque:</strong> {{ $filters['bank_id'] ?? 'Toutes' }}</p>
        <p><strong>Période:</strong> Du {{ $filters['start_date'] ?? 'début' }} au {{ $filters['end_date'] ?? 'aujourd\'hui' }}</p>
    </div>

    @foreach($versements as $versement)
        @php
            $totalFactures = $versement->factures->sum('total_amount');
            $montantNote = $versement->amout_notes ?? 0;
            $ecart = ($versement->amout + $montantNote) - $totalFactures;
            $ecartClass = $ecart >= 0 ? 'blue-text' : 'red-text';
        @endphp
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th colspan="2">Détails du Versement #{{ $versement->id }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="width: 50%;">
                            <h3>Factures associées</h3>
                            @if($versement->factures->count() > 0)
                                <table class="invoice-list-table">
                                    <thead>
                                        <tr>
                                            <th>N° Facture</th>
                                            <th>Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($versement->factures as $facture)
                                        <tr>
                                            <td>{{ $facture->id }}</td>
                                            <td>{{ number_format($facture->total_amount, 2, ',', ' ') }} F</td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            @else
                                <p>Aucune facture associée</p>
                            @endif
                            <p><strong>Total des factures :</strong> {{ number_format($totalFactures, 2, ',', ' ') }} F</p>
                        </td>
                        <td style="width: 50%;">
                            <h3>Détails du versement</h3>
                            <table class="inner-table">
                                <tr>
                                    <td><strong>Client :</strong></td>
                                    <td>{{ $versement->client->name ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Banque :</strong></td>
                                    <td>{{ $versement->bank->name ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Date :</strong></td>
                                    <td>{{ $versement->created_at->format('d/m/Y') }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Montant du versement :</strong></td>
                                    <td>{{ number_format($versement->amout, 2, ',', ' ') }} F</td>
                                </tr>
                                <tr>
                                    <td><strong>Montant de la note :</strong></td>
                                    <td>{{ number_format($montantNote, 2, ',', ' ') }} F</td>
                                </tr>
                                <tr>
                                    <td><strong>Écart :</strong></td>
                                    <td class="{{ $ecartClass }}">{{ number_format($ecart, 2, ',', ' ') }} F</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="page-break"></div>
    @endforeach

    @php
        $grandTotalAmount = $versements->sum('amout');
        $grandTotalNotes = $versements->sum('amout_notes');
        $grandTotalFactures = $versements->flatMap(fn($versement) => $versement->factures)->sum('total_amount');
        $grandTotalEcart = ($grandTotalAmount + $grandTotalNotes) - $grandTotalFactures;
        $grandTotalEcartClass = $grandTotalEcart >= 0 ? 'blue-text' : 'red-text';
    @endphp

    <div class="totals-container">
        <h2 style="text-align: right;">Totaux Généraux</h2>
        <table class="totals-table">
            <thead>
                <tr>
                    <th>Montant total des versements</th>
                    <th>Montant total des notes</th>
                    <th>Montant total des factures</th>
                    <th>Écart total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ number_format($grandTotalAmount, 2, ',', ' ') }} F</td>
                    <td>{{ number_format($grandTotalNotes, 2, ',', ' ') }} F</td>
                    <td>{{ number_format($grandTotalFactures, 2, ',', ' ') }} F</td>
                    <td class="{{ $grandTotalEcartClass }}">{{ number_format($grandTotalEcart, 2, ',', ' ') }} F</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>