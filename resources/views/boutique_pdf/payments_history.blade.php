<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport des Versements</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 18px; color: #2d3748; }
        .summary { background: #f7fafc; padding: 10px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #edf2f7; text-align: left; padding: 8px; border-bottom: 1px solid #cbd5e0; font-size: 11px; }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        
        .amount { font-weight: bold; text-align: right; }
        .sub-info { font-size: 10px; color: #718096; margin-top: 2px; }
        .badge { background: #ebf8ff; color: #2b6cb0; padding: 2px 4px; border-radius: 3px; font-size: 9px; display: inline-block; margin-right: 2px; }
    </style>
</head>
<body>

    <div class="header">
        <h1>HISTORIQUE DES VERSEMENTS</h1>
        <p>Période : {{ $start_date->format('d/m/Y') }} au {{ $end_date->format('d/m/Y') }}</p>
        <p><small>Edité par : {{ $generated_by->name }} le {{ now()->format('d/m/Y H:i') }}</small></p>
    </div>

    <div class="summary">
        <strong>Total Versements sur la période :</strong> 
        <span style="float: right; font-size: 14px;">{{ number_format($total_period, 0, ',', ' ') }} FCFA</span>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 15%">Date</th>
                <th style="width: 20%">Référence</th>
                <th style="width: 20%">Libellé</th>
                <th style="width: 30%">Factures Réglées</th>
                <th style="width: 15%" class="text-right">Montant</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payments as $payment)
            <tr>
                <td>{{ $payment->created_at->format('d/m/Y H:i') }}</td>
                <td>
                    <strong>{{ $payment->reference ?? 'N/A' }}</strong>
                </td>
                <td>{{ $payment->label }}</td>
                <td>
                    @if($payment->productSales->count() > 0)
                        @foreach($payment->productSales as $sale)
                            <span class="badge">{{ $sale->facture_code }}</span>
                        @endforeach
                    @else
                        <span style="color: #a0aec0; font-style: italic;">Aucune facture liée</span>
                    @endif
                </td>
                <td class="amount">
                    {{ number_format($payment->amount, 0, ',', ' ') }} FCFA
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">Aucun versement trouvé sur cette période.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>