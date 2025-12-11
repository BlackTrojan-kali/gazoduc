<!DOCTYPE html>
<html>
<head>
    <title>{{ $reportTitle }}</title>
    <style>
        /* Styles CSS pour le PDF */
        body { font-family: sans-serif; font-size: 10px; }
        h1 { font-size: 18px; text-align: center; }
        .header { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; }
        /* Style spécifique pour la ligne de total */
        tfoot td {
            background-color: #e0e0e0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $reportTitle }}</h1>
        <p><strong>Période:</strong> {{ $period }}</p>
        <p><strong>Agence:</strong> {{ $filters['agency_name'] }} | <strong>Carburant:</strong> {{ $filters['article_name'] }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Article</th>
                <th>Qté (L)</th>
                <th>Prix Unitaire</th>
                <th>Total (XOF)</th>
                <th>Agence</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalQuantity = 0;
                $totalTotalPrice = 0;
            @endphp
            @foreach ($sales as $sale)
            <tr>
                <td>{{ $sale->id }}</td>
                <td>{{ $sale->client->name ?? 'N/A' }}</td>
                <td>{{ $sale->article->name ?? 'N/A' }}</td>
                <td>{{ number_format($sale->quantity, 2, ',', ' ') }}</td>
                <td>{{ number_format($sale->unitPrice, 0, ',', ' ') }}</td>
                <td>{{ number_format($sale->total_price, 0, ',', ' ') }}</td>
                <td>{{ $sale->agency->name ?? 'N/A' }}</td>
                <td>{{ $sale->created_at->format('d/m/Y H:i') }}</td>
            </tr>
            @php
                // Accumulation des totaux
                $totalQuantity += $sale->quantity;
                $totalTotalPrice += $sale->total_price;
            @endphp
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL DES VENTES:</td>
                <td style="text-align: left;">{{ number_format($totalQuantity, 2, ',', ' ') }}</td>
                <td></td> {{-- Colonne Prix Unitaire laissée vide --}}
                <td style="text-align: left;">{{ number_format($totalTotalPrice, 0, ',', ' ') }}</td>
                <td colspan="2"></td> {{-- Colonnes Agence et Date laissées vides --}}
            </tr>
        </tfoot>
    </table>
</body>
</html>
