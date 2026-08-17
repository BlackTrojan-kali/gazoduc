<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Déclaration Ventes CSPH</title>
    <style>
        body { font-family: 'Helvetica', Arial, sans-serif; font-size: 11px; color: #000; }
        .title-box { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; text-decoration: underline; color: #1a202c; }
        .subtitle { text-align: center; font-size: 11px; margin-top: -15px; margin-bottom: 25px; color: #4a5568; text-transform: uppercase;}
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #333; padding: 8px 6px; text-align: left; }
        th { background-color: #edf2f7; text-align: center; font-weight: bold; font-size: 10px; text-transform: uppercase;}
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .ville-cell { font-weight: bold; vertical-align: middle; background-color: #f7fafc; font-size: 12px;}
        .grand-total { background-color: #e2e8f0; font-size: 13px; font-weight: bold; }
        .negative { color: #e53e3e; }
        .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #718096; }
    </style>
</head>
<body>

    <div class="title-box">
        PEREQUATION TRANSPORT SUR VENTE "GPL"
    </div>
    <div class="subtitle">
        PÉRIODE : {{ $periode }}
    </div>

    <table>
        <thead>
            <tr>
                <th>Ville</th>
                <th>Gaz</th>
                <th>Quantités (T)</th>
                <th>Taux (FCFA)</th>
                <th>Total (FCFA)</th>
            </tr>
        </thead>
        <tbody>
            @php $currentVille = ''; @endphp
            
            @forelse($lignes as $ligne)
                <tr>
                    @if($ligne['ville'] !== $currentVille)
                        @php 
                            $count = collect($lignes)->where('ville', $ligne['ville'])->count();
                            $currentVille = $ligne['ville'];
                        @endphp
                        <td rowspan="{{ $count }}" class="ville-cell">{{ $ligne['ville'] }}</td>
                    @endif
                    
                    <td>
                        {{ $ligne['source'] }}<br>
                        <span style="color: #4a5568; font-size: 10px;">{{ $ligne['type'] }}</span>
                    </td>
                    <td class="text-right">{{ number_format($ligne['quantite'], 4, ',', ' ') }}</td>
                    <td class="text-right {{ $ligne['taux'] < 0 ? 'negative' : '' }}">
                        {{ number_format($ligne['taux'], 2, ',', ' ') }}
                    </td>
                    <td class="text-right font-bold {{ $ligne['total'] < 0 ? 'negative' : '' }}">
                        {{ number_format($ligne['total'], 0, ',', ' ') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center">Aucune vente de gaz enregistrée pour cette période.</td>
                </tr>
            @endforelse
            
            <tr class="grand-total">
                <td colspan="2" class="text-right">TOTAL GÉNÉRAL</td>
                <td class="text-right">{{ number_format($totalTonnes, 4, ',', ' ') }}</td>
                <td class="text-right">-</td>
                <td class="text-right {{ $grandTotal < 0 ? 'negative' : '' }}">
                    {{ number_format($grandTotal, 0, ',', ' ') }} F CFA
                </td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Document généré automatiquement par le module de déclaration de l'ERP Ikarootech.<br>
        Basé sur les factures validées de la licence Gaz pour la période concernée.
    </div>

</body>
</html>