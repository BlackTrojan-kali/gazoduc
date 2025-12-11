<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport des Ventes</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .header-logo {
            display: table-cell;
            text-align: left;
            vertical-align: middle;
        }
        .header-info {
            display: table-cell;
            text-align: right;
            vertical-align: middle;
        }
        .header h1 {
            font-size: 24px;
            color: #007bff;
            margin: 0;
        }
        .filters {
            margin-bottom: 20px;
            background-color: #f8f9fa;
            border-left: 3px solid #007bff;
            padding: 10px;
        }
        .filters p {
            margin: 0 0 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: left;
        }
        thead th {
            background-color: #e9ecef;
            font-weight: bold;
        }
        tfoot td {
            background-color: #e9ecef;
            font-weight: bold;
            text-align: right;
        }
        .total-cell {
            font-size: 14px;
            color: #007bff;
            text-align: right !important;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-logo">
            <!-- Remplacer par le logo de l'entreprise -->
            <img src="https://placehold.co/150x50/333/fff?text=Logo" alt="Logo de l'entreprise">
        </div>
        <div class="header-info">
            <h1>Rapport des Ventes</h1>
            <p>Généré le: {{ now()->format('d/m/Y H:i') }}</p>
        </div>
    </div>

    <div class="filters">
        <p><strong>Filtres appliqués:</strong></p>
        <p>Client: {{ $clientId ? $clients->firstWhere('id', $clientId)->name : 'Tous les clients' }}</p>
        <p>Agence: {{ $agencyId ? $agencies->firstWhere('id', $agencyId)->name : 'Toutes les agences' }}</p>
        <p>Période: Du {{ $startDate ?? 'début' }} au {{ $endDate ?? 'fin' }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Numéro de facture</th>
                <th>Client</th>
                <th>Agence</th>
                <th>Détails</th>
                <th style="width: 120px; text-align: right;">Montant</th>
            </tr>
        </thead>
        <tbody>
            @php $totalReportAmount = 0; @endphp
            @foreach ($sales as $sale)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($sale->date)->format('d/m/Y') }}</td>
                    <td>{{ $sale->invoice_number }}</td>
                    <td>{{ $sale->client->name }}</td>
                    <td>{{ $sale->agency->name }}</td>
                    <td>
                        @if ($sale->items->isNotEmpty())
                            <ul>
                                @foreach ($sale->items as $item)
                                    <li>{{ $item->article->name }} ({{ $item->quantity }} x {{ number_format($item->unit_price, 2, ',', ' ') }} F)</li>
                                @endforeach
                            </ul>
                        @endif
                    </td>
                    <td style="text-align: right;">{{ number_format($sale->total_amount, 2, ',', ' ') }} F</td>
                </tr>
                @php $totalReportAmount += $sale->total_amount; @endphp
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5" style="text-align: right;">Total général du rapport:</td>
                <td class="total-cell">{{ number_format($totalReportAmount, 2, ',', ' ') }} F</td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <p>Généré par [Nom de l'application]. Page <span class="page-number"></span></p>
    </div>
</body>
</html>
