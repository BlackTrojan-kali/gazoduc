<!DOCTYPE html>
<html>
<head>
    <title>Rapport d'Historique des Mouvements</title>
    <meta charset="utf-8">
    <style>
        /* Styles généraux du corps du document */
        body {
            font-family: 'DejaVu Sans', sans-serif;
            /* Réduit la taille de police globale */
            font-size: 9px; /* Réduit à 9px */
            margin: 15px; /* Réduit les marges globales */
            color: #333;
            line-height: 1.3; /* Légèrement plus serré */
        }

        /* En-tête du rapport */
        .header {
            text-align: center;
            margin-bottom: 20px; /* Moins d'espace */
            border-bottom: 2px solid #1a237e;
            padding-bottom: 8px; /* Moins de padding */
        }
        .header h1 {
            font-size: 22px; /* Réduit la taille du titre */
            color: #1a237e;
            margin: 0 0 4px 0;
            font-weight: bold;
        }
        .header p {
            font-size: 10px; /* Réduit la taille du paragraphe */
            color: #555;
            margin: 0;
        }

        /* Tableau des mouvements */
        .movements-table {
            width: 100%; /* S'assure que le tableau prend toute la largeur */
            table-layout: fixed; /* Très important : permet aux colonnes de respecter les largeurs fixées */
            border-collapse: collapse;
            margin-bottom: 25px; /* Moins d'espace */
        }
        .movements-table th,
        .movements-table td {
            border: 1px solid #e0e0e0;
            /* Réduit les paddings des cellules pour gagner de l'espace */
            padding: 6px 8px; /* Réduit à 6px vertical, 8px horizontal */
            text-align: left;
            vertical-align: top;
            word-wrap: break-word; /* Permet aux mots longs de se casser pour éviter le débordement */
        }
        .movements-table th {
            background-color: #3f51b5;
            color: #ffffff;
            font-weight: bold;
            font-size: 9px; /* Taille de police pour les en-têtes */
            text-transform: uppercase;
            letter-spacing: 0.3px; /* Espacement réduit */
        }
        .movements-table tbody tr:nth-child(even) {
            background-color: #f5f5f5;
        }
        .movements-table td {
            font-size: 8px; /* Taille de police pour les données des cellules */
        }

        /* Largeurs spécifiques pour les colonnes pour mieux contrôler l'espace */
        .movements-table th:nth-child(1), .movements-table td:nth-child(1) { width: 12%; } /* Date */
        .movements-table th:nth-child(2), .movements-table td:nth-child(2) { width: 7%; }  /* Type */
        .movements-table th:nth-child(3), .movements-table td:nth-child(3) { width: 10%; } /* Qualification */
        .movements-table th:nth-child(4), .movements-table td:nth-child(4) { width: 7%; }  /* Quantité */
        .movements-table th:nth-child(5), .movements-table td:nth-child(5) { width: 12%; } /* Stock Actuel */
        .movements-table th:nth-child(6), .movements-table td:nth-child(6) { width: 15%; } /* Article */
        .movements-table th:nth-child(7), .movements-table td:nth-child(7) { width: 10%; } /* Agence */
        /* REMARQUE: La colonne "Service" a été retirée de l'en-tête, donc nous l'ignorons ici */
        .movements-table th:nth-child(8), .movements-table td:nth-child(8) { width: 10%; } /* Source */
        .movements-table th:nth-child(9), .movements-table td:nth-child(9) { width: 15%; } /* Description */
        .movements-table th:nth-child(10), .movements-table td:nth-child(10) { width: 12%; } /* Enregistré par */


        /* Styles pour la ligne de total */
        .total-row {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 10px; /* Taille de police pour le total */
            color: #1a237e;
        }
        .total-row td {
            border-top: 2px solid #3f51b5;
        }
        .total-row .total-label {
            text-align: right;
            padding-right: 10px; /* Moins de padding */
        }
        .total-row .total-quantity {
            text-align: left;
            font-weight: bold;
        }

        /* Message si aucun mouvement */
        .no-data {
            text-align: center;
            color: #888;
            font-size: 12px; /* Réduit la taille */
            padding: 15px; /* Réduit le padding */
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 5px;
            margin-top: 15px;
        }

        /* Pied de page */
        .footer {
            text-align: right;
            font-size: 7px; /* Réduit encore la taille */
            color: #777;
            margin-top: 30px; /* Moins d'espace */
            border-top: 1px solid #ccc;
            padding-top: 8px; /* Moins de padding */
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport d'Historique des Mouvements</h1>
        <p>Généré le {{ now()->format('d/m/Y à H:i:s') }}</p>
    </div>

    @if($movements->isEmpty())
        <div class="no-data">
            <p>Aucun mouvement trouvé pour les critères sélectionnés, monsieur. 😔</p>
        </div>
    @else
        <table class="movements-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Qualification</th>
                    <th>Qté</th> {{-- Raccourci pour 'Quantité' --}}
                    <th>Stock Actuel</th> {{-- Raccourci pour 'Stock Actuel de l'Article' --}}
                    <th>Article</th>
                    <th>Agence</th>
                    <th>Source</th>
                    <th>Description</th>
                    <th>Enregistré par</th>
                </tr>
            </thead>
            <tbody>
                @foreach($movements as $movement)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($movement->created_at)->format('d/m/Y H:i') }}</td>
                    <td>{{ ucfirst($movement->movement_type) }}</td>
                    <td>{{ ucfirst($movement->qualification) }}</td>
                    <td>{{ $movement->quantity }}</td>
                    <td>{{ $movement->stock ?? 'N/A' }}</td>
                    <td>{{ $movement->article->name ?? 'N/A' }}</td>
                    <td>{{ $movement->agency->name ?? 'N/A' }}</td>
                    <td>{{ $movement->source_location ?? 'N/A' }}</td>
                    <td>{{ $movement->description ?? 'Aucune' }}</td>
                    <td>{{ $movement->recordedByUser->name ?? 'N/A' }}</td>
                </tr>
                @endforeach
                {{-- Nouvelle ligne pour le total des quantités --}}
                <tr class="total-row">
                    <td colspan="3" class="total-label">Total quantités:</td> {{-- Fusionne 3 colonnes et raccourcit le libellé --}}
                    <td class="total-quantity">{{ $movements->sum('quantity') }}</td>
                    <td colspan="6"></td> {{-- Ajusté le colspan à 6 car il y a maintenant 10 colonnes au total (3+1+6=10) --}}
                </tr>
            </tbody>
        </table>
    @endif

    <div class="footer">
        Rapport généré par votre système de gestion de stock. &copy; {{ date('Y') }}
    </div>
</body>
</html>