<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Historique des Productions - Rapport</title>
    <style>
        /* Styles CSS pour le PDF */
        body {
            font-family: 'DejaVu Sans', sans-serif; /* Utilisez 'DejaVu Sans' pour la compatibilité avec Dompdf et les caractères spéciaux */
            font-size: 10px;
            margin: 30px; /* Marges plus généreuses */
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #eee; /* Ligne de séparation */
            padding-bottom: 15px;
            position: relative; /* Pour positionner le logo */
        }
        .header h1 {
            font-size: 24px;
            color: #2c3e50; /* Couleur plus foncée */
            margin: 0;
            padding: 0;
            text-transform: uppercase;
        }
        .header p {
            font-size: 11px;
            color: #7f8c8d;
            margin-top: 8px;
        }
        .logo {
            position: absolute;
            top: 0;
            left: 0;
            max-height: 60px; /* Taille du logo */
            width: auto;
        }
        .filters {
            margin-bottom: 25px;
            border: 1px solid #e0e0e0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        .filters h2 {
            font-size: 14px;
            color: #34495e;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .filters ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex; /* Utilisation de flexbox pour les filtres */
            flex-wrap: wrap; /* Permet aux filtres de passer à la ligne */
            gap: 15px 30px; /* Espace entre les éléments */
        }
        .filters li {
            font-size: 11px;
            color: #555;
            flex: 1 1 calc(33% - 20px); /* 3 colonnes, ajusté pour le gap */
            min-width: 180px; /* Taille minimale pour éviter un chevauchement excessif */
        }
        .filters li strong {
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.05); /* Ombre légère pour le tableau */
        }
        th, td {
            border: 1px solid #e0e0e0; /* Bordure plus douce */
            padding: 10px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #eceff1; /* Couleur d'en-tête */
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            font-size: 10px;
        }
        tbody tr:nth-child(even) {
            background-color: #fcfcfc; /* Rayures pour la lisibilité */
        }
        tbody tr:hover {
            background-color: #f5f5f5; /* Effet hover léger */
        }
        .no-data {
            text-align: center;
            padding: 30px;
            color: #999;
            font-style: italic;
        }
        .table-footer {
            background-color: #e0e7ee; /* Couleur de fond pour le total */
            font-weight: bold;
            text-align: right;
            padding: 10px;
            border-top: 2px solid #ccc; /* Ligne plus épaisse au-dessus du total */
        }
        .table-footer td {
            border: none; /* Pas de bordure pour les cellules du pied de tableau */
            padding: 10px;
        }
        .total-label {
            text-align: right;
            padding-right: 10px; /* Espace avant le libellé total */
        }
        .total-value {
            text-align: left; /* Alignement de la valeur du total */
            white-space: nowrap; /* Empêche le retour à la ligne du total */
        }
        .footer {
            position: fixed; /* Fixe le pied de page */
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #777;
            border-top: 1px solid #eee; /* Ligne de séparation */
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        @if(file_exists(public_path('images/your-company-logo.png'))) {{-- Mettez votre vrai chemin de logo --}}
            <img src="{{ public_path('images/your-company-logo.png') }}" class="logo" alt="Logo Entreprise">
        @endif
        <h1>Rapport d'Historique des Productions</h1>
        <p>Généré le : {{ \Carbon\Carbon::now()->locale('fr')->isoFormat('dddd D MMMM YYYY [à] HH:mm') }}</p>
    </div>

    <div class="filters">
        <h2>Filtres Appliqués</h2>
        <ul>
            <li>
                <strong>Agence :</strong>
                {{ $filters['agency_id'] ? \App\Models\Agency::find($filters['agency_id'])->name : 'Toutes les agences' }}
            </li>
            <li>
                <strong>Article :</strong>
                {{ $filters['article_id'] ? \App\Models\Article::find($filters['article_id'])->name : 'Tous les articles' }}
            </li>
            <li>
                <strong>Citerne :</strong>
                {{ $filters['citerne_id'] ? \App\Models\Citerne::find($filters['citerne_id'])->name : 'Toutes les citernes' }}
            </li>
            <li>
                <strong>Date de début :</strong>
                {{ $filters['start_date'] ? \Carbon\Carbon::parse($filters['start_date'])->format('d/m/Y') : 'Non spécifiée' }}
            </li>
            <li>
                <strong>Date de fin :</strong>
                {{ $filters['end_date'] ? \Carbon\Carbon::parse($filters['end_date'])->format('d/m/Y') : 'Non spécifiée' }}
            </li>
        </ul>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Date Production</th>
                <th>Citerne Source</th>
                <th>Article Produit</th>
                <th>Quantité</th>
                <th>Agence</th>
                <th>Enregistré par</th>
            </tr>
        </thead>
        <tbody>
            @forelse($prodMoves as $move)
                <tr>
                    <td>{{ $move->id }}</td>
                    <td>{{ \Carbon\Carbon::parse($move->created_at)->format('d/m/Y H:i') }}</td>
                    <td>{{ $move->citerne->name ?? 'N/A' }}</td>
                    <td>{{ $move->article->name ?? 'N/A' }}</td>
                    <td>{{ $move->quantity_produced }}</td>
                    <td>{{ $move->agency->name ?? 'N/A' }}</td>
                    {{-- Assurez-vous que la relation est bien 'user' et non 'recorded_by_user' si le modèle est ProductionHistory --}}
                    <td>{{ $move->user->first_name ?? 'N/A' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="no-data">Aucune production trouvée pour les critères sélectionnés.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr>
                <td colspan="4" class="table-footer total-label">Total des quantités produites :</td>
                <td class="table-footer total-value">{{ $prodMoves->sum('quantity_produced') }}</td>
                <td colspan="2" class="table-footer"></td> {{-- Colonnes vides pour alignement --}}
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        Rapport généré par Votre Application. Page <span class="page-number"></span> sur <span class="total-pages"></span>
    </div>

    <script type="text/php">
        if (isset($pdf)) {
            $font = $fontMetrics->getFont("DejaVu Sans"); /* Utilisez la même police que le body */
            $size = 9;
            $pageText = "Page {PAGE_NUM} sur {PAGE_COUNT}";
            $y = $pdf->get_height() - 25;
            $x = $pdf->get_width() - 150; /* Position à droite */
            $pdf->page_text($x, $y, $pageText, $font, $size);
        }
    </script>
</body>
</html>