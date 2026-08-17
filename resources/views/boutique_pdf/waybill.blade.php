<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; line-height: 1.4; }
        .header-table { width: 100%; margin-bottom: 20px; border-bottom: 2px solid #444; padding-bottom: 10px; }
        .company-name { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #2c3e50; }
        .doc-title { font-size: 20px; font-weight: bold; text-align: right; color: #c0392b; }
        
        /* Sections Expéditeur / Destinataire */
        .logistics-box { width: 100%; margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; background-color: #f9f9f9; }
        .col-half { width: 48%; display: inline-block; vertical-align: top; }
        .label { font-weight: bold; color: #7f8c8d; font-size: 10px; text-transform: uppercase; }
        .value { font-size: 12px; font-weight: bold; margin-bottom: 5px; }

        /* Tableau des articles */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #2c3e50; color: white; padding: 8px; text-align: left; font-size: 11px; }
        .items-table td { border-bottom: 1px solid #ddd; padding: 8px; font-size: 12px; }
        .items-table tr:nth-child(even) { background-color: #f2f2f2; }
        .qty-col { text-align: right; font-family: monospace; font-size: 13px; font-weight: bold; }

        /* Pied de page / Signatures */
        .footer-table { width: 100%; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; }
        .signature-box { height: 80px; border: 1px dashed #ccc; margin-top: 5px; }
        .status-badge { 
            padding: 5px 10px; color: white; font-weight: bold; border-radius: 4px; font-size: 10px; 
            background-color: {{ $transfert->status == 'pending' ? '#f39c12' : '#27ae60' }};
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td style="width: 50%">
                <div class="company-name">MA BOUTIQUE ERP</div>
                <div>Système de Gestion de Stock</div>
            </td>
            <td style="width: 50%; text-align: right;">
                <div class="doc-title">BORDEREAU DE TRANSFERT</div>
                <div style="font-size: 14px; margin-top: 5px;">N° {{ str_pad($transfert->id, 6, '0', STR_PAD_LEFT) }}</div>
                <div style="margin-top: 5px;"><span class="status-badge">{{ strtoupper($transfert->status) }}</span></div>
            </td>
        </tr>
    </table>

    <div class="logistics-box">
        <div class="col-half">
            <div class="label">Expéditeur (Départ)</div>
            <div class="value">{{ $transfert->boutiqueDeparture->name }}</div>
            <div style="margin-top: 5px;">Date Départ : {{ \Carbon\Carbon::parse($transfert->departure_date)->format('d/m/Y H:i') }}</div>
            <div>Responsable : {{ $transfert->userEmitting->first_name }} {{ $transfert->userEmitting->last_name }}</div>
        </div>
        <div class="col-half" style="border-left: 1px solid #ccc; padding-left: 10px;">
            <div class="label">Destinataire (Arrivée)</div>
            <div class="value">{{ $transfert->boutiqueArrival->name }}</div>
            <div style="margin-top: 5px;">Date Arrivée Prévue : {{ \Carbon\Carbon::parse($transfert->arrival_date)->format('d/m/Y H:i') }}</div>
        </div>
    </div>

    <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd;">
        <table style="width: 100%">
            <tr>
                <td style="width: 33%">
                    <div class="label">Véhicule</div>
                    <div class="value">{{ $transfert->vehicule->type }} - {{ $transfert->vehicule->licence_plate }}</div>
                </td>
                <td style="width: 33%">
                    <div class="label">Chauffeur</div>
                    <div class="value">{{ $transfert->chauffeur->name }}</div>
                </td>
                <td style="width: 33%">
                    <div class="label">Téléphone Chauffeur</div>
                    <div class="value">{{ $transfert->chauffeur->phone_number ?? 'Non renseigné' }}</div>
                </td>
            </tr>
        </table>
    </div>

    <h3 style="border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">Détail du Chargement</h3>
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 50%">Désignation Produit</th>
                <th style="width: 30%">Référence (SKU)</th>
                <th style="width: 20%; text-align: right;">Quantité</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transfert->items as $item)
            <tr>
                <td>{{ $item->product->designation }}</td>
                <td>{{ $item->product->sku }}</td>
                <td class="qty-col">{{ number_format($item->qty, 2, ',', ' ') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="text-align: right; margin-bottom: 30px;">
        <strong>Total Articles : {{ count($transfert->items) }} lignes</strong>
    </div>

    <table class="footer-table">
        <tr>
            <td style="width: 33%; padding-right: 10px;">
                <div class="label">Visa Responsable Départ</div>
                <div class="signature-box"></div>
                <div style="font-size: 9px; margin-top: 2px;">Nom : {{ $transfert->userEmitting->last_name }}</div>
            </td>
            <td style="width: 33%; padding-right: 10px;">
                <div class="label">Visa Chauffeur</div>
                <div class="signature-box"></div>
                <div style="font-size: 9px; margin-top: 2px;">Je confirme avoir reçu la marchandise.</div>
            </td>
            <td style="width: 33%">
                <div class="label">Visa Réception (Arrivée)</div>
                <div class="signature-box"></div>
                <div style="font-size: 9px; margin-top: 2px;">Réserves éventuelles au dos.</div>
            </td>
        </tr>
    </table>

    <div style="text-align: center; font-size: 9px; color: #999; margin-top: 30px;">
        Document généré le {{ $date }} - Logiciel ERP
    </div>

</body>
</html>