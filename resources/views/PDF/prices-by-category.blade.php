<!DOCTYPE html>
<html lang="fr">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Grille Tarifaire - IKAROOTECH ERP</title>

    <style>
        /* --- CONFIGURATION GLOBALE --- */
        body {
            font-family: 'DejaVu Sans', sans-serif; /* Indispensable pour les accents et symboles */
            font-size: 11px;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }

        /* --- EN-TÊTE & TITRES --- */
        .header {
            width: 100%;
            border-bottom: 2px solid #3b82f6; /* Bleu brand */
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #111827;
            text-transform: uppercase;
        }

        .document-title {
            font-size: 16px;
            color: #4b5563;
            margin-top: 5px;
        }

        .meta-info {
            text-align: right;
            font-size: 10px;
            color: #6b7280;
        }

        /* --- BLOC RÉCAPITULATIF DES FILTRES --- */
        .summary-box {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 20px;
        }

        .summary-item {
            display: inline-block;
            margin-right: 20px;
            font-size: 11px;
        }

        .summary-label {
            font-weight: bold;
            color: #4b5563;
        }

        /* --- TABLEAU DE DONNÉES --- */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        /* Répéter l'entête sur chaque page lors de l'impression */
        thead {
            display: table-header-group;
        }
        
        tr {
            page-break-inside: avoid;
        }

        th {
            background-color: #3b82f6;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
        }

        td {
            border-bottom: 1px solid #e5e7eb;
            padding: 6px 8px;
            vertical-align: middle;
        }

        /* Zebra Striping (Lignes alternées) */
        tr:nth-child(even) {
            background-color: #f9fafb;
        }

        /* Alignements spécifiques */
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-mono { font-family: 'Courier New', monospace; }
        .font-bold { font-weight: bold; }

        /* --- PIED DE PAGE --- */
        .footer {
            position: fixed;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
            padding-top: 10px;
        }

        .page-number:after {
            content: counter(page);
        }
    </style>
</head>
<body>

    <div class="footer">
        Document généré par IKAROOTECH ERP le {{ date('d/m/Y à H:i') }} - Page <span class="page-number"></span>
    </div>

    <table class="header">
        <tr>
            <td style="border:none;">
                <div class="company-name">IKAROOTECH ERP</div>
                <div class="document-title">Grille Tarifaire Officielle</div>
            </td>
            <td style="border:none;" class="meta-info">
                <div>Date : {{ date('d/m/Y') }}</div>
                <div>Réf : EXP-{{ date('ymdHi') }}</div>
            </td>
        </tr>
    </table>

    <div class="summary-box">
        <div class="summary-item">
            <span class="summary-label">Agence :</span> 
            {{ $agency ? $agency->name : 'Toutes les agences' }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Catégorie Client :</span> 
            {{ $category ? $category->name : 'Toutes les catégories' }}
        </div>
        @if($article)
        <div class="summary-item">
            <span class="summary-label">Article :</span> 
            {{ $article->name }}
        </div>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 30%;">Article</th>
                <th style="width: 20%;">Catégorie Client</th>
                <th style="width: 15%;">Agence</th>
                <th style="width: 15%;" class="text-right">Prix Vente</th>
                <th style="width: 15%;" class="text-right">Consigne</th>
            </tr>
        </thead>
        <tbody>
            @forelse($prices as $index => $price)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    
                    <td>
                        <div class="font-bold">{{ $price->article->name ?? 'Article inconnu' }}</div>
                        </td>
                    
                    <td>{{ $price->category->name ?? 'Standard' }}</td>
                    
                    <td>{{ $price->agency->name ?? 'N/A' }}</td>
                    
                    <td class="text-right font-bold">
                        {{ number_format($price->price, 0, ',', ' ') }} <span style="font-size:9px;">FCFA</span>
                    </td>
                    
                    <td class="text-right">
                        @if($price->consigne_price > 0)
                            {{ number_format($price->consigne_price, 0, ',', ' ') }} <span style="font-size:9px;">FCFA</span>
                        @else
                            <span style="color:#ccc;">-</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="padding: 30px; color: #6b7280;">
                        Aucun tarif trouvé pour les critères sélectionnés.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>