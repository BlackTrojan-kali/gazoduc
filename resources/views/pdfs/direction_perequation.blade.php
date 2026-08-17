<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport d'Estimation de Péréquation Transport CSPH</title>
    <style>
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: 11px;
            color: #1a202c;
            margin: 0;
            padding: 15px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2b6cb0;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #2b6cb0;
            text-transform: uppercase;
        }
        .header p {
            margin: 4px 0 0 0;
            color: #4a5568;
            font-size: 10px;
        }
        .summary-box {
            background-color: #ebf8ff;
            border: 1px solid #bee3f8;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
        }
        .summary-title {
            font-weight: bold;
            color: #2c5282;
            font-size: 12px;
            margin-bottom: 6px;
        }
        .agency-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .agency-header {
            background-color: #2d3748;
            color: #ffffff;
            padding: 6px 10px;
            font-weight: bold;
            font-size: 12px;
            border-radius: 4px 4px 0 0;
        }
        .agency-sub-info {
            background-color: #edf2f7;
            padding: 6px 10px;
            font-size: 10px;
            color: #4a5568;
            border-left: 1px solid #cbd5e0;
            border-right: 1px solid #cbd5e0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #cbd5e0;
            padding: 6px 8px;
            text-align: left;
        }
        th {
            background-color: #f7fafc;
            font-size: 10px;
            text-transform: uppercase;
            color: #4a5568;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .total-row {
            background-color: #e2e8f0;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9px;
            color: #a0aec0;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>État Récapitulatif de Péréquation Transport (CSPH)</h1>
        <p>Estimation du remboursement basé sur l'Arrêté N°0187 / MINCOMMERCE / CSPH</p>
        <p>Généré le : {{ $generatedAt }}</p>
    </div>

    <!-- Encadré Synthèse -->
    <div class="summary-box">
        <div class="summary-title">Synthèse Globale pour la Direction</div>
        <table>
            <tr>
                <td><strong>Volume Total de Gaz Référencé :</strong> {{ number_format($totalPoids, 3, ',', ' ') }} Tonnes</td>
                <td class="text-right"><strong>Subvention Totale Estimée :</strong> <span style="font-size: 13px; color: #2b6cb0;">{{ number_format($totalSubvention, 0, ',', ' ') }} FCFA</span></td>
            </tr>
        </table>
    </div>

    <!-- Liste détaillée par agence -->
    @foreach($groupedData as $agencyName => $agencyData)
        <div class="agency-section">
            <div class="agency-header">
                AGENCE : {{ strtoupper($agencyName) }}
            </div>
            <div class="agency-sub-info">
                Localité : <strong>{{ $agencyData['city'] }}</strong> | Tarif officiel homologué : 
                <strong>{{ number_format($agencyData['cost_per_tonne'], 2, ',', ' ') }} FCFA / Tonne</strong>[cite: 1]
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Article</th>
                        <th>Emplacement</th>
                        <th class="text-center">Quantité</th>
                        <th class="text-center">Poids Unitaire</th>
                        <th class="text-center">Poids Total</th>
                        <th class="text-right">Remboursement Estimé</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($agencyData['items'] as $item)
                        <tr>
                            <td>{{ $item['code'] }}</td>
                            <td>{{ $item['article'] }}</td>
                            <td>{{ $item['storage_type'] }}</td>
                            <td class="text-center">{{ number_format($item['quantity'], 0, ',', ' ') }}</td>
                            <td class="text-center">{{ $item['weight_unit'] > 0 ? $item['weight_unit'] . ' Kg' : '-' }}</td>
                            <td class="text-center">{{ number_format($item['total_weight_tonnes'], 3, ',', ' ') }} T</td>
                            <td class="text-right font-bold">
                                {{ $item['subvention'] > 0 ? number_format($item['subvention'], 0, ',', ' ') . ' FCFA' : '0 FCFA' }}
                            </td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="6" class="text-right">Sous-Total Agence {{ $agencyName }} :</td>
                        <td class="text-right" style="color: #2b6cb0;">
                            {{ number_format($agencyData['total_agency_subvention'], 0, ',', ' ') }} FCFA
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endforeach

    <div class="footer">
        Document officiel généré par l'ERP Ikarootech - Ce rapport est une estimation calculée sur la base des stocks enregistrés et des tarifs de transport par localité[cite: 1].
    </div>

</body>
</html>