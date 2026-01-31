<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        /** Configuration de la page et de la police */
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 0;
            color: #333;
        }
        @page {
            margin: 1cm;
        }

        /** En-tête du document */
        .header {
            width: 100%;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
        }
        .header-info {
            text-align: right;
            font-size: 10px;
            color: #7f8c8d;
        }
        
        /** Boîte d'informations (Filtres) */
        .info-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            text-transform: uppercase;
            font-size: 9px;
        }
        .info-value {
            font-weight: bold;
            color: #000;
            font-size: 12px;
            margin-right: 20px;
        }

        /** Tableau des données */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #2c3e50;
            color: #ffffff;
            font-weight: bold;
            padding: 8px 5px;
            text-align: left;
            text-transform: uppercase;
            font-size: 9px;
            border: 1px solid #2c3e50;
        }
        td {
            padding: 6px 5px;
            border: 1px solid #ddd;
            vertical-align: middle;
        }
        
        /* Gestion des sauts de page pour le tableau */
        tr { page-break-inside: avoid; }
        thead { display: table-header-group; }
        tfoot { display: table-row-group; }

        /** Styles spécifiques aux colonnes */
        .col-date { width: 90px; }
        .col-boutique { width: 120px; font-weight: bold; color: #2980b9; }
        .col-qty { text-align: right; font-family: 'Courier New', monospace; font-weight: bold; width: 60px; }
        .col-type { text-align: center; width: 60px; font-weight: bold; font-size: 9px; }
        
        /** Badges et Couleurs */
        .text-green { color: #27ae60; }
        .text-red { color: #c0392b; }
        .bg-green { background-color: #eafaf1; color: #27ae60; padding: 2px 4px; border-radius: 3px; }
        .bg-red { background-color: #fdedec; color: #c0392b; padding: 2px 4px; border-radius: 3px; }
        
        .sku { font-size: 9px; color: #777; }
        .flux-detail { font-size: 9px; color: #666; }
        .label-italic { font-style: italic; color: #888; font-size: 9px; }

        /** Pied de page */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            font-size: 9px;
            color: #999;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 5px;
        }
    </style>
</head>
<body>

    <table class="header">
        <tr>
            <td style="border: none; padding: 0;">
                <div class="header-title">{{ $title }}</div>
                <div style="margin-top: 5px; font-size: 12px;">Société: <strong>MA BOUTIQUE ERP</strong></div>
            </td>
            <td style="border: none; padding: 0;" class="header-info">
                <div>Généré le : {{ date('d/m/Y à H:i') }}</div>
                <div>Par : {{ Auth::user()->first_name }} {{ Auth::user()->last_name }}</div>
                <div>Page <script type="text/php">echo $PAGE_NUM;</script> / <script type="text/php">echo $PAGE_COUNT;</script></div>
            </td>
        </tr>
    </table>

    <div class="info-box">
        <table style="width: 100%; border: none; margin: 0;">
            <tr>
                <td style="border: none; padding: 0; width: 50%;">
                    <span class="info-label">Périmètre Boutique :</span><br>
                    <span class="info-value">{{ $boutique }}</span>
                </td>
                <td style="border: none; padding: 0; width: 50%;">
                    <span class="info-label">Période Analysée :</span><br>
                    <span class="info-value">{{ $date_range }}</span>
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th class="col-date">Date</th>
                <th>Boutique</th>
                <th>Article</th>
                <th class="col-type">Type</th>
                <th class="col-qty">Qté</th>
                <th>Flux (Origine > Destination)</th>
                <th>Auteur</th>
            </tr>
        </thead>
        <tbody>
            @forelse($moves as $move)
            <tr>
                <td>
                    {{ $move->created_at->format('d/m/Y') }}<br>
                    <span style="color:#888; font-size:9px;">{{ $move->created_at->format('H:i') }}</span>
                </td>

                <td class="col-boutique">
                    {{ $move->boutique->name ?? 'N/A' }}
                </td>

                <td>
                    <strong>{{ $move->product->designation ?? 'Produit supprimé' }}</strong><br>
                    <span class="sku">SKU: {{ $move->product->sku ?? '-' }}</span>
                </td>

                <td class="col-type">
                    @if($move->type === 'entree')
                        <span class="bg-green">ENTRÉE</span>
                    @else
                        <span class="bg-red">SORTIE</span>
                    @endif
                </td>

                <td class="col-qty {{ $move->type === 'entree' ? 'text-green' : 'text-red' }}">
                    {{ $move->type === 'entree' ? '+' : '-' }}{{ number_format($move->qty, 2, ',', ' ') }}
                </td>

                <td>
                    <div class="flux-detail">
                        {{ $move->departure }} &rarr; <strong>{{ $move->destination }}</strong>
                    </div>
                    @if($move->label)
                        <div class="label-italic">"{{ Str::limit($move->label, 40) }}"</div>
                    @endif
                </td>

                <td>
                    {{ $move->user->first_name ?? '' }} {{ substr($move->user->last_name ?? '', 0, 1) }}.
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #777;">
                    Aucun mouvement trouvé pour cette période et ces critères.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div style="page-break-inside: avoid; width: 40%; float: right; margin-top: 10px;">
        <table style="border: 2px solid #ccc;">
            <tr style="background-color: #eee;">
                <td colspan="2" style="text-align: center; font-weight: bold;">SYNTHÈSE RAPIDE</td>
            </tr>
            <tr>
                <td>Total Entrées</td>
                <td style="text-align: right; color: green; font-weight: bold;">
                    {{ $moves->where('type', 'entree')->count() }} mvts
                </td>
            </tr>
            <tr>
                <td>Total Sorties</td>
                <td style="text-align: right; color: red; font-weight: bold;">
                    {{ $moves->where('type', 'sortie')->count() }} mvts
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Document confidentiel à usage interne - Ne pas diffuser.
    </div>

</body>
</html>