<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Paiements de Carburant</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
    </style>
</head>
<body>
    <h2>Liste des paiements de carburant</h2>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Agence</th>
                <th>Client</th>
                <th>Banque</th>
                <th>Montant</th>
                <th>Type</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($payments as $p)
                <tr>
                    <td>{{ $p->id }}</td>
                    <td>{{ $p->agency->name ?? '' }}</td>
                    <td>{{ $p->client->name ?? '' }}</td>
                    <td>{{ $p->bank->name ?? '' }}</td>
                    <td>{{ number_format($p->amout, 2, ',', ' ') }} XAF</td>
                    <td>{{ $p->type }}</td>
                    <td>{{ $p->created_at->format('d/m/Y') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
