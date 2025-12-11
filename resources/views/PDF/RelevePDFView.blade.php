<!DOCTYPE html>
<html>
<head>
    <title>Historique des Relevés de Citerne</title>
    <meta charset="utf-8"> {{-- Très important pour les caractères spéciaux --}}
    <style>
        /* Utilisez 'DejaVu Sans' pour la compatibilité avec les caractères spéciaux (accents, € etc.) */
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { text-align: center; margin-top: 30px; font-size: 8px; color: #555; }
        .text-right { text-align: right; } /* Pour aligner les nombres à droite */
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Historique des Releves de Citerne</h1>
        <p>
            Periode : Du **{{ \Carbon\Carbon::parse(request('start_date'))->format('d/m/Y') }}** au **{{ \Carbon\Carbon::parse(request('end_date'))->format('d/m/Y') }}**
            @if(request('agency_id'))
                <br>Agence : **{{ optional($releves->first())->agency->name ?? 'N/A' }}**
            @else
                <br>Agence : **Toutes les agences**
            @endif
        </p>
        <p>Genere le: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Citerne</th>
                <th>Agence</th>
                <th class="text-right">Qte Theorique </th>
                <th class="text-right">Qte Mesuree </th>
                <th class="text-right">Difference </th>
                <th>Date Lecture</th>
                <th>Enregistre par</th>
                <th>Cree le</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($releves as $releve)
                <tr>
                    <td>{{ $releve->id }}</td>
                    <td>{{ $releve->citerne->name ?? 'N/A' }}</td>
                    <td>{{ $releve->agency->name ?? 'N/A' }}</td>
                    <td class="text-right">{{ number_format($releve->theorical_quantity, 0, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($releve->measured_quantity, 0, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($releve->difference, 0, ',', ' ') }}</td>
                    <td>{{ \Carbon\Carbon::parse($releve->reading_date)->format('d/m/Y') }}</td>
                    <td>{{ $releve->user->first_name ?? 'N/A' }} {{ $releve->user->last_name ?? '' }}</td>
                    <td>{{ $releve->created_at->format('d/m/Y H:i') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center">Aucun releve trouve pour les criteres specifies.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Rapport genere par votre systeme de gestion de stocks. &copy; {{ date('Y') }}</p>
    </div>
</body>
</html>