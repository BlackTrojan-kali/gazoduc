<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Rapport d'Historique des Mouvements</title>
    <style>
        /* Styles généraux du corps du document */
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 8.5px; /* Taille de police globale ajustée */
            margin: 10px; /* Marges réduites */
            color: #333;
            line-height: 1.2; /* Espacement plus serré */
        }

        /* En-tête du rapport */
        .header {
            text-align: center;
            margin-bottom: 15px; /* Moins d'espace */
            border-bottom: 2px solid #1a237e;
            padding-bottom: 6px; /* Moins de padding */
        }
        .header h1 {
            font-size: 20px; /* Réduit la taille du titre */
            color: #1a237e;
            margin: 0 0 3px 0;
            font-weight: bold;
        }
        .header p {
            font-size: 9px; /* Réduit la taille du paragraphe */
            color: #555;
            margin: 0;
        }

        /* Tableau des mouvements */
        .movements-table {
            width: 100%;
            table-layout: fixed; /* Essentiel pour les largeurs fixes */
            border-collapse: collapse;
            margin-bottom: 20px; /* Moins d'espace */
        }
        .movements-table th,
        .movements-table td {
            border: 1px solid #e0e0e0;
            padding: 4px 6px; /* Paddings très réduits */
            text-align: left;
            vertical-align: top;
            word-wrap: break-word; /* Permet aux mots longs de se casser */
        }
        .movements-table th {
            background-color: #3f51b5; /* Couleur des en-têtes */
            color: #ffffff;
            font-weight: bold;
            font-size: 8px; /* Taille de police pour les en-têtes */
            text-transform: uppercase;
            letter-spacing: 0.2px;
            text-align: center; /* Centrer les textes d'en-tête */
        }
        .movements-table tbody tr:nth-child(even) {
            background-color: #f5f5f5;
        }
        .movements-table td {
            font-size: 7.5px; /* Taille de police pour les données des cellules */
        }
        .movements-table td.qty-cell {
            text-align: right; /* Aligne les quantités à droite */
        }

        /* Largeurs spécifiques pour les colonnes (ajustées à la nouvelle structure) */
        /* Total de 100% */
        .movements-table th:nth-child(1), .movements-table td:nth-child(1) { width: 12%; } /* Date */
        .movements-table th:nth-child(2), .movements-table td:nth-child(2) { width: 18%; } /* Description */
        /* MVT du Stock Total (4 sous-colonnes) */
        .movements-table th:nth-child(3), .movements-table td:nth-child(3) { width: 7%; }  /* Achat */
        .movements-table th:nth-child(4), .movements-table td:nth-child(4) { width: 7%; }  /* Consigne */
        .movements-table th:nth-child(5), .movements-table td:nth-child(5) { width: 7%; }  /* Perte */
        .movements-table th:nth-child(6), .movements-table td:nth-child(6) { width: 7%; }  /* Repreuve */
        /* MVT de l'Article (3 sous-colonnes) */
        .movements-table th:nth-child(7), .movements-table td:nth-child(7) { width: 8%; }  /* Entrée */
        .movements-table th:nth-child(8), .movements-table td:nth-child(8) { width: 8%; }  /* Sortie */
        .movements-table th:nth-child(9), .movements-table td:nth-child(9) { width: 8%; }  /* Stock */
        .movements-table th:nth-child(10), .movements-table td:nth-child(10) { width: 18%; } /* Enregistré par */
        /* Total: 12+18+7+7+7+7+8+8+8+18 = 100% */


        /* Styles pour la ligne de total */
        .total-row {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 8.5px; /* Taille de police pour le total */
            color: #1a237e;
        }
        .total-row td {
            border-top: 2px solid #3f51b5;
        }
        .total-row .total-label {
            text-align: right;
            padding-right: 8px; /* Moins de padding */
        }
        .total-row .total-qty-cell {
            text-align: right; /* Aligne les totaux de quantité à droite */
            font-weight: bold;
        }

        /* Message si aucun mouvement */
        .no-data {
            text-align: center;
            color: #888;
            font-size: 11px;
            padding: 12px;
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 5px;
            margin-top: 15px;
        }

        /* Pied de page */
        .footer {
            text-align: right;
            font-size: 6px;
            color: #777;
            margin-top: 20px;
            border-top: 1px solid #ccc;
            padding-top: 6px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport d'Historique des Mouvements</h1>
        {{-- Les variables $startDate et $endDate sont attendues ici pour le rapport simple --}}
        <p>
            @if(isset($role) && $role->name)
                Service: {{ $role->name }} |
            @endif
            Période: du {{ $startDate->format('d/m/Y') }} au {{ $endDate->format('d/m/Y') }}
        </p>
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
                    <th rowspan="2">Date</th>
                    <th rowspan="2">Description</th>
                    <th colspan="4">MVT du Stock Total</th> {{-- Colspan pour les qualifications --}}
                    <th colspan="3">MVT de l'Article : {{ $articleName ?? 'N/A' }}</th> {{-- Colspan pour Entrée/Sortie/Stock --}}
                    <th rowspan="2">Enregistré par</th>
                </tr>
                <tr>
                    <th>Achat</th>
                    <th>Consigne</th>
                    <th>Perte</th>
                    <th>Repreuve</th>
                    <th>Entrée</th>
                    <th>Sortie</th>
                    <th>Stock</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $totalAchat = 0;
                    $totalConsigne = 0;
                    $totalPerte = 0;
                    $totalRepreuve = 0;
                    $totalEntreeArticle = 0;
                    $totalSortieArticle = 0;
                    // Note: Le total du stock n'a pas de sens d'être sommé verticalement.
                    // Il représente un état à un instant T. On peut afficher le dernier stock.
                    $lastStock = 0;
                @endphp
                @foreach($movements as $movement)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($movement->created_at)->format('d/m/Y H:i') }}</td>
                    <td>{{ $movement->description ?? 'Aucune' }}</td>

                    {{-- MVT du Stock Total (Qualifications) --}}
                    <td class="qty-cell">
                        @if($movement->qualification === 'achat')
                            {{ $movement->quantity }}
                            @php $totalAchat += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>
                    <td class="qty-cell">
                        @if($movement->qualification === 'consigne')
                            {{ $movement->quantity }}
                            @php $totalConsigne += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>
                    <td class="qty-cell">
                        @if($movement->qualification === 'perte')
                            {{ $movement->quantity }}
                            @php $totalPerte += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>
                    <td class="qty-cell">
                        @if($movement->qualification === 'repreuve')
                            {{ $movement->quantity }}
                            @php $totalRepreuve += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>

                    {{-- MVT de l'Article --}}
                    <td class="qty-cell">
                        @if($movement->movement_type === 'entree')
                            {{ $movement->quantity }}
                            @php $totalEntreeArticle += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>
                    <td class="qty-cell">
                        @if($movement->movement_type === 'sortie')
                            {{ $movement->quantity }}
                            @php $totalSortieArticle += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>
                    <td class="qty-cell">
                        {{ $movement->stock ?? 'N/A' }}
                        @php $lastStock = $movement->stock ?? $lastStock; @endphp {{-- Met à jour le dernier stock vu --}}
                    </td>

                    <td>{{ $movement->user->first_name ?? 'N/A' }}</td>
                </tr>
                @endforeach
                {{-- Ligne de Total --}}
                <tr class="total-row">
                    <td colspan="2" class="total-label">Totaux :</td> {{-- Couvre Date et Description --}}
                    <td class="total-qty-cell">{{ $totalAchat }}</td>
                    <td class="total-qty-cell">{{ $totalConsigne }}</td>
                    <td class="total-qty-cell">{{ $totalPerte }}</td>
                    <td class="total-qty-cell">{{ $totalRepreuve }}</td>
                    <td class="total-qty-cell">{{ $totalEntreeArticle }}</td>
                    <td class="total-qty-cell">{{ $totalSortieArticle }}</td>
                    <td class="total-qty-cell">{{ $lastStock }}</td> {{-- Affiche le dernier stock --}}
                    <td></td> {{-- Vide pour Enregistré par --}}
                </tr>
            </tbody>
        </table>
    @endif

    <div class="footer">
        Rapport généré par votre système de gestion de stock. &copy; {{ date('Y') }}
    </div>
</body>
</html>