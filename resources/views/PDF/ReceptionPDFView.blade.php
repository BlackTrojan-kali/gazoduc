<!DOCTYPE html>
<html>
<head>
    <title>Historique des Réceptions</title>
    <meta charset="utf-8">
    <style>
        /* Styles généraux du corps */
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            margin: 20px;
            color: #333;
        }

        /* En-tête du document */
        .header {
            text-align: right;
            font-size: 8px;
            margin-bottom: 10px;
        }

        /* Titre principal */
        h1 {
            text-align: center;
            color: #1a202c;
            margin-bottom: 20px;
            font-size: 18px;
        }

        /* Informations de filtrage */
        .filters-info {
            margin-bottom: 15px;
            font-size: 9px;
            background-color: #f9f9f9;
            border: 1px solid #eee;
            padding: 8px;
            border-radius: 5px;
        }
        .filters-info p {
            margin: 2px 0;
        }

        /* Styles du tableau */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
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
            color: #555;
            font-size: 9px;
        }
        td {
            font-size: 8px;
        }

        /* Style pour les lignes impaires pour une meilleure lisibilité */
        tr:nth-child(even) {
            background-color: #fdfdfd;
        }

        /* Style pour les lignes supprimées */
        tr.deleted-row {
            background-color: #f8d7da; /* Couleur rouge clair pour indiquer la suppression */
            color: #721c24; /* Couleur de texte plus foncée */
        }
        tr.deleted-row td {
            text-decoration: line-through; /* Barrer le texte */
        }

        /* Pied de page (si vous en ajoutez un) */
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 8px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="header">
        Date de génération: {{ now()->format('d/m/Y H:i:s') }}
    </div>

    <h1>Historique des Réceptions</h1>

    <div class="filters-info">
        <p><strong>Période :</strong> {{ $start_date ?? 'Début' }} au {{ $end_date ?? 'Fin' }}</p>
        <p><strong>Agence :</strong> {{ $selectedAgency ? $selectedAgency->name : 'Toutes les agences' }}</p>
        <p><strong>Rapport :</strong> Historique complet des réceptions @if($isWithDeleted) (incluant les suppressions) @endif</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Citerne Mobile</th>
                <th>Article</th>
                <th>Qté Reçue (L)</th>
                <th>Agence Destination</th>
                <th>Enregistré par</th>
                <th>Origine</th>
                <th>Statut</th>
                <th>Créé le</th>
            </tr>
        </thead>
        <tbody>
            @forelse($receptions as $reception)
            <tr @if($reception->trashed()) class="deleted-row" @endif>
                <td>{{ $reception->id }}</td>
                <td>{{ $reception->citerne->name ?? 'N/A' }}</td>
                <td>{{ $reception->article->name ?? 'N/A' }}</td>
                <td>{{ number_format($reception->received_quantity, 2, ',', ' ') }}</td>
                <td>{{ $reception->agency->name ?? 'N/A' }}</td>
                <td>{{ $reception->user ? $reception->user->first_name . ' ' . $reception->user->last_name : 'N/A' }}</td>
                <td>{{ $reception->origin ?? 'N/A' }}</td>
                <td>
                    @if($reception->trashed())
                        Supprimée
                    @else
                        Active
                    @endif
                </td>
                <td>{{ $reception->created_at->format('d/m/Y H:i') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px;">Aucune réception trouvée pour les critères sélectionnés, monsieur.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Page 1 de 1 - Historique des Réceptions Généré par votre application.
    </div>
</body>
</html>
