<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture #{{ $subscription->id }}</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; }
        .invoice-details { float: right; }
        .company-info { float: left; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/logo-erp.png') }}" alt="Logo de l'entreprise" class="logo">
        <h1>Facture</h1>
    </div>

    <div class="company-info">
        <strong>Authentica SARL</strong><br>
        Odza terminus<br>
        620587504<br>
        contact@authentica.com
    </div>

    <div class="invoice-details">
        <strong>Facture #:</strong><?php echo rand(0,999999999999);?><br>
        <strong>Date:</strong> {{ $start  }} <br> <strong>exp:</strong>{{$newExpirationDate}}<br>
        <strong>Client:</strong> {{ $entreprise->name }}
    </div>
    <div style="clear: both;"></div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $licence->name }}</td>
                <td>{{ count($agencies) }}</td>
                <td>{{ $price }}</td>
                <?php $total =  count($agencies) * $price;?>
                <td>{{ $total }}</td> {{-- Utilisation de la variable $total passée depuis le contrôleur --}}
            </tr>
        </tbody>
    </table>

    <div class="total">
        Total : {{ $total }} XAF
    </div>
</body>
</html>