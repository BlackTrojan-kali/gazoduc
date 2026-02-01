<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Historique des Ventes</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 20px; color: #1a56db; }
        .header p { margin: 2px 0; }
        
        .summary { margin-bottom: 20px; background: #f9fafb; padding: 10px; border: 1px solid #eee; }
        .summary table { width: 100%; }
        .summary td { font-weight: bold; }

        table.main-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        table.main-table th { background-color: #f3f4f6; padding: 8px; text-align: left; border-bottom: 1px solid #ccc; font-size: 11px; }
        table.main-table td { padding: 8px; border-bottom: 1px solid #eee; vertical-align: top; }
        
        .items-table { width: 100%; font-size: 10px; color: #555; background-color: #fff; border: 1px dashed #ddd; margin-top: 5px; }
        .items-table th { background-color: #fff; text-align: left; padding: 2px 5px; font-weight: bold; border-bottom: 1px dashed #eee; }
        .items-table td { padding: 2px 5px; }

        .text-right { text-align: right; }
        .badge { background: #e0f2fe; color: #0369a1; padding: 2px 5px; border-radius: 4px; font-size: 10px; }
    </style>
</head>
<body>

    <div class="header">
        <h1>{{ $boutique->name ?? 'MA BOUTIQUE' }}</h1>
        <p>Rapport Historique des Ventes</p>
        <p>Période du : <strong>{{ $start_date->format('d/m/Y') }}</strong> au <strong>{{ $end_date->format('d/m/Y') }}</strong></p>
        <p><small>Généré par : {{ $generated_by->name }} le {{ now()->format('d/m/Y H:i') }}</small></p>
    </div>

    <div class="summary">
        <table>
            <tr>
                <td>Nombre de ventes : {{ $count_sales }}</td>
                <td class="text-right">Chiffre d'affaires Total : {{ number_format($total_period, 0, ',', ' ') }} FCFA</td>
            </tr>
        </table>
    </div>

    <table class="main-table">
        <thead>
            <tr>
                <th style="width: 15%">Réf / Date</th>
                <th style="width: 15%">Client</th>
                <th style="width: 15%">Vendeur</th>
                <th style="width: 40%">Détails Articles</th>
                <th style="width: 15%" class="text-right">Montant Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($sales as $sale)
            <tr>
                <td>
                    <strong>{{ $sale->facture_code }}</strong><br>
                    {{ $sale->created_at->format('d/m/Y H:i') }}
                </td>
                <td>{{ $sale->customer->name ?? 'Client de passage' }}</td>
                <td>{{ $sale->user->first_name }}</td>
                
                {{-- Colonne Détails Articles --}}
                <td>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th class="text-right">Qté</th>
                                <th class="text-right">P.U</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($sale->items as $item)
                            <tr>
                                <td>{{ $item->product->designation }}</td>
                                <td class="text-right">{{ $item->qty }}</td>
                                <td class="text-right">{{ number_format($item->unit_price, 0, ',', ' ') }}</td>
                                <td class="text-right">{{ number_format($item->sub_total, 0, ',', ' ') }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </td>

                <td class="text-right">
                    <strong>{{ number_format($sale->total_ttc, 0, ',', ' ') }} FCFA</strong><br>
                    <span class="badge">{{ ucfirst($sale->payment_mode) }}</span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">Aucune vente trouvée sur cette période.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>