<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Rapport Historique Détaillé</title>
    <style>
        /* --- Styles Globaux (Identiques au rapport Global) --- */
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 8px; color: #111; line-height: 1.2; margin: 0; padding: 0; }
        
        /* --- En-tête --- */
        .header { text-align: center; border-bottom: 2px solid #3f51b5; padding-bottom: 10px; margin-bottom: 15px; }
        .header h1 { font-size: 16px; color: #3f51b5; text-transform: uppercase; margin: 0 0 5px 0; }
        .header-info { font-size: 9px; color: #555; margin-bottom: 3px; }
        .badge { background-color: #eee; padding: 2px 5px; border-radius: 3px; font-weight: bold; font-size: 8px; margin: 0 2px; }

        /* --- Tableau --- */
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 0.5px solid #888; padding: 4px; vertical-align: middle; word-wrap: break-word; }
        
        /* En-têtes */
        thead th { background-color: #3f51b5; color: #fff; font-weight: bold; text-transform: uppercase; text-align: center; font-size: 7px; }

        /* Lignes & Cellules */
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .qty-zero { color: #ccc; } /* Discrétion pour les zéros */
        
        /* Ligne Supprimée */
        .deleted-row { background-color: #fee2e2 !important; color: #991b1b; text-decoration: line-through; }
        .deleted-row td { border-color: #fca5a5; }

        /* Totaux */
        .total-row { background-color: #e0e7ff !important; border-top: 2px solid #3f51b5; font-weight: bold; color: #1e1b4b; }

        /* Pied de page */
        .footer { position: fixed; bottom: 0; left: 0; right: 0; height: 20px; font-size: 6px; text-align: right; border-top: 1px solid #ccc; padding-top: 5px; background-color: #fff; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Rapport Historique Détaillé</h1>
        
        <div class="header-info">
            <strong>Période :</strong> Du {{ $startDate }} au {{ $endDate }}
        </div>

        <div class="header-info">
            @if(isset($agencyName) && $agencyName !== 'Toutes les agences')
                <span class="badge">Agence : {{ $agencyName }}</span>
            @endif
            @if(isset($serviceName) && $serviceName !== 'Tous les services')
                <span class="badge">Service : {{ $serviceName }}</span>
            @endif
        </div>

        @if(isset($articleName))
            <div class="header-info" style="margin-top: 4px; font-size: 10px;">
                <strong>Article : {{ $articleName }}</strong>
            </div>
        @endif
    </div>

    @if($movements->isEmpty())
        <div style="text-align: center; padding: 20px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px;">
            <strong>Aucun mouvement trouvé.</strong><br>
            Veuillez élargir vos critères de recherche.
        </div>
    @else
        <table>
            <thead>
                <tr>
                    <th style="width: 10%;" rowspan="2">Date</th>
                    <th style="width: 18%;" rowspan="2">Description</th>
                    <th style="width: 28%;" colspan="4">Détail Qualification</th>
                    <th style="width: 24%;" colspan="3">Flux Article</th>
                    <th style="width: 10%;" rowspan="2">Enregistré par</th>
                </tr>
                <tr>
                    <th style="width: 7%;">Achat</th>
                    <th style="width: 7%;">Cons.</th>
                    <th style="width: 7%;">Perte</th>
                    <th style="width: 7%;">Réép.</th>
                    <th style="width: 8%;">Entrée</th>
                    <th style="width: 8%;">Sortie</th>
                    <th style="width: 8%;">Stock</th>
                </tr>
            </thead>
            <tbody>
                @php
                    // Initialisation des totaux
                    $tAchat = 0; $tConsigne = 0; $tPerte = 0; $tRepreuve = 0;
                    $tEntree = 0; $tSortie = 0;
                    $lastStock = 0;
                @endphp

                @foreach($movements as $mov)
                    @php
                        $qty = $mov->quantity;
                        $qual = strtolower($mov->qualification);
                        $type = $mov->movement_type;

                        // Valeurs par colonne
                        $vAchat = ($qual === 'achat') ? $qty : 0;
                        $vCons = ($qual === 'consigne') ? $qty : 0;
                        $vPerte = ($qual === 'perte') ? $qty : 0;
                        $vRep = ($qual === 'repreuve' || $qual === 'reepreuve') ? $qty : 0;
                        
                        $vEntree = ($type === 'entree') ? $qty : 0;
                        $vSortie = ($type === 'sortie') ? $qty : 0;

                        // Mise à jour du dernier stock connu
                        $lastStock = $mov->stock ?? $lastStock;

                        // Totaux (Si non supprimé)
                        if (!$mov->deleted_at) {
                            $tAchat += $vAchat;
                            $tConsigne += $vCons;
                            $tPerte += $vPerte;
                            $tRepreuve += $vRep;
                            $tEntree += $vEntree;
                            $tSortie += $vSortie;
                        }
                    @endphp

                    <tr class="{{ $mov->deleted_at ? 'deleted-row' : '' }}">
                        <td class="text-center">
                            {{ \Carbon\Carbon::parse($mov->created_at)->format('d/m/Y') }}<br>
                            <span style="font-size: 6px; color: #666;">{{ \Carbon\Carbon::parse($mov->created_at)->format('H:i') }}</span>
                        </td>
                        
                        <td style="font-size: 7px;">
                            {{ Str::limit($mov->description ?? '-', 25) }}
                        </td>

                        <td class="text-right {{ $vAchat > 0 ? 'font-bold' : 'qty-zero' }}">
                            {{ $vAchat > 0 ? number_format($vAchat, 2, ',', ' ') : '-' }}
                        </td>
                        <td class="text-right {{ $vCons > 0 ? 'font-bold' : 'qty-zero' }}">
                            {{ $vCons > 0 ? number_format($vCons, 2, ',', ' ') : '-' }}
                        </td>
                        <td class="text-right {{ $vPerte > 0 ? 'font-bold' : 'qty-zero' }}">
                            {{ $vPerte > 0 ? number_format($vPerte, 2, ',', ' ') : '-' }}
                        </td>
                        <td class="text-right {{ $vRep > 0 ? 'font-bold' : 'qty-zero' }}">
                            {{ $vRep > 0 ? number_format($vRep, 2, ',', ' ') : '-' }}
                        </td>

                        <td class="text-right {{ $vEntree > 0 ? 'font-bold' : 'qty-zero' }}" style="background-color: #f0fdf4;">
                            {{ $vEntree > 0 ? '+'.number_format($vEntree, 2, ',', ' ') : '-' }}
                        </td>
                        <td class="text-right {{ $vSortie > 0 ? 'font-bold' : 'qty-zero' }}" style="background-color: #fef2f2;">
                            {{ $vSortie > 0 ? '-'.number_format($vSortie, 2, ',', ' ') : '-' }}
                        </td>
                        
                        <td class="text-right font-bold">
                            {{ number_format($mov->stock, 2, ',', ' ') }}
                        </td>

                        <td class="text-center" style="font-size: 7px;">
                            {{ $mov->user->first_name ?? 'N/A' }}
                        </td>
                    </tr>
                @endforeach

                <tr class="total-row">
                    <td colspan="2" class="text-right">TOTAL PÉRIODE :</td>
                    <td class="text-right">{{ number_format($tAchat, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($tConsigne, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($tPerte, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($tRepreuve, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($tEntree, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($tSortie, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($lastStock, 2, ',', ' ') }}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    @endif

    <div class="footer">
        Ikarootech ERP - {{ now()->format('d/m/Y H:i') }} - Page <span class="page-number"></span>
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