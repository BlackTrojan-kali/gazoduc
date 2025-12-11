{{--
    Nom du fichier: resources/views/pdf/general_roadbills.blade.php
    Description: Cette vue génère le PDF pour tous les bordereaux de route, sans filtre par article.
--}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bordereaux de Route Généraux</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 10px; }
        h1 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; }
        h2 { text-align: center; color: #555; margin-bottom: 10px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .date-range { text-align: center; margin-bottom: 20px; font-style: italic; color: #666; }
        .total-section { margin-top: 20px; text-align: right; font-weight: bold; }
    </style>
</head>
<body>

    <h1>Rapport des Bordereaux de Route</h1>
    @if($startDate || $endDate)
        <div class="date-range">
            Période du {{ $startDate ? date('d/m/Y', strtotime($startDate)) : 'début' }} au {{ $endDate ? date('d/m/Y', strtotime($endDate)) : 'aujourd\'hui' }}
        </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>N° Bordereau</th>
                <th>Véhicule</th>
                <th>Chauffeur</th>
                <th>Départ</th>
                <th>Arrivée</th>
                <th>Date Départ</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($roadbills as $roadbill)
                <tr>
                    <td>{{ $roadbill->id }}</td>
                    <td>{{ $roadbill->vehicle->licence_plate ?? 'N/A' }}</td>
                    <td>{{ $roadbill->chauffeur->name ?? 'N/A' }}</td>
                    <td>{{ $roadbill->departure->name ?? 'N/A' }}</td>
                    <td>{{ $roadbill->arrival->name ?? 'N/A' }}</td>
                    <td>{{ date('d/m/Y H:i', strtotime($roadbill->departure_date)) }}</td>
                    <td>{{ $roadbill->status }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>
