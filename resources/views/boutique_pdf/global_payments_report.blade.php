<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport Versements</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; text-align: left; }
        .header { text-align: center; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>RAPPORT DES VERSEMENTS</h2>
        <h3>{{ $boutique_name }}</h3>
        <p>Période : {{ $start_date->format('d/m/Y') }} au {{ $end_date->format('d/m/Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Boutique</th>
                <th>Référence</th>
                <th>Caissier</th>
                <th>Nb Factures</th>
                <th style="text-align:right">Montant</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payments as $payment)
                <tr>
                    <td>{{ $payment->created_at->format('d/m/Y H:i') }}</td>
                    <td>{{ $payment->user->boutique->name ?? 'N/A' }}</td>
                    <td>{{ $payment->reference ?? '-' }}</td>
                    <td>{{ $payment->user->first_name }} {{ $payment->user->last_name }}</td>
                    <td>{{ $payment->productSales->count() }}</td>
                    <td style="text-align:right; font-weight:bold;">
                        {{ number_format($payment->amount, 0, ',', ' ') }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h3 style="text-align: right; margin-top: 20px; border-top: 2px solid #000; padding-top: 10px;">
        TOTAL VERSEMENTS : {{ number_format($total_amount, 0, ',', ' ') }} FCFA
    </h3>
</body>
</html>