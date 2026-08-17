<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Rapport des Relevés de Stock</title>
    <style>
        /* Configuration de la police pour supporter les accents */
        body { 
            font-family: 'DejaVu Sans', sans-serif; 
            font-size: 11px; 
            color: #333;
        }

        /* En-tête */
        .header-container {
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 2px solid #444;
            padding-bottom: 10px;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
        }
        .report-title {
            font-size: 14px;
            color: #555;
            margin-top: 5px;
        }

        /* Section Informations (Filtres) */
        .info-box {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .info-row { margin-bottom: 5px; }
        .label { font-weight: bold; color: #555; }

        /* Graphique */
        .chart-container {
            text-align: center;
            margin-bottom: 30px;
            page-break-inside: avoid; /* Évite de couper le graph en deux pages */
        }
        .chart-img {
            max-width: 100%;
            height: auto;
            border: 1px solid #eee;
        }

        /* Tableau */
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
        }
        th { 
            background-color: #2c3e50; 
            color: #fff; 
            padding: 8px; 
            text-align: left; 
            font-size: 10px;
        }
        td { 
            border: 1px solid #ddd; 
            padding: 6px 8px; 
            font-size: 10px;
        }
        /* Zébrure du tableau */
        tr:nth-child(even) { background-color: #f2f2f2; }

        /* Classes utilitaires */
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-green { color: #27ae60; font-weight: bold; }
        .text-red { color: #c0392b; font-weight: bold; }
        
        /* Pied de page */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30px;
            text-align: center;
            font-size: 9px;
            color: #888;
            border-top: 1px solid #ddd;
            padding-top: 5px;
        }
    </style>
</head>
<body>

    <div class="header-container">
        <div class="company-name">IKAROOTECH / KOMBICAR</div>
        <div class="report-title">Rapport Historique des Relevés de Citerne</div>
    </div>

    <div class="info-box">
        <div class="info-row">
            <span class="label">Période :</span> 
            Du {{ \Carbon\Carbon::parse($start_date)->format('d/m/Y') }} 
            au {{ \Carbon\Carbon::parse($end_date)->format('d/m/Y') }}
        </div> 
        <div class="info-row">
            <span class="label">Agence concernée :</span> 
            {{ $selectedAgency ? $selectedAgency->name : 'Toutes les agences (Global)' }}
        </div>
        <div class="info-row">
            <span class="label">Date d'édition :</span> {{ now()->format('d/m/Y à H:i') }}
        </div>
    </div>

    @if(isset($chartUrl) && $chartUrl)
    <div class="chart-container">
        <img src="{{ $chartUrl }}" class="chart-img" />
        <p style="font-size: 9px; color: #666; font-style: italic;">
            Courbe d'évolution du niveau moyen journalier (Litres)
        </p>
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th width="12%">Date / Heure</th>
                <th width="15%">Agence</th>
                <th width="15%">Citerne</th>
                <th class="text-right" width="12%">Théorique (L)</th>
                <th class="text-right" width="12%">Mesurée (L)</th>
                <th class="text-right" width="12%">Différence</th>
                <th width="12%">Enregistré par</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($releves as $releve)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($releve->reading_date)->format('d/m/Y H:i') }}</td>
                    <td>{{ $releve->agency->name ?? '-' }}</td>
                    <td>
                        {{ $releve->citerne->name ?? '-' }} <br>
                        <small style="color:#666">{{ $releve->citerne->product_type ?? '' }}</small>
                    </td>
                    
                    <td class="text-right">
                        {{ number_format($releve->theorical_quantity, 2, ',', ' ') }}
                    </td>
                    
                    <td class="text-right" style="font-weight:bold;">
                        {{ number_format($releve->measured_quantity, 2, ',', ' ') }}
                    </td>

                    {{-- Gestion intelligente de la couleur de différence --}}
                    @php
                        $diff = $releve->difference;
                        $colorClass = $diff < 0 ? 'text-red' : ($diff > 0 ? 'text-green' : '');
                        $sign = $diff > 0 ? '+' : '';
                    @endphp
                    <td class="text-right {{ $colorClass }}">
                        {{ $sign }}{{ number_format($diff, 2, ',', ' ') }}
                    </td>

                    <td>
                        @if($releve->user)
                            {{ $releve->user->first_name }} {{ Str::limit($releve->user->last_name, 1, '.') }}
                        @else
                            <span style="color:#888; font-style:italic;">Système</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 20px;">
                        Aucune donnée disponible pour cette période.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Document généré automatiquement par l'ERP KOMBICAR - Page <span class="page-number"></span>
    </div>

    {{-- Script pour numéro de page (Compatible DomPDF 0.8+) --}}
    <script type="text/php">
        if (isset($pdf)) {
            $x = 520;
            $y = 820;
            $text = "Page {PAGE_NUM} / {PAGE_COUNT}";
            $font = null;
            $size = 9;
            $color = array(0.5, 0.5, 0.5);
            $word_space = 0.0;  //  default
            $char_space = 0.0;  //  default
            $angle = 0.0;   //  default
            $pdf->page_text($x, $y, $text, $font, $size, $color, $word_space, $char_space, $angle);
        }
    </script>
</body>
</html>