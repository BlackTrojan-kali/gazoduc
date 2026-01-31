<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture #{{ $facture->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
            margin: 0;
            padding: 10px;
        }
        .container {
            width: 100%;
            margin: auto;
        }
        /* Remplacement de flexbox par float pour compatibilité PDF */
        .header {
            width: 100%;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 30px;
            overflow: hidden; /* Clearfix */
        }
        .header-left {
            float: left;
            width: 33%;
        }
        .header-center {
            float: left;
            width: 33%;
            text-align: center;
        }
        .header-right {
            float: right;
            width: 33%;
            text-align: right;
        }
        .header h1 {
            color: #4CAF50;
            font-size: 24px;
            margin: 0;
            text-transform: uppercase;
        }
        .logo {
            width: 90px;
            height: 70px;
            object-fit: contain;
        }
        .invoice-details {
            width: 100%;
            margin-bottom: 30px;
            overflow: hidden;
        }
        .billing-to {
            float: left;
            width: 48%;
        }
        .sale-info {
            float: right;
            width: 48%;
        }
        .invoice-details h3 {
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 10px;
            font-size: 14px;
            color: #4CAF50;
        }
        .invoice-details p {
            margin: 2px 0;
            line-height: 1.4;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 10px 8px;
            text-align: left;
        }
        .items-table th {
            background-color: #f8f8f8;
            font-weight: bold;
        }
        .totals-container {
            width: 100%;
            overflow: hidden;
        }
        .totals {
            float: right;
            width: 250px;
            border: 1px solid #ddd;
        }
        .total-row-item {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
        }
        .total-row-item span:first-child {
            font-weight: bold;
        }
        .total-final {
            background-color: #f2f2f2;
            font-size: 13px;
            font-weight: bold;
            color: #000;
        }
        .footer {
            margin-top: 50px;
            padding-top: 15px;
            border-top: 2px solid #eee;
            text-align: center;
            font-style: italic;
            color: #777;
        }
        /* Utility classes */
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .clearfix::after { content: ""; clear: both; display: table; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header clearfix">
            <div class="header-left">
                @if($entreprise->logo_path)
                    <img src="{{ public_path('images/clients/' . $entreprise->logo_path) }}" alt="Logo" class="logo">
                @endif
            </div>
            <div class="header-center">
                <h1>Facture</h1>
                <p>N°: <b>{{ $facture->id }}</b></p>
                <p>Date: {{ $facture->created_at->format('d/m/Y') }}</p>
            </div>
            <div class="header-right">
                <p><strong>{{ $facture->agency->name }}</strong></p>
                <p>{{ $facture->agency->address }}</p>
                <p>Tél: {{ $facture->agency->phone_number }}</p>
                <p>{{ $facture->agency->email }}</p>
            </div>
        </div>

        <div class="invoice-details clearfix">
            <div class="billing-to">
                <h3>Facturé à</h3>
                <p><strong>{{ $facture->client->name }}</strong></p>
                <p>{{ $facture->client->address ?? 'Non spécifié' }}</p>
                <p>Tél: {{ $facture->client->phone_number }}</p>
                <p>Email: {{ $facture->client->email ?? 'Non spécifié' }}</p>
            </div>
            <div class="sale-info">
                <h3>Informations de la Vente</h3>
                <p>Type de vente: <b>{{ $facture->invoice_type }}</b></p>
                <p>Mode de paiement: <b>{{ $facture->currency }}</b></p>
                <p>Vendeur: <b>{{ $facture->user->first_name }} {{ $facture->user->last_name }}</b></p>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Article</th>
                    <th class="text-center" style="width: 80px;">Qté</th>
                    <th class="text-right" style="width: 120px;">Prix Unitaire</th>
                    <th class="text-right" style="width: 120px;">Sous-total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($facture->items as $item)
                    <tr>
                        <td>{{ $item->article->name }}</td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format($item->unit_price, 2, ',', ' ') }}</td>
                        <td class="text-right">{{ number_format($item->subtotal, 2, ',', ' ') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals-container clearfix">
            <div class="totals">
                <div class="total-row-item">
                    <span style="width: 100px; display: inline-block;">Sous-total:</span>
                    <span style="float: right;">{{ number_format($facture->total_amount, 2, ',', ' ') }} {{ $facture->currency }}</span>
                </div>
                <div class="total-row-item total-final">
                    <span style="width: 100px; display: inline-block;">TOTAL:</span>
                    <span style="float: right;">{{ number_format($facture->total_amount, 2, ',', ' ') }} {{ $facture->currency }}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>Pour tout renseignement, n'hésitez pas à nous contacter à l'adresse {{ $facture->agency->email }}.</p>
        </div>
    </div>
</body>
</html>