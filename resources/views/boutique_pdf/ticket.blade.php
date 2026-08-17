<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ticket de Caisse</title>
    <style>
        @page {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Courier New', Courier, monospace; /* Police type ticket */
            font-size: 12px;
            margin: 5px;
            width: 100%;
            background: #fff;
        }
        .header, .footer {
            text-align: center;
            margin-bottom: 10px;
        }
        .header h2 { margin: 0; font-size: 16px; font-weight: bold; }
        .header p { margin: 2px 0; font-size: 10px; }
        
        .separator {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th { text-align: left; font-size: 10px; border-bottom: 1px solid #000; }
        td { font-size: 11px; padding: 2px 0; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .totals {
            margin-top: 10px;
            font-weight: bold;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-top: 2px;
        }
        .big-total {
            font-size: 16px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 5px 0;
            margin: 5px 0;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>{{ $sale->boutique->name ?? 'SUPERMARCHÉ' }}</h2>
        <p>{{ $sale->boutique->address ?? 'Adresse de la boutique' }}</p>
        <p>Tel: {{ $sale->boutique->phone ?? 'N/A' }}</p>
        <p>Vendeur: {{ $sale->user->first_name }}</p>
        <br>
        <p>Ticket: <strong>{{ $sale->facture_code }}</strong></p>
        <p>Date: {{ $sale->created_at->format('d/m/Y H:i') }}</p>
        <p>Client: {{ $sale->customer->name ?? 'Client de passage' }}</p>
    </div>

    <div class="separator"></div>

    <table>
        <thead>
            <tr>
                <th style="width: 45%;">Art.</th>
                <th style="width: 15%;">Qté</th>
                <th style="width: 20%;" class="text-right">P.U</th>
                <th style="width: 20%;" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->items as $item)
            <tr>
                <td>{{ Str::limit($item->product->designation, 15) }}</td>
                <td class="text-center">{{ $item->qty }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 0, ',', ' ') }}</td>
                <td class="text-right">{{ number_format($item->sub_total, 0, ',', ' ') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="separator"></div>

    <div class="totals">
        <div class="total-row big-total">
            <span>TOTAL À PAYER:</span>
            <span class="text-right">{{ number_format($sale->total_ttc, 0, ',', ' ') }} FCFA</span>
        </div>
        
        <div class="total-row">
            <span>Mode:</span>
            <span class="text-right">{{ ucfirst($sale->payment_mode) }}</span>
        </div>
        @if($sale->received_amount)
        <div class="total-row">
            <span>Reçu:</span>
            <span class="text-right">{{ number_format($sale->received_amount, 0, ',', ' ') }}</span>
        </div>
        <div class="total-row">
            <span>Rendu:</span>
            <span class="text-right">{{ number_format($sale->received_amount - $sale->total_ttc, 0, ',', ' ') }}</span>
        </div>
        @endif
    </div>

    <div class="footer">
        <br>
        <p>Merci de votre visite !</p>
        <p>À bientôt.</p>
        {{-- Code barre ou QR Code ici si besoin --}}
    </div>

    {{-- Script pour lancer l'impression automatiquement dès l'ouverture --}}
    <script type="text/javascript">
        window.onload = function() { window.print(); }
    </script>
</body>
</html>