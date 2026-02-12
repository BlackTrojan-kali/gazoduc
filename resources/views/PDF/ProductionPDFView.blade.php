<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport de Production</title>
    <style>
        @page { margin: 100px 25px 60px 25px; } /* Marges : Haut Droite Bas Gauche */
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9px;
            color: #1a202c;
        }
        
        /* --- HEADER FIXE --- */
        header {
            position: fixed;
            top: -80px;
            left: 0px;
            right: 0px;
            height: 80px;
            border-bottom: 2px solid #3182ce;
            padding-bottom: 10px;
        }
        .company-info { float: right; text-align: right; font-size: 8px; color: #718096; }
        .title { text-align: center; position: absolute; width: 100%; top: 10px; }
        .title h1 { margin: 0; font-size: 18px; text-transform: uppercase; color: #2d3748; }
        .title p { margin: 2px 0 0; font-size: 10px; color: #718096; }

        /* --- FOOTER FIXE --- */
        footer {
            position: fixed; 
            bottom: -40px; 
            left: 0px; 
            right: 0px;
            height: 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            line-height: 25px;
            font-size: 8px;
            color: #a0aec0;
        }

        /* --- FILTRES --- */
        .filters {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f7fafc;
            border: 1px solid #edf2f7;
            border-radius: 4px;
        }
        .filter-item { display: inline-block; margin-right: 20px; font-size: 9px; }
        .filter-label { font-weight: bold; color: #4a5568; }

        /* --- TABLEAU --- */
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th {
            background-color: #ebf8ff;
            color: #2c5282;
            font-weight: bold;
            text-transform: uppercase;
            padding: 6px;
            border: 1px solid #cbd5e0;
            font-size: 8px;
            vertical-align: middle;
        }
        td {
            padding: 6px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        /* Zébrure */
        tr:nth-child(even) { background-color: #f8fafc; }
        
        /* Lignes supprimées */
        .deleted { 
            background-color: #fff5f5 !important; 
            color: #c53030; 
            text-decoration: line-through; 
        }
        
        /* Totaux */
        .total-row { background-color: #2d3748; color: white; font-weight: bold; }
        .total-row td { border: 1px solid #2d3748; }
        
        /* Alignements */
        .text-right { text-align: right; }
        .text-center { text-align: center; }
    </style>
</head>
<body>

    <header>
        {{-- Emplacement Logo (décommenter si besoin) --}}
        {{-- <img src="{{ public_path('images/logo.png') }}" style="max-height: 50px; float: left;"> --}}
        
        <div class="title">
            <h1>Historique de Production</h1>
            <p>Généré le {{ now()->format('d/m/Y à H:i') }}</p>
        </div>
        
        <div class="company-info">
            <strong>IKAROOTECH ERP</strong><br>
            Rapport Officiel<br>
        </div>
    </header>

    <footer>
        Document confidentiel généré automatiquement
    </footer>

    <div class="filters">
        {{-- CORRECTION ICI : On affiche directement les dates car elles sont déjà formatées en String par le contrôleur --}}
        <span class="filter-item">
            <span class="filter-label">Période :</span> 
            {{ $filters['start_date'] }} au {{ $filters['end_date'] }}
        </span>
        
        @if(!empty($filters['agency_id']))
            <span class="filter-item">
                <span class="filter-label">Agence :</span> 
                {{ \App\Models\Agency::find($filters['agency_id'])->name ?? 'N/A' }}
            </span>
        @endif
        
        @if(!empty($filters['article_id']))
            <span class="filter-item">
                <span class="filter-label">Article :</span> 
                {{ \App\Models\Article::find($filters['article_id'])->name ?? 'N/A' }}
            </span>
        @endif

        @if(!empty($filters['citerne_id']))
            <span class="filter-item">
                <span class="filter-label">Citerne :</span> 
                {{ \App\Models\Citerne::find($filters['citerne_id'])->name ?? 'N/A' }}
            </span>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th width="12%">Date</th>
                <th width="20%">Source (Vrac)</th>
                <th width="20%">Produit Fini</th>
                <th width="10%" class="text-center">Qté (U)</th>
                <th width="12%" class="text-right">Poids (Kg)</th>
                <th width="15%">Agence</th>
                <th width="11%">Opérateur</th>
            </tr>
        </thead>
        <tbody>
            @php 
                $totalQty = 0; 
                $totalWeight = 0; 
            @endphp

            @forelse($prodMoves as $move)
                @php
                    // 1. Détermination du nom de la source (Citerne ou Camion)
                    $sourceName = 'Source Inconnue';
                    if ($move->source_citerne_id && $move->citerne) {
                        $sourceName = '[Citerne] ' . $move->citerne->name;
                    } elseif ($move->vehicle_id && $move->vehicle) {
                        $sourceName = '[Camion] ' . $move->vehicle->licence_plate;
                    }

                    // 2. Calcul des totaux (On exclut les éléments supprimés du total)
                    if (!$move->deleted_at) {
                        $totalQty += $move->quantity_produced;
                        $totalWeight += $move->total_weight_produced;
                    }
                @endphp

                <tr class="{{ $move->deleted_at ? 'deleted' : '' }}">
                    <td>
                        {{-- Ici ->format() fonctionne car $move->created_at est un objet Carbon --}}
                        {{ $move->created_at->format('d/m/Y') }}<br>
                        <small style="color: #718096">{{ $move->created_at->format('H:i') }}</small>
                    </td>
                    <td>{{ $sourceName }}</td>
                    <td>{{ $move->article->name ?? 'N/A' }}</td>
                    <td class="text-center" style="font-weight: bold;">
                        {{ number_format($move->quantity_produced, 0, ',', ' ') }}
                    </td>
                    <td class="text-right">
                        {{ number_format($move->total_weight_produced, 2, ',', ' ') }}
                    </td>
                    <td>{{ $move->agency->name ?? 'N/A' }}</td>
                    <td>
                        @if($move->user)
                            {{ Str::limit($move->user->last_name, 10) }} {{ substr($move->user->first_name, 0, 1) }}.
                        @else
                            N/A
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 20px; color: #718096; font-style: italic;">
                        Aucune production trouvée pour les critères sélectionnés.
                    </td>
                </tr>
            @endforelse
        </tbody>
        
        {{-- Affichage du Total si des données existent --}}
        @if($prodMoves->count() > 0)
            <tfoot>
                <tr class="total-row">
                    <td colspan="3" class="text-right">TOTAUX PÉRIODE (Actifs) :</td>
                    <td class="text-center">{{ number_format($totalQty, 0, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($totalWeight, 2, ',', ' ') }} kg</td>
                    <td colspan="2"></td>
                </tr>
            </tfoot>
        @endif
    </table>

    <script type="text/php">
        if (isset($pdf)) {
            $text = "Page {PAGE_NUM} / {PAGE_COUNT}";
            $size = 8;
            $font = $fontMetrics->getFont("DejaVu Sans");
            $width = $fontMetrics->get_text_width($text, $font, $size) / 2;
            $x = ($pdf->get_width() - $width) / 2;
            $y = $pdf->get_height() - 25; // Position en bas
            $pdf->page_text($x, $y, $text, $font, $size, array(0.6, 0.6, 0.6));
        }
    </script>

</body>
</html>