<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Historique des Mouvements</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #333; margin: 0; padding: 0; }
        @page { margin: 1cm; }
        
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #2c3e50; text-transform: uppercase; font-size: 18px; }
        .header p { margin: 4px 0; color: #666; font-size: 10px; }
        
        .info-box { border: 1px solid #ddd; padding: 12px; margin-bottom: 15px; background: #f9f9f9; border-radius: 4px; }
        .info-box strong { color: #2c3e50; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
        th, td { border: 1px solid #ddd; padding: 7px; text-align: left; word-wrap: break-word; }
        th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; font-size: 9px; color: #444; }
        
        /* Alternance de couleurs pour la lecture */
        tbody tr:nth-child(even) { background-color: #fafafa; }

        .type-entree { color: #27ae60; font-weight: bold; }
        .type-sortie { color: #c0392b; font-weight: bold; }
        
        .col-qty { text-align: right; font-family: 'Courier New', monospace; font-weight: bold; font-size: 12px; }
        .col-stock { text-align: right; font-family: 'Courier New', monospace; font-weight: bold; background-color: #f0f4f7; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #aaa; border-top: 1px solid #eee; padding-top: 5px; }
        
        /* Nettoyage des bordures pour l'impression */
        .no-border { border: none; }
    </style>
</head>
<body>

    <div class="header">
        <h1>HISTORIQUE DES MOUVEMENTS</h1>
        <p>Boutique : <strong>{{ $boutique }}</strong></p>
        <p>Généré le : {{ $date }} par {{ Auth::user()->first_name }} {{ Auth::user()->last_name }}</p>
    </div>

    <div class="info-box">
        <table class="no-border" style="width: 100%;">
            <tr class="no-border">
                <td class="no-border" style="width: 70%;">
                    <strong>Filtres appliqués :</strong><br>
                    @if($filters['start']) Du : {{ $filters['start'] }} @endif
                    @if($filters['end']) Au : {{ $filters['end'] }} @endif
                    @if($filters['type'] && $filters['type'] !== 'all') | Type : {{ strtoupper($filters['type']) }} @endif
                </td>
                <td class="no-border" style="width: 30%; text-align: right;">
                    <strong>Total mouvements :</strong> {{ $moves->count() }}
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 12%">Date</th>
                <th style="width: 9%">Type</th>
                <th style="width: 24%">Produit</th>
                <th style="width: 10%; text-align: right;">Qté</th>
                <th style="width: 10%; text-align: right;">Stock Après</th>
                <th style="width: 23%">Flux (De &rarr; Vers)</th>
                <th style="width: 12%">Auteur</th>
            </tr>
        </thead>
        <tbody>
            @forelse($moves as $move)
            <tr>
                <td>
                    {{ $move->created_at->format('d/m/Y') }}<br>
                    <span style="color:#888; font-size:9px">{{ $move->created_at->format('H:i') }}</span>
                </td>
                <td>
                    @if($move->type === 'entree')
                        <span class="type-entree">ENTRÉE</span>
                    @else
                        <span class="type-sortie">SORTIE</span>
                    @endif
                </td>
                <td>
                    <strong>{{ $move->product->designation }}</strong><br>
                    <span style="color:#777; font-size:9px">SKU: {{ $move->product->sku }}</span>
                </td>
                <td class="col-qty {{ $move->type === 'entree' ? 'type-entree' : 'type-sortie' }}">
                    {{ $move->type === 'entree' ? '+' : '-' }}{{ number_format($move->qty, 2, ',', ' ') }}
                </td>
                <td class="col-stock">
                    {{ number_format($move->remaining_stock, 2, ',', ' ') }}
                </td>
                <td>
                    <span style="font-size: 10px;">{{ $move->departure }} &rarr; <strong>{{ $move->destination }}</strong></span>
                    @if($move->label)
                        <br><i style="color:#666; font-size:9px">"{{ Str::limit($move->label, 40) }}"</i>
                    @endif
                </td>
                <td>{{ $move->user->first_name }} {{ substr($move->user->last_name, 0, 1) }}.</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #999;">
                    Aucun mouvement enregistré pour cette sélection.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        MA BOUTIQUE ERP - Document interne confidentiel - Page <script type="text/php">echo $PAGE_NUM;</script> / <script type="text/php">echo $PAGE_COUNT;</script>
    </div>

</body>
</html>