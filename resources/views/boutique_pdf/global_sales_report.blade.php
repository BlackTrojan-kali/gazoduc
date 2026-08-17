<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport Ventes</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; }
        th { background-color: #f2f2f2; text-align: left; }
        .header { text-align: center; margin-bottom: 20px; }
        .total { font-weight: bold; text-align: right; }
        .group-header { background-color: #333; color: white; padding: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>RAPPORT DES VENTES</h2>
        <h3>{{ $boutique_name }}</h3>
        <p>Période : {{ $start_date->format('d/m/Y') }} au {{ $end_date->format('d/m/Y') }}</p>
    </div>

    @if($groupedSales)
        {{-- MODE MULTI-BOUTIQUES (Groupé) --}}
        @foreach($groupedSales as $boutique => $salesGroup)
            <div class="group-header">{{ $boutique }} - Total: {{ number_format($salesGroup->sum('total_ttc'), 0, ',', ' ') }} FCFA</div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th><th>Ref</th><th>Vendeur</th><th>Client</th><th>Articles</th><th style="text-align:right">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($salesGroup as $sale)
                        <tr>
                            <td>{{ $sale->created_at->format('d/m/Y H:i') }}</td>
                            <td>{{ $sale->facture_code }}</td>
                            <td>{{ $sale->user->first_name }}</td>
                            <td>{{ $sale->customer->name ?? '-' }}</td>
                            <td>{{ $sale->items->count() }}</td>
                            <td style="text-align:right">{{ number_format($sale->total_ttc, 0, ',', ' ') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endforeach
    @else
        {{-- MODE SIMPLE (Une seule boutique ou liste plate) --}}
        <table>
            <thead>
                <tr>
                    <th>Date</th><th>Boutique</th><th>Ref</th><th>Vendeur</th><th>Client</th><th style="text-align:right">Montant</th>
                </tr>
            </thead>
            <tbody>
                @foreach($sales as $sale)
                    <tr>
                        <td>{{ $sale->created_at->format('d/m/Y H:i') }}</td>
                        <td>{{ $sale->boutique->name }}</td>
                        <td>{{ $sale->facture_code }}</td>
                        <td>{{ $sale->user->first_name }}</td>
                        <td>{{ $sale->customer->name ?? '-' }}</td>
                        <td style="text-align:right">{{ number_format($sale->total_ttc, 0, ',', ' ') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <h3 style="text-align: right; margin-top: 20px;">
        CHIFFRE D'AFFAIRES TOTAL PÉRIODE : {{ number_format($total_revenue, 0, ',', ' ') }} FCFA
    </h3>
</body>
</html>