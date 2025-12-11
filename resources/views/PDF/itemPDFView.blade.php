<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'exportation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 24px;
        }
        .filters {
            background-color: #f0f8ff;
            padding: 10px;
            border: 1px solid #e0f0ff;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .filter-item {
            margin-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            color: #555;
            text-align: center;
        }
        td {
            text-align: center;
        }
        .text-left {
            text-align: left;
        }
        .text-right {
            text-align: right;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .totals-table th, .totals-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
        .totals-table th {
            background-color: #4CAF50;
            color: #fff;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Rapport des Articles Vendus</h1>
    </div>

    <div class="filters">
        <div class="filter-item"><strong>Filtres appliqués :</strong></div>
        <div class="filter-item">Article: {{ $filters['selectedArticle'] ?? 'Tous' }}</div>
        <div class="filter-item">Agence: {{ $filters['selectedAgency'] ?? 'Toutes' }}</div>
        <div class="filter-item">Période: du {{ $filters['startDate'] ?? 'Début' }} au {{ $filters['endDate'] ?? 'Fin' }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID Facture</th>
                <th class="text-left">Article</th>
                <th>Quantité</th>
                <th class="text-right">Prix Unitaire</th>
                <th class="text-right">Sous-total</th>
                <th class="text-left">Agence</th>
                <th>Date de Facture</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $item)
            <tr>
                <td>#{{ $item->facture_id }}</td>
                <td class="text-left">{{ $item->article->name ?? 'N/A' }}</td>
                <td>{{ $item->quantity }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 2, ',', ' ') }} F</td>
                <td class="text-right">{{ number_format($item->subtotal, 2, ',', ' ') }} F</td>
                <td class="text-left">{{ $item->facture->agency->name ?? 'N/A' }}</td>
                <td>{{ \Carbon\Carbon::parse($item->facture->created_at ?? null)->format('d/m/Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals-table">
        <thead>
            <tr>
                <th>Total des Quantités</th>
                <th>Total des Sous-totaux</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $items->sum('quantity') }}</td>
                <td>{{ number_format($items->sum('subtotal'), 2, ',', ' ') }} F</td>
            </tr>
        </tbody>
    </table>

</body>
</html>
