<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bon de Commande {{ $po->reference }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; }
        .header { width: 100%; margin-bottom: 30px; }
        .header td { vertical-align: top; }
        .company-info { font-size: 14px; }
        .document-title { font-size: 24px; font-weight: bold; color: #2c3e50; text-align: right; }
        
        .info-table { width: 100%; margin-bottom: 30px; }
        .info-table td { width: 50%; vertical-align: top; }
        .box { border: 1px solid #ccc; padding: 15px; border-radius: 5px; background-color: #f9f9f9; }
        .box h3 { margin-top: 0; font-size: 14px; color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #2c3e50; color: #fff; padding: 10px; text-align: left; font-size: 12px; }
        .items-table td { border-bottom: 1px solid #ddd; padding: 10px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .totals-table { width: 40%; float: right; border-collapse: collapse; }
        .totals-table td { padding: 8px; border-bottom: 1px solid #ddd; }
        .totals-table .grand-total { font-size: 16px; font-weight: bold; color: #2c3e50; background-color: #f2f2f2; }
        
        .footer { position: absolute; bottom: 30px; width: 100%; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
    </style>
</head>
<body>

    <table class="header">
        <tr>
            <td class="company-info">
                <strong>IKAROOTECH / DOVV</strong><br>
                Direction des Achats<br>
                Yaoundé, Cameroun<br>
                contact@ikarootech.com
            </td>
            <td>
                <div class="document-title">BON DE COMMANDE</div>
                <div class="text-right">
                    <strong>Réf :</strong> {{ $po->reference ?? 'N/A' }}<br>
                    <strong>Date :</strong> {{ \Carbon\Carbon::parse($po->order_date)->format('d/m/Y') }}<br>
                    <strong>Livraison prévue :</strong> {{ $po->expected_delivery_date ? \Carbon\Carbon::parse($po->expected_delivery_date)->format('d/m/Y') : 'À définir' }}
                </div>
            </td>
        </tr>
    </table>

    <table class="info-table">
        <tr>
            <td style="padding-right: 10px;">
                <div class="box">
                    <h3>FOURNISSEUR</h3>
                    <strong>{{ $po->supplier->name }}</strong><br>
                    Contact: {{ $po->supplier->contact_name ?? 'N/A' }}<br>
                    Téléphone: {{ $po->supplier->phone ?? 'N/A' }}<br>
                    NIU: {{ $po->supplier->tax_id ?? 'N/A' }}<br>
                    {{ $po->supplier->address }}
                </div>
            </td>
            <td style="padding-left: 10px;">
                <div class="box">
                    <h3>ADRESSE DE LIVRAISON</h3>
                    <strong>{{ $po->boutique->name }}</strong><br>
                    Boutique officielle<br>
                    Veuillez joindre ce bon de commande à votre bordereau de livraison.
                </div>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>Réf. Produit</th>
                <th>Désignation</th>
                <th class="text-center">Quantité</th>
                <th class="text-right">Prix Unitaire</th>
                <th class="text-right">Sous-total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($po->lines as $line)
            <tr>
                <td>{{ $line->product->sku ?? $line->product->barcode ?? '-' }}</td>
                <td>{{ $line->product->designation }}</td>
                <td class="text-center">{{ number_format($line->quantity_ordered, 2, ',', ' ') }}</td>
                <td class="text-right">{{ number_format($line->unit_price, 0, ',', ' ') }} FCFA</td>
                <td class="text-right">{{ number_format($line->subtotal, 0, ',', ' ') }} FCFA</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals-table">
        <tr class="grand-total">
            <td>TOTAL GÉNÉRAL</td>
            <td class="text-right">{{ number_format($po->total_amount, 0, ',', ' ') }} FCFA</td>
        </tr>
    </table>

    <div class="footer">
        Document généré par le système ERP Ikarootech le {{ date('d/m/Y à H:i') }}<br>
        La livraison doit être accompagnée d'une facture proforma ou définitive correspondant à ces montants.
    </div>

</body>
</html>