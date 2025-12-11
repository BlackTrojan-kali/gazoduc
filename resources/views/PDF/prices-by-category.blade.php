<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des Prix par Catégorie</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #333;
            margin: 20px;
        }

        h1, h2, h3 {
            text-align: center;
            margin: 0;
            padding: 0;
        }

        .subtitle {
            margin-top: 5px;
            text-align: center;
            font-size: 12px;
            font-weight: bold;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        table th, table td {
            border: 1px solid #777;
            padding: 6px 8px;
            font-size: 11px;
        }

        table th {
            background: #f0f0f0;
            font-weight: bold;
            text-transform: uppercase;
        }

        .text-center {
            text-align: center;
        }

        .header-info {
            margin-top: 10px;
            font-size: 12px;
        }

        .header-info span {
            font-weight: bold;
        }

    </style>
</head>
<body>

<h1>IKAROOTECH ERP</h1>
<h2>Liste des prix par catégorie</h2>

<div class="subtitle">
    @if($agency)
        Agence : <strong>{{ $agency->name }}</strong>
    @else
        Agence : <strong>Toutes</strong>
    @endif
    |
    @if($category)
        Catégorie client : <strong>{{ $category->name }}</strong>
    @else
        Catégorie client : <strong>Toutes</strong>
    @endif
    |
    @if($article)
        Article : <strong>{{ $article->name }}</strong>
    @else
        Article : <strong>Tous</strong>
    @endif
</div>

<table>
    <thead>
        <tr>
            <th>#</th>
            <th>Article</th>
            <th>Catégorie Client</th>
            <th>Agence</th>
            <th>Prix</th>
            <th>Prix Consigne</th>
        </tr>
    </thead>

    <tbody>
        @forelse($prices as $index => $price)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $price->article?->name }}</td>
                <td>{{ $price->category?->name }}</td>
                <td>{{ $price->agency?->name }}</td>
                <td class="text-center">{{ number_format($price->price, 0, ',', ' ') }} Fcfa</td>
                <td class="text-center">
                    @if($price->consigne_price)
                        {{ number_format($price->consigne_price, 0, ',', ' ') }} Fcfa
                    @else
                        -
                    @endif
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="6" class="text-center">Aucun résultat trouvé</td>
            </tr>
        @endforelse
    </tbody>

</table>

</body>
</html>
