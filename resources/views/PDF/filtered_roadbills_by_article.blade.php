
{{--
    Nom du fichier: resources/views/pdf/filtered_roadbills_by_article.blade.php
    Description: Cette vue génère le PDF pour les bordereaux de route d'un article spécifique.
--}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bordereaux de Route par Article</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 10px; }
        h1 { text-align: center; color: #333; margin-bottom: 10px; font-size: 16px; }
        h2 { text-align: center; color: #555; margin-bottom: 5px; font-size: 14px; }
        p { text-align: center; margin-bottom: 20px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .date-range { text-align: center; margin-bottom: 20px; font-style: italic; color: #666; }
        .total-section { margin-top: 20px; text-align: right; font-weight: bold; }
    </style>
</head>
<body>

    <h1>Rapport des Bordereaux de Route</h1>
    <h2>Article: {{ $article->name ?? 'N/A' }}</h2>
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
                <th>Quantité</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($filteredRoadbills as $item)
                <tr>
                    <td>{{ $item['roadbill']->id }}</td>
                    <td>{{ $item['roadbill']->vehicle->licence_plate ?? 'N/A' }}</td>
                    <td>{{ $item['roadbill']->chauffeur->name ?? 'N/A' }}</td>
                    <td>{{ $item['roadbill']->departure->name ?? 'N/A' }}</td>
                    <td>{{ $item['roadbill']->arrival->name ?? 'N/A' }}</td>
                    <td>{{ $item['article']->pivot->qty }}</td>
                    
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        Quantité totale pour l'article {{ $article->name ?? 'N/A' }}: {{ $totalQuantity }}
    </div>

</body>
</html>
