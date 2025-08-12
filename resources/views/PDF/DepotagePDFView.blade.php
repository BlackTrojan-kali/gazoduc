<!DOCTYPE html>
<html>
<head>
    <title>Historique des Dépotages</title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            margin: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #333;
            text-transform: uppercase;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            font-size: 12px;
            color: #666;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            font-size: 9px;
            color: #888;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .summary-box {
            background-color: #f9f9f9;
            border: 1px solid #eee;
            padding: 10px;
            margin-bottom: 20px;
            font-size: 11px;
            line-height: 1.6;
        }
        /* Styles pour les dépotages supprimés */
        .deleted-row {
            background-color: #ffeaea; /* Arrière-plan rouge clair pour indiquer la suppression */
            color: #8b0000; /* Texte rouge foncé */
            text-decoration: line-through; /* Ligne barrée sur le texte */
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Historique des Depotages</h1>
        <p>Genere le: {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
    </div>

    <div class="summary-box">
        <p>
            <strong>Periode:</strong> Du **{{ \Carbon\Carbon::parse($start_date)->format('d/m/Y') }}** au **{{ \Carbon\Carbon::parse($end_date)->format('d/m/Y') }}**
        </p>
        <p>
            <strong>Agence:</strong>
            @if($selectedAgency)
                {{ $selectedAgency->name }}
            @else
                Toutes les agences
            @endif
        </p>
        <p>
            <strong>Nombre total de depotages:</strong> {{ $depotages->count() }}
            @if($isWithDeleted)
                (dont {{ $depotages->whereNotNull('deleted_at')->count() }} supprimes)
            @endif
        </p>
        <p>
            <strong>Quantité totale depotee:</strong> {{ number_format($depotages->sum('quantity'), 2, ',', ' ') }} L
        </p>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center">ID</th>
                <th>Date Depotage</th>
                <th>Citerne Mobile</th>
                <th>Citerne Fixe</th>
                <th>Article</th>
                <th class="text-right">Quantite (L)</th>
                <th>Agence</th>
                <th>BL Numero</th>
                <th>Enregistre par</th>
                <th>Cree le</th>
                @if($isWithDeleted)
                    <th>Supprime le</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @forelse ($depotages as $depotage)
                <tr class="{{ $depotage->deleted_at ? 'deleted-row' : '' }}">
                    <td class="text-center">{{ $depotage->id }}</td>
                    <td>{{ \Carbon\Carbon::parse($depotage->depotage_date)->format('d/m/Y') }}</td>
                    <td>{{ $depotage->citerne_mobile->name ?? 'N/A' }}</td>
                    <td>{{ $depotage->citerne_fixe->name ?? 'N/A' }}</td>
                    <td>{{ $depotage->article->name ?? 'N/A' }}</td>
                    <td class="text-right">{{ number_format($depotage->quantity, 2, ',', ' ') }}</td>
                    <td>{{ $depotage->agency->name ?? 'N/A' }}</td>
                    <td>{{ $depotage->bl_number ?? '—' }}</td>
                    <td>{{ $depotage->user->first_name ?? 'N/A' }} {{ $depotage->user->last_name ?? '' }}</td>
                    <td>{{ $depotage->created_at->format('d/m/Y H:i') }}</td>
                    @if($isWithDeleted)
                        <td>{{ $depotage->deleted_at ? \Carbon\Carbon::parse($depotage->deleted_at)->format('d/m/Y H:i') : '—' }}</td>
                    @endif
                </tr>
            @empty
                <tr>
                    <td colspan="{{ $isWithDeleted ? '11' : '10' }}" class="text-center">Aucun depotage trouve pour les criteres specifies, monsieur.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Rapport genere par votre systeme de gestion. &copy; {{ date('Y') }}</p>
    </div>
</body>
</html>
