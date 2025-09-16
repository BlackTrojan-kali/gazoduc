<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture #{{ $facture->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .container {
            width: 100%;
            margin: auto;
        }
        .header, .footer {
            width: 100%;
            padding: 10px 0;
            border-bottom: 2px solid #eee;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }
        .header h1 {
            color: #4CAF50;
            font-size: 24px;
            margin: 0;
        }
        .invoice-details {
            width: 100%;
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .invoice-details > div {
            width: 48%;
        }
        .invoice-details h3 {
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .invoice-details p {
            margin: 0;
            line-height: 1.5;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .items-table th {
            background-color: #f2f2f2;
        }
        .totals {
            width: 300px;
            margin-left: auto;
            border: 1px solid #ddd;
        }
        .totals p {
            display: flex;
            justify-content: space-between;
            padding: 5px 10px;
            margin: 0;
        }
        .totals .total-row {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .footer {
            margin-top: 50px;
            border-bottom: none;
            border-top: 2px solid #eee;
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>Facture</h1>
                <p>N° Facture: **{{ $facture->id }}**</p>
                <p>Date: {{ $facture->created_at->format('d/m/Y') }}</p>
            </div>
            <div class="text-right">
                <p><strong>{{ $facture->agency->name }}</strong></p>
                <p>{{ $facture->agency->address }}</p>
                <p>Tél: {{ $facture->agency->phone_number }}</p>
                <p>Email: {{ $facture->agency->email }}</p>
            </div>
        </div>

        <div class="invoice-details">
            <div>
                <h3>Facturé à</h3>
                <p><strong>{{ $facture->client->name }}</strong></p>
                <p>{{ $facture->client->address ?? 'Non spécifié' }}</p>
                <p>Tél: {{ $facture->client->phone_number }}</p>
                <p>Email: {{ $facture->client->email ?? 'Non spécifié' }}</p>
            </div>
            <div>
                <h3>Informations de la Vente</h3>
                <p>Type de vente: **{{ $facture->invoice_type }}**</p>
                <p>Mode de paiement: **{{ $facture->currency }}**</p>
                <p>Enregistrée par: **{{ $facture->user->first_name." ".$facture->user->last_name }}**</p>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Article</th>
                    <th>Quantité</th>
                    <th class="text-right">Prix Unitaire</th>
                    <th class="text-right">Sous-total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($facture->items as $item)
                    <tr>
                        <td>{{ $item->article->name }}</td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                        <td class="text-right">{{ number_format($item->subtotal, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            <p><span>Sous-total:</span><span>{{ number_format($facture->total_amount, 2) }}</span></p>
            <p class="total-row"><span>Total:</span><span>{{ number_format($facture->total_amount, 2) }}</span></p>
        </div>

        <div class="footer">
            <p>Merci pour votre confiance!</p>
            <p>Pour tout renseignement, n'hésitez pas à nous contacter.</p>
        </div>
    </div>
</body>
</html>
