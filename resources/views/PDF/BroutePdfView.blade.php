<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Bordereau de Route #{{ $roadbill->id }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 30px;
            color: #333;
            background-color: #fff;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .brand-name {
            font-size: 18px;
            font-weight: bold;
            color: #1a2a40;
            text-transform: uppercase;
        }
        .system-name {
            font-size: 12px;
            color: #666;
        }
        .doc-title {
            text-align: right;
            font-size: 20px;
            font-weight: bold;
            color: #c0392b; /* Rouge bordeaux comme sur l'image */
            text-transform: uppercase;
        }
        .doc-number {
            text-align: right;
            font-size: 14px;
            color: #333;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            background-color: #27ae60;
            color: white;
            font-weight: bold;
            border-radius: 3px;
            font-size: 10px;
            margin-top: 5px;
            text-transform: uppercase;
        }

        /* Grilles d'informations */
        .info-grid {
            width: 100%;
            margin-bottom: 20px;
            border: 1px solid #eee;
            background-color: #fcfcfc;
        }
        .info-grid td {
            width: 50%;
            padding: 15px;
            vertical-align: top;
            border-right: 1px solid #eee;
        }
        .info-title {
            font-size: 10px;
            font-weight: bold;
            color: #999;
            text-transform: uppercase;
            margin-bottom: 5px;
            display: block;
        }
        .info-content {
            font-size: 12px;
            color: #111;
            font-weight: bold;
        }
        .info-sub {
            font-size: 11px;
            color: #444;
            margin-top: 3px;
        }

        /* Tableau des articles */
        .section-header {
            font-size: 14px;
            font-weight: bold;
            color: #1a2a40;
            margin-bottom: 10px;
            border-bottom: 1px solid #1a2a40;
            padding-bottom: 5px;
        }
        .articles-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .articles-table th {
            background-color: #1a2a40;
            color: white;
            text-transform: uppercase;
            font-size: 10px;
            padding: 8px;
            text-align: left;
        }
        .articles-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .total-row {
            text-align: right;
            font-weight: bold;
            font-size: 12px;
            margin-top: 10px;
            padding-right: 10px;
        }

        /* Signatures */
        .signature-table {
            width: 100%;
            margin-top: 40px;
        }
        .signature-box {
            width: 33%;
            border: 1px dashed #ccc;
            height: 100px;
            padding: 10px;
            vertical-align: top;
        }
        .signature-title {
            font-size: 9px;
            font-weight: bold;
            color: #777;
            text-transform: uppercase;
            text-align: center;
            display: block;
            margin-bottom: 50px;
        }
        .signature-footer {
            font-size: 9px;
            color: #999;
            text-align: center;
        }

        .footer-note {
            position: fixed;
            bottom: 20px;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #aaa;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td>
                <div class="brand-name">{{ $entreprise->name ?? 'MA BOUTIQUE ERP' }}</div>
                <div class="system-name">Système de Gestion de Stock</div>
            </td>
            <td style="text-align: right;">
                <div class="doc-title">Bordereau de Route</div>
                <div class="doc-number">N° {{ str_pad($roadbill->id, 6, '0', STR_PAD_LEFT) }}</div>
                <div class="status-badge">{{ $roadbill->status }}</div>
            </td>
        </tr>
    </table>

    <table class="info-grid">
        <tr>
            <td>
                <span class="info-title">Expéditeur (Départ)</span>
                <div class="info-content">{{ $roadbill->departure->name ?? 'N/A' }}</div>
                <div class="info-sub">Date Départ : {{ \Carbon\Carbon::parse($roadbill->departure_date)->format('d/m/Y H:i') }}</div>
                <div class="info-sub">Notes : {{ $roadbill->notes ?? '-' }}</div>
            </td>
            <td style="border-right: none;">
                <span class="info-title">Destinataire (Arrivée)</span>
                <div class="info-content">{{ $roadbill->arrival->name ?? 'N/A' }}</div>
                <div class="info-sub">Type : {{ $roadbill->types }}</div>
                <div class="info-sub">Statut : {{ $roadbill->status }}</div>
            </td>
        </tr>
    </table>

    <table class="info-grid">
        <tr>
            <td style="width: 33%;">
                <span class="info-title">Véhicule</span>
                <div class="info-content">{{ $roadbill->vehicule->licence_plate ?? 'N/A' }}</div>
            </td>
            <td style="width: 33%;">
                <span class="info-title">Chauffeur</span>
                <div class="info-content">{{ $roadbill->chauffeur->name ?? 'N/A' }}</div>
            </td>
            <td style="width: 34%; border-right: none;">
                <span class="info-title">Co-Chauffeur</span>
                <div class="info-content">{{ $roadbill->co_chauffeur->name ?? '-' }}</div>
            </td>
        </tr>
    </table>

    <div class="section-header">Détail du Chargement</div>
    <table class="articles-table">
        <thead>
            <tr>
                <th>Désignation Produit</th>
                <th class="text-center">Unité</th>
                <th class="text-right">Quantité</th>
            </tr>
        </thead>
        <tbody>
            @forelse($roadbill->articles as $article)
            <tr>
                <td><strong>{{ $article->name }}</strong></td>
                <td class="text-center">{{ $article->unit ?? 'U' }}</td>
                <td class="text-right">{{ number_format($article->pivot->qty, 2, ',', ' ') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="3" class="text-center">Aucun article enregistré.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="total-row">
        Total Articles : {{ $roadbill->articles->count() }} lignes
    </div>

    <table class="signature-table">
        <tr>
            <td class="signature-box">
                <span class="signature-title">Visa Responsable Départ</span>
                <div class="signature-footer">Nom : {{ auth()->user()->name }}</div>
            </td>
            <td style="width: 5%;"></td>
            <td class="signature-box">
                <span class="signature-title">Visa Chauffeur</span>
                <div class="signature-footer">Je confirme le chargement</div>
            </td>
            <td style="width: 5%;"></td>
            <td class="signature-box">
                <span class="signature-title">Visa Réception (Arrivée)</span>
                <div class="signature-footer">Réserves éventuelles au dos</div>
            </td>
        </tr>
    </table>

    <div class="footer-note">
        Document généré le {{ date('d/m/Y H:i') }} - Logiciel ERP
    </div>

</body>
</html>