<!DOCTYPE html>
<html>
<head>
    <title>{{ $reportTitle }}</title>
    <style>
        /* Styles CSS pour le PDF */
        body { 
            font-family: sans-serif; 
            font-size: 11px; /* Augmenté de 9px à 11px */
            color: #333;
        }
        h1 { 
            font-size: 20px; /* Augmenté de 16px à 20px */
            text-align: center; 
            margin-bottom: 5px;
            color: #1f2937;
        }
        .header { 
            margin-bottom: 20px; 
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .header p {
            margin: 4px 0;
            font-size: 12px; /* Augmenté de 10px à 12px */
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
        }
        th, td { 
            border: 1px solid #d1d5db; 
            padding: 6px 5px; /* Légèrement plus de hauteur (padding) pour aérer */
            text-align: left; 
        }
        th { 
            background-color: #f3f4f6; 
            font-weight: bold;
            color: #374151;
            text-transform: uppercase;
            font-size: 10px; /* Augmenté de 8px à 10px */
        }
        td.number {
            text-align: right;
            font-family: 'Courier New', Courier, monospace; 
        }
        tfoot td {
            background-color: #e5e7eb;
            font-weight: bold;
            font-size: 12px; /* Augmenté de 10px à 12px */
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $reportTitle }}</h1>
        <p><strong>Période :</strong> {{ $period }}</p>
        <p><strong>Station / Agence :</strong> {{ $filters['agency_name'] }} | <strong>Produit :</strong> {{ $filters['article_name'] }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">ID</th>
                <th width="12%">Date & Heure</th>
                <th width="16%">Îlot & Pistolet</th>
                <th width="12%">Produit</th>
                <th width="9%">Idx Départ</th>
                <th width="9%">Idx Fin</th>
                <th width="7%">Test (L)</th>
                <th width="9%">Vendu (L)</th>
                <th width="8%">P.U</th>
                <th width="13%">Total (XAF/XOF)</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalQuantity = 0;
                $totalTotalPrice = 0;
                $totalTest = 0;
            @endphp
            @foreach ($sales as $sale)
            <tr>
                <td>{{ $sale->id }}</td>
                {{-- Utilisation de date_saisie si disponible, sinon fallback sur created_at --}}
                <td>{{ $sale->date_saisie ? \Carbon\Carbon::parse($sale->date_saisie)->format('d/m/Y H:i') : $sale->created_at->format('d/m/Y H:i') }}</td>
                
                <td>
                    <strong>{{ $sale->pistolet->pompe->name ?? 'N/A' }}</strong><br>
                    {{-- Police augmentée de 8px à 10px --}}
                    <span style="color: #6b7280; font-size: 10px;">{{ $sale->pistolet->name ?? 'N/A' }}</span>
                </td>
                
                {{-- L'article est récupéré via la chaîne pistolet -> citerne -> article --}}
                <td>{{ $sale->pistolet->citerne->article->name ?? 'N/A' }}</td>
                
                <td class="number">{{ number_format($sale->index_ouverture, 2, ',', ' ') }}</td>
                <td class="number">{{ number_format($sale->index_fermeture, 2, ',', ' ') }}</td>
                <td class="number" style="color: #ef4444;">{{ $sale->volume_test > 0 ? number_format($sale->volume_test, 2, ',', ' ') : '-' }}</td>
                
                <td class="number" style="font-weight: bold;">{{ number_format($sale->volume_vendu, 2, ',', ' ') }}</td>
                <td class="number">{{ number_format($sale->prix_unitaire, 0, ',', ' ') }}</td>
                <td class="number" style="font-weight: bold;">{{ number_format($sale->montant_total, 0, ',', ' ') }}</td>
            </tr>
            @php
                // Accumulation des totaux
                $totalQuantity += $sale->volume_vendu;
                $totalTotalPrice += $sale->montant_total;
                $totalTest += $sale->volume_test;
            @endphp
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="6" style="text-align: right; text-transform: uppercase;">Total de la période :</td>
                <td class="number" style="color: #ef4444;">{{ $totalTest > 0 ? number_format($totalTest, 2, ',', ' ') : '-' }}</td>
                <td class="number">{{ number_format($totalQuantity, 2, ',', ' ') }}</td>
                <td class="number"></td> {{-- Colonne Prix Unitaire laissée vide --}}
                <td class="number">{{ number_format($totalTotalPrice, 0, ',', ' ') }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>