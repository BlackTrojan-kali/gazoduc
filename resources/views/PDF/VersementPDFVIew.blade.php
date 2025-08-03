<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport des versements</title>
    <style>
        body { font-family: sans-serif; margin: 20px; font-size: 10px; }
        h1, h2, h3 { text-align: center; color: #333; }
        .filters-summary { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        .filters-summary p { margin: 0; }
        .table-container { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; }
        .page-break { page-break-after: always; }
        .red-text { color: red; }
        .blue-text { color: blue; }
        .invoice-list {
            padding: 0;
            margin: 0;
            list-style-type: none;
        }
        .invoice-list-item {
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <h1>Rapport des versements</h1>
    <p style="text-align: center;">Généré le: {{ now()->format('d/m/Y') }}</p>

    <div class="filters-summary">
        <h2>Filtres appliqués</h2>
        <p><strong>Client:</strong> {{ $filters['client_id'] ?? 'Tous' }}</p>
        <p><strong>Agence:</strong> {{ $filters['agency_id'] ?? 'Toutes' }}</p>
        <p><strong>Type de facture:</strong> {{ $filters['invoice_type'] ?? 'Tous' }}</p>
        <p><strong>Banque:</strong> {{ $filters['bank_id'] ?? 'Toutes' }}</p>
        <p><strong>Période:</strong> Du {{ $filters['start_date'] ?? 'début' }} au {{ $filters['end_date'] ?? 'aujourd\'hui' }}</p>
    </div>

    @foreach($versements as $versement)
        @php
            // Calculer le total des montants des factures associées
            $totalFactures = $versement->factures->sum('total_amount');
            
            // Assumer que la note est une relation ou un champ, sinon mettre 0
            $montantNote = $versement->amout_notes ?? 0;
            
            // Calculer l'écart
            $ecart = ($versement->amout + $montantNote) - $totalFactures;
            $ecartClass = $ecart >= 0 ? 'blue-text' : 'red-text';
            $facturesCount = $versement->factures->count();
            $rowspanValue = $facturesCount > 0 ? $facturesCount : 1;
        @endphp
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th colspan="8">Détails du Versement #{{ $versement->id }}</th>
                    </tr>
                    <tr>
                        <th>Client</th>
                        <th>Banque</th>
                        <th>Montant du versement</th>
                        <th>Montant de la note</th>
                        <th>Date</th>
                        <th>Liste des factures associées</th>
                        <th>Total des factures</th>
                        <th>Écart</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {{-- Utilisation de rowspan pour lier les informations du versement à la liste des factures --}}
                        <td rowspan="{{ $rowspanValue }}">{{ $versement->client->name ?? 'N/A' }}</td>
                        <td rowspan="{{ $rowspanValue }}">{{ $versement->bank->name ?? 'N/A' }}</td>
                        <td rowspan="{{ $rowspanValue }}">{{ number_format($versement->amout, 2, ',', ' ') }} F</td>
                        <td rowspan="{{ $rowspanValue }}">{{ number_format($versement->amout_notes, 2, ',', ' ') }} F</td>
                        <td rowspan="{{ $rowspanValue }}">{{ $versement->created_at->format('d/m/Y') }}</td>
                        
                        {{-- Première ligne de la liste des factures --}}
                        @if($facturesCount > 0)
                            <td>
                                <ul class="invoice-list">
                                @foreach($versement->factures as $facture)
                                    <li class="invoice-list-item">N° {{ $facture->id }} ({{ number_format($facture->total_amount, 2, ',', ' ') }} F)</li>
                                @endforeach
                                </ul>
                            </td>
                        @else
                            <td>Aucune facture associée</td>
                        @endif
                        
                        {{-- Montant total et écart --}}
                        <td rowspan="{{ $rowspanValue }}">{{ number_format($totalFactures, 2, ',', ' ') }} F</td>
                        <td rowspan="{{ $rowspanValue }}" class="{{ $ecartClass }}">{{ number_format($ecart, 2, ',', ' ') }} F</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="page-break"></div>
    @endforeach
</body>
</html>
