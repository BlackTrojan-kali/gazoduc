<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Rapport Historique des Mouvements</title>
    <style>
        /* --- Réinitialisation et Base --- */
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 8px;
            color: #111;
            line-height: 1.2;
            margin: 0;
            padding: 0;
        }

        /* --- En-tête --- */
        .header {
            width: 100%;
            text-align: center;
            border-bottom: 2px solid #3f51b5;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .header h1 {
            font-size: 16px;
            color: #3f51b5;
            text-transform: uppercase;
            margin: 0 0 5px 0;
        }
        .header-info {
            font-size: 9px;
            color: #555;
            margin-bottom: 3px;
        }
        .badges {
            margin-top: 5px;
        }
        .badge {
            background-color: #eee;
            padding: 2px 5px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 8px;
            margin: 0 2px;
        }

        /* --- Tableau --- */
        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed; /* Important pour respecter les largeurs */
        }

        th, td {
            border: 0.5px solid #888;
            padding: 4px;
            vertical-align: middle;
            word-wrap: break-word;
        }

        /* En-têtes de colonnes */
        thead th {
            background-color: #3f51b5;
            color: #fff;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            font-size: 7px;
        }

        /* --- Styles des lignes --- */
        tr:nth-child(even) { background-color: #f9f9f9; }
        
        /* Ligne Supprimée (Soft Delete) */
        .deleted-row {
            background-color: #fee2e2 !important; /* Rouge pâle */
            color: #991b1b;
            text-decoration: line-through;
        }
        .deleted-row td { border-color: #fca5a5; }

        /* Cellules spécifiques */
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        
        /* Cellules de quantités (Zéro en gris clair pour lisibilité) */
        .qty-zero { color: #ccc; }

        /* --- Totaux --- */
        .total-row {
            background-color: #e0e7ff !important; /* Bleu très pâle */
            border-top: 2px solid #3f51b5;
            font-weight: bold;
            color: #1e1b4b;
        }

        /* --- Pied de page --- */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            font-size: 6px;
            text-align: right;
            border-top: 1px solid #ccc;
            padding-top: 5px;
            background-color: #fff;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Rapport Global des Mouvements</h1>
        
        <div class="header-info">
            <strong>Période :</strong> Du {{ $startDate }} au {{ $endDate }}
        </div>
        
        <div class="header-info">
            <span class="badge">Agence : {{ $agencyName }}</span>
            <span class="badge">Service : {{ $serviceName }}</span>
            <span class="badge">Type : {{ $movementTypeName }}</span>
        </div>
        
        @if(isset($articleName) && $articleName !== 'Tous les articles')
            <div class="header-info" style="margin-top: 4px;">
                <strong>Article ciblé :</strong> {{ $articleName }}
            </div>
        @endif
    </div>

    @if($movements->isEmpty())
        <div style="text-align: center; padding: 20px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px;">
            <strong>Aucune donnée trouvée.</strong><br>
            Aucun mouvement ne correspond aux critères sélectionnés pour cette période.
        </div>
    @else
        <table>
            <thead>
                <tr>
                    <th style="width: 9%;" rowspan="2">Date</th>
                    <th style="width: 28%;" colspan="4">Qualification (Détails)</th>
                    <th style="width: 15%;" rowspan="2">Article</th>
                    <th style="width: 14%;" colspan="2">Flux Global</th>
                    <th style="width: 8%;" rowspan="2">Stock</th>
                    <th style="width: 10%;" rowspan="2">Agence</th>
                    <th style="width: 16%;" rowspan="2">Info / User</th>
                </tr>
                <tr>
                    <th style="width: 7%;">Perte</th>
                    <th style="width: 7%;">Achat</th>
                    <th style="width: 7%;">Réép.</th>
                    <th style="width: 7%;">Cons.</th>
                    <th style="width: 7%;">Entrée</th>
                    <th style="width: 7%;">Sortie</th>
                </tr>
            </thead>
            <tbody>
                @php
                    // Initialisation des totaux
                    $tPerte = 0; $tAchat = 0; $tRepreuve = 0; $tConsigne = 0;
                    $tEntree = 0; $tSortie = 0;
                @endphp

                @foreach($movements as $mov)
                    @php
                        // Pré-calcul pour éviter la logique dans le HTML
                        $qty = $mov->quantity;
                        $qual = strtolower($mov->qualification); // Normalisation
                        $type = $mov->movement_type;
                        
                        // Valeurs pour les colonnes spécifiques
                        $valPerte = ($qual === 'perte') ? $qty : 0;
                        $valAchat = ($qual === 'achat') ? $qty : 0;
                        $valRepreuve = ($qual === 'repreuve' || $qual === 'reepreuve') ? $qty : 0;
                        $valConsigne = ($qual === 'consigne') ? $qty : 0;
                        
                        // Valeurs pour les colonnes Globales
                        $valEntree = ($type === 'entree') ? $qty : 0;
                        $valSortie = ($type === 'sortie') ? $qty : 0;

                        // Incrémentation des totaux (uniquement si ligne non supprimée pour la cohérence comptable, 
                        // OU inclure si vous voulez voir le total historique brut. Ici j'exclus les supprimés des totaux visuels)
                        if (!$mov->deleted_at) {
                            $tPerte += $valPerte;
                            $tAchat += $valAchat;
                            $tRepreuve += $valRepreuve;
                            $tConsigne += $valConsigne;
                            $tEntree += $valEntree;
                            $tSortie += $valSortie;
                        }
                    @endphp

                    <tr class="{{ $mov->deleted_at ? 'deleted-row' : '' }}">
                        <td class="text-center">
                            {{ \Carbon\Carbon::parse($mov->created_at)->format('d/m/y') }}<br>
                            <span style="font-size: 6px; color: #666;">{{ \Carbon\Carbon::parse($mov->created_at)->format('H:i') }}</span>
                        </td>

                        <td class="text-right {{ $valPerte == 0 ? 'qty-zero' : 'font-bold' }}">
                            {{ $valPerte > 0 ? number_format($valPerte, 2, ',', ' ') : '-' }}
                        </td>
                        <td class="text-right {{ $valAchat == 0 ? 'qty-zero' : 'font-bold' }}">
                            {{ $valAchat > 0 ? number_format($valAchat, 2, ',', ' ') : '-' }}
                        </td>
                        <td class="text-right {{ $valRepreuve == 0 ? 'qty-zero' : 'font-bold' }}">
                            {{ $valRepreuve > 0 ? number_format($valRepreuve, 2, ',', ' ') : '-' }}
                        </td>
                        <td class="text-right {{ $valConsigne == 0 ? 'qty-zero' : 'font-bold' }}">
                            {{ $valConsigne > 0 ? number_format($valConsigne, 2, ',', ' ') : '-' }}
                        </td>

                        <td>{{ $mov->article->name ?? 'Article Inconnu' }}</td>

                        <td class="text-right {{ $valEntree == 0 ? 'qty-zero' : 'font-bold' }}" style="background-color: #f0fdf4;">
                            {{ $valEntree > 0 ? '+'.number_format($valEntree, 2, ',', ' ') : '-' }}
                        </td>
                        <td class="text-right {{ $valSortie == 0 ? 'qty-zero' : 'font-bold' }}" style="background-color: #fef2f2;">
                            {{ $valSortie > 0 ? '-'.number_format($valSortie, 2, ',', ' ') : '-' }}
                        </td>

                        <td class="text-right font-bold">
                            {{ number_format($mov->stock, 2, ',', ' ') }}
                        </td>

                        <td style="font-size: 7px;">
                            {{ Str::limit($mov->agency->name ?? '-', 15) }}
                        </td>

                        <td>
                            <div style="font-size: 7px; margin-bottom: 2px;">{{ Str::limit($mov->description, 20) }}</div>
                            <i style="font-size: 6px; color: #555;">Par: {{ $mov->user->first_name ?? 'Sys' }}</i>
                        </td>
                    </tr>
                @endforeach

                <tr class="total-row">
                    <td class="text-right">TOTAL :</td>
                    <td class="text-right">{{ number_format($tPerte, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($tAchat, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($tRepreuve, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($tConsigne, 2, ',', ' ') }}</td>
                    <td></td> <td class="text-right">{{ number_format($tEntree, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($tSortie, 2, ',', ' ') }}</td>
                    <td colspan="3"></td> </tr>
            </tbody>
        </table>
    @endif

    <div class="footer">
        Ikarootech ERP - Document généré le {{ now()->format('d/m/Y à H:i') }} - Page <span class="page-number"></span>
    </div>

    <script type="text/php">
        if (isset($pdf)) {
            $text = "Page {PAGE_NUM} / {PAGE_COUNT}";
            $size = 6;
            $font = $fontMetrics->getFont("DejaVu Sans");
            $width = $fontMetrics->get_text_width($text, $font, $size) / 2;
            $x = ($pdf->get_width() - $width) / 2;
            $y = $pdf->get_height() - 20;
            $pdf->page_text($x, $y, $text, $font, $size);
        }
    </script>
</body>
</html>