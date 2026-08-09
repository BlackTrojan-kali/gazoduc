<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des Articles</title>
    <style>
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h2 {
            margin: 0;
            color: #1a202c;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #718096;
            font-size: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #cbd5e0;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #edf2f7;
            font-weight: bold;
            color: #2d3748;
            text-transform: uppercase;
            font-size: 11px;
        }
        tr:nth-child(even) {
            background-color: #f7fafc;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>Catalogue des Articles</h2>
        <!-- On récupère dynamiquement le nom de l'entreprise via le premier article -->
        <p>
            Entreprise : {{ $articles->first() && $articles->first()->entreprise ? $articles->first()->entreprise->name : 'Non définie' }}
        </p>
        <p>Document généré le {{ date('d/m/Y à H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Type</th>
                <th>Poids (Péréquation)</th>
                <th>Unité</th>
            </tr>
        </thead>
        <tbody>
            @forelse($articles as $article)
                <tr>
                    <td>{{ $article->code }}</td>
                    <td>{{ $article->name }}</td>
                    <td>{{ ucfirst(str_replace('_', ' ', $article->type)) }}</td>
                    
                    <!-- Affichage propre du poids pour nos futurs calculs gaz -->
                    <td class="text-center">
                        @if($article->weight_per_unit)
                            {{ $article->weight_per_unit }} Kg
                        @else
                            -
                        @endif
                    </td>
                    
                    <td>{{ $article->unit }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center">Aucun article trouvé.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>