<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Historique des Mouvements</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #333; }
        .header p { margin: 2px 0; color: #666; font-size: 10px; }
        .info-box { border: 1px solid #ddd; padding: 10px; margin-bottom: 15px; background: #f9f9f9; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; font-size: 10px; }
        
        .type-entree { color: green; font-weight: bold; }
        .type-sortie { color: red; font-weight: bold; }
        .badge { padding: 2px 5px; border-radius: 3px; font-size: 9px; color: white; }
        .bg-green { background-color: #2ecc71; }
        .bg-red { background-color: #e74c3c; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 5px; }
    </style>
</head>
<body>

    <div class="header">
        <h1>HISTORIQUE DES MOUVEMENTS</h1>
        <p>Boutique : <strong>{{ $boutique }}</strong></p>
        <p>Généré le : {{ $date }}</p>
    </div>

    @if($filters['start'] || $filters['end'] || $filters['type'])
    <div class="info-box">
        <strong>Filtres appliqués :</strong>
        @if($filters['start']) Du : {{ $filters['start'] }} @endif
        @if($filters['end']) Au : {{ $filters['end'] }} @endif
        @if($filters['type'] && $filters['type'] !== 'all') Type : {{ strtoupper($filters['type']) }} @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th style="width: 12%">Date</th>
                <th style="width: 8%">Type</th>
                <th style="width: 30%">Produit</th>
                <th style="width: 10%">Qté</th>
                <th style="width: 25%">Flux (De > Vers)</th>
                <th style="width: 15%">Auteur</th>
            </tr>
        </thead>
        <tbody>
            @foreach($moves as $move)
            <tr>
                <td>{{ $move->created_at->format('d/m/Y H:i') }}</td>
                <td>
                    @if($move->type === 'entree')
                        <span class="type-entree">ENTRÉE</span>
                    @else
                        <span class="type-sortie">SORTIE</span>
                    @endif
                </td>
                <td>
                    <strong>{{ $move->product->designation }}</strong><br>
                    <span style="color:#888; font-size:10px">{{ $move->product->sku }}</span>
                </td>
                <td style="text-align: right; font-family: monospace; font-size: 13px;">
                    {{ $move->type === 'entree' ? '+' : '-' }}{{ floatval($move->qty) }}
                </td>
                <td>
                    {{ $move->departure }} &rarr; <strong>{{ $move->destination }}</strong>
                    @if($move->label)
                        <br><i style="color:#666; font-size:10px">"{{ $move->label }}"</i>
                    @endif
                </td>
                <td>{{ $move->user->first_name }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Document généré par le système de gestion - Page 1
    </div>

</body>
</html>