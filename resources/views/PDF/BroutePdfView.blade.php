<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bordereau de Route #{{ $roadbill->id }}</title>
    <style>
        body { font-family: 'Arial', sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .details { margin-bottom: 20px; }
        .details table { width: 100%; border-collapse: collapse; }
        .details th, .details td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        .articles table { width: 100%; border-collapse: collapse; }
        .articles th, .articles td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        .articles th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Bordereau de Route #{{ $roadbill->id }}</h2>
        <p>Date de Départ: {{ \Carbon\Carbon::parse($roadbill->departure_date)->format('d/m/Y') }}</p>
    </div>

    <div class="details">
        <h3>Détails du Bordereau</h3>
        <table>
            <tr>
                <th>Véhicule</th>
                <td>{{ $roadbill->vehicule->licence_plate }}</td>
            </tr>
            <tr>
                <th>Chauffeur</th>
                <td>{{ $roadbill->chauffeur->name }}</td>
            </tr>
            @if($roadbill->co_chauffeur)
            <tr>
                <th>Co-Chauffeur</th>
                <td>{{ $roadbill->co_chauffeur->name }}</td>
            </tr>
            @endif
            <tr>
                <th>Agence de Départ</th>
                <td>{{ $roadbill->departure->name }}</td>
            </tr>
            <tr>
                <th>Agence d'Arrivée</th>
                <td>{{ $roadbill->arrival->name }}</td>
            </tr>
            <tr>
                <th>Type</th>
                <td>{{ $roadbill->types }}</td>
            </tr>
            <tr>
                <th>Statut</th>
                <td>{{ $roadbill->status }}</td>
            </tr>
            <tr>
                <th>Note</th>
                <td>{{ $roadbill->notes }}</td>
            </tr>
        </table>
    </div>

    <div class="articles">
        <h3>Articles Transférés</h3>
        <table>
            <thead>
                <tr>
                    <th>Article</th>
                    <th>Quantité</th>
                </tr>
            </thead>
            <tbody>
                @foreach($roadbill->articles as $article)
                <tr>
                    <td>{{ $article->name }}</td>
                    <td>{{ $article->pivot->qty }} </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>
