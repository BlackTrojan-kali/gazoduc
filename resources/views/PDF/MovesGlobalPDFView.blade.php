<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Rapport Global d'Historique des Mouvements</title>
    <style>
        /* Styles généraux du corps du document */
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 8.5px; /* Réduit encore légèrement la police pour plus d'espace */
            margin: 10px; /* Réduit les marges pour maximiser l'espace */
            color: #333;
            line-height: 1.2;
        }

        /* En-tête du rapport */
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #1a237e;
            padding-bottom: 6px;
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

        /* Styles pour les lignes supprimées/modifiées pour la visualisation */
        .removed-line {
            background-color: #ffe6e6; /* Rouge très clair */
            color: #cc0000; /* Rouge foncé */
            text-decoration: line-through;
        }
        .added-line {
            background-color: #e6ffe6; /* Vert très clair */
            color: #008000; /* Vert foncé */
        }
        .modified-line {
            background-color: #fff0e6; /* Orange très clair */
            color: #e67300; /* Orange foncé */
        }
        
        /* NOUVEAU STYLE: Mise en évidence des lignes supprimées */
        .deleted-row {
            background-color: #fcebeb !important; /* Rouge très clair pour le fond */
            color: #990000; /* Texte rouge foncé pour plus de visibilité */
        }


        /* Tableau des mouvements */
        .movements-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .movements-table th,
        .movements-table td {
            border: 1px solid #e0e0e0;
            padding: 4px 6px; /* Paddings très réduits */
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
        }
        .movements-table th {
            background-color: #3f51b5;
            color: #ffffff;
            font-weight: bold;
            font-size: 8.5px; /* Taille de police pour les en-têtes */
            text-transform: uppercase;
            letter-spacing: 0.2px;
            text-align: center; /* Centrer les en-têtes */
        }
        .movements-table tbody tr:nth-child(even) {
            background-color: #f5f5f5;
        }
        .movements-table td {
            font-size: 8px; /* Taille de police pour les données des cellules */
        }
        .movements-table td.qty-cell {
            text-align: right; /* Aligne les quantités à droite */
        }

        /* Largeurs spécifiques pour les colonnes (ajustées pour la nouvelle structure) */
        .movements-table th:nth-child(1), .movements-table td:nth-child(1) { width: 10%; } /* Date */
        .movements-table th:nth-child(2), .movements-table td:nth-child(2) { width: 7%; }  /* Perte */
        .movements-table th:nth-child(3), .movements-table td:nth-child(3) { width: 7%; }  /* Achat */
        .movements-table th:nth-child(4), .movements-table td:nth-child(4) { width: 7%; }  /* Repreuve */
        .movements-table th:nth-child(5), .movements-table td:nth-child(5) { width: 7%; }  /* Consigne */
        .movements-table th:nth-child(6), .movements-table td:nth-child(6) { width: 12%; } /* Article */
        .movements-table th:nth-child(7), .movements-table td:nth-child(7) { width: 7%; }  /* Entrée */
        .movements-table th:nth-child(8), .movements-table td:nth-child(8) { width: 7%; }  /* Sortie */
        .movements-table th:nth-child(9), .movements-table td:nth-child(9) { width: 10%; } /* Stock Actuel */
        .movements-table th:nth-child(10), .movements-table td:nth-child(10) { width: 8%; }  /* Agence */
        .movements-table th:nth-child(11), .movements-table td:nth-child(11) { width: 18%; } /* Infos. */


        /* Styles pour la ligne de total */
        .total-row {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 9px;
            color: #1a237e;
        }
        .total-row td {
            border-top: 2px solid #3f51b5;
        }
        .total-row .total-label {
            text-align: right;
            padding-right: 8px;
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
        <h1>Rapport Global d'Historique des Mouvements</h1>
        <p class="modified-line">
            @if(isset($agencyName) && $agencyName !== 'Toutes les agences')
                Agence: {{ $agencyName }} |
            @endif
            @if(isset($articleName) && $articleName !== 'Tous les articles')
                Article: {{ $articleName }} |
            @endif
            @if(isset($serviceName) && $serviceName !== 'Tous les services')
                Service: {{ $serviceName }} |
            @endif
            Type de Mouvement: {{ $movementTypeName }}
        </p>
        <p class="removed-line">
            Période: Toutes les dates (rapport global)
        </p>
        <p class="added-line">
            Période: Du {{ $startDate }} au {{ $endDate }}
        </p>
        <p>Généré le {{ now()->format('d/m/Y à H:i:s') }}</p>
    </div>

    @if($movements->isEmpty())
        <div class="no-data">
            <p>Aucun mouvement global trouvé pour les critères sélectionnés, monsieur. 😔</p>
        </div>
    @else
        <table class="movements-table">
            <thead>
                <tr>
                    <th rowspan="2">Date</th>
                    <th colspan="4">Qualification</th>
                    <th rowspan="2">Article</th>
                    <th colspan="2">Flux</th>
                    <th rowspan="2">Stock Actuel</th>
                    <th rowspan="2">Agence</th> {{-- Déplacé ici --}}
                    <th rowspan="2">Infos.</th>
                </tr>
                <tr>
                    <th>Perte</th>
                    <th>Achat</th>
                    <th>Repreuve</th>
                    <th>Consigne</th>
                    <th>Entrée</th>
                    <th>Sortie</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $totalEntree = 0;
                    $totalSortie = 0;
                    $totalPerte = 0;
                    $totalAchat = 0;
                    $totalRepreuve = 0;
                    $totalConsigne = 0;
                @endphp
                @foreach($movements as $movement)
                <tr class="{{ $movement->deleted_at ? 'deleted-row' : '' }}">
                    <td>{{ \Carbon\Carbon::parse($movement->created_at)->format('d/m/Y H:i') }}</td>
                    
                    <td class="qty-cell">
                        @if($movement->qualification === 'perte')
                            {{ $movement->quantity }}
                            @php $totalPerte += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>
                    <td class="qty-cell">
                        @if($movement->qualification === 'achat')
                            {{ $movement->quantity }}
                            @php $totalAchat += $movement->quantity; @endphp
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
                    <td class="qty-cell">
                        @if($movement->qualification === 'consigne')
                            {{ $movement->quantity }}
                            @php $totalConsigne += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>

                    <td>{{ $movement->article->name ?? 'N/A' }}</td>

                    <td class="qty-cell">
                        @if($movement->movement_type === 'entree')
                            {{ $movement->quantity }}
                            @php $totalEntree += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>
                    <td class="qty-cell">
                        @if($movement->movement_type === 'sortie')
                            {{ $movement->quantity }}
                            @php $totalSortie += $movement->quantity; @endphp
                        @else
                            0
                        @endif
                    </td>
                    
                    <td>{{ $movement->stock ?? 'N/A' }}</td>
                    <td>{{ $movement->agency->name ?? 'N/A' }}</td> {{-- Déplacé ici --}}
                    <td>
                        {{ $movement->description ?? 'Aucune' }}
                        <br/>
                        <span style="font-size: 7px; color: #666;">({{ $movement->user->first_name ?? 'N/A' }})</span>
                    </td>
                </tr>
                @endforeach
                {{-- Ligne de Total --}}
                <tr class="total-row">
                    <td colspan="1" class="total-label">Total :</td>
                    <td class="total-qty-cell">{{ $totalPerte }}</td>
                    <td class="total-qty-cell">{{ $totalAchat }}</td>
                    <td class="total-qty-cell">{{ $totalRepreuve }}</td>
                    <td class="total-qty-cell">{{ $totalConsigne }}</td>
                    <td></td> {{-- Vide pour l'article --}}
                    <td class="total-qty-cell">{{ $totalEntree }}</td>
                    <td class="total-qty-cell">{{ $totalSortie }}</td>
                    <td></td> {{-- Vide pour le Stock Actuel --}}
                    <td></td> {{-- Vide pour l'agence --}}
                    <td></td> {{-- Vide pour Infos. --}}
                </tr>
            </tbody>
        </table>
    @endif

    <div class="footer">
        Rapport généré par votre système de gestion de stock. &copy; {{ date('Y') }}
    </div>
</body>
</html>