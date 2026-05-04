<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Facture N° {{ $subscription->id ?? rand(1000, 9999) }}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            font-size: 13px; 
            color: #333;
        }
        .container {
            width: 100%;
            margin: 0 auto;
        }
        /* En-tête */
        .header-left { 
            float: left; 
            width: 50%; 
        }
        .header-right { 
            float: right; 
            width: 45%; 
            border: 1px solid #000; 
            padding: 10px;
            border-radius: 5px;
        }
        .clear { clear: both; }
        
        h1 {
            text-align: center;
            font-size: 20px;
            text-transform: uppercase;
            margin-top: 40px;
            margin-bottom: 20px;
            text-decoration: underline;
        }

        /* Tableau */
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            margin-bottom: 20px;
        }
        th, td { 
            border: 1px solid #000; 
            padding: 10px; 
            text-align: left; 
        }
        th { 
            background-color: #f2f2f2; 
            font-weight: bold;
            text-align: center;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        /* Total et Infos bancaires */
        .totals-section {
            width: 40%;
            float: right;
        }
        .totals-section table th { background-color: #fff; text-align: right; border: none; padding-right: 15px;}
        .totals-section table td { text-align: right; font-weight: bold; font-size: 14px;}
        
        .bank-info {
            width: 55%;
            float: left;
            border: 1px dashed #777;
            padding: 10px;
            background-color: #f9f9f9;
        }

        /* Pied de page et Signature */
        .footer-amount {
            margin-top: 20px;
            font-style: italic;
            font-weight: bold;
        }
        .signature-box {
            float: right;
            text-align: center;
            margin-top: 40px;
            width: 250px;
        }
        .signature-img {
            max-width: 100%;
            height: auto;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <div>
            <div class="header-left">
                <img src="{{ public_path('images/logo-erp.png') }}" alt="Logo" style="max-width: 120px; margin-bottom: 10px;"><br>
                <strong>AUTHENTICA SARL</strong><br>
                REGISTRE DE COMMERCE: RC/YAO/2020/B/788<br>
                NIU: M022014406381T<br>
                ADRESSE: ODZA, YAOUNDE<br>
                TEL: +(237) 653 757515 / 691 593 825
            </div>

            <div class="header-right">
                <h3 style="margin-top: 0; border-bottom: 1px solid #000; padding-bottom: 5px;">CLIENT</h3>
                <strong>NOM/RAISON SOCIAL:</strong> {{ $entreprise->name }}<br>
                <strong>ADRESSE:</strong> {{ $entreprise->address ?? 'N/A' }}<br>
                <strong>TEL:</strong> {{ $entreprise->phone_number ?? 'N/A' }}<br>
                <strong>NIU:</strong> {{ $entreprise->tax_number ?? 'N/A' }}<br>
            </div>
            <div class="clear"></div>
        </div>

        <h1>Facture N° {{ $subscription->id ?? rand(1000, 9999) }}</h1>
        <p style="text-align: right;"><strong>Date de facturation :</strong> {{ \Carbon\Carbon::parse($start)->format('d/m/Y') ?? now()->format('d/m/Y') }}</p>

        <table>
            <thead>
                <tr>
                    <th>REF</th>
                    <th>Désignation</th>
                    <th>Qté</th>
                    <th>Prix U HT</th>
                    <th>PRIX TOTAL HT</th>
                </tr>
            </thead>
            <tbody>
                <?php 
                    $qty = count($agencies) > 0 ? count($agencies) : 1; 
                    $total = $qty * $price;
                ?>
                <tr>
                    <td class="text-center">LIC-{{ $licence->id }}</td>
                    <td>
                        Frais de sécurité et de mise à jour structurelle<br>
                        Frais de maintenance générale<br>
                        Frais de location de la licence d'exploitation <strong>IKAROOTECH ERP</strong> ({{ $licence->name }})<br>
                        <em>Période : du {{ \Carbon\Carbon::parse($start)->format('d/m/Y') }} au {{ \Carbon\Carbon::parse($newExpirationDate)->format('d/m/Y') }}</em>
                    </td>
                    <td class="text-center">{{ str_pad($qty, 2, '0', STR_PAD_LEFT) }}</td>
                    <td class="text-right">{{ number_format($price, 0, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($total, 0, ',', ' ') }}</td>
                </tr>
            </tbody>
        </table>

        <div>
            <div class="bank-info">
                <strong style="text-decoration: underline;">INFORMATION DE PAIEMENT</strong><br><br>
                <strong>MODE DE PAIEMENT:</strong> Virement / Chèque<br>
                <strong>COMPTE:</strong> AFRILAND FIRST BANK<br>
                <strong>N°:</strong> 10005 0000109732451001
            </div>

            <div class="totals-section">
                <table>
                    <tr>
                        <th>Montant TOTAL HT :</th>
                        <td>{{ number_format($total, 0, ',', ' ') }} FCFA</td>
                    </tr>
                    <tr>
                        <th>NET À PAYER :</th>
                        <td style="font-size: 16px; border-top: 2px solid #000;">{{ number_format($total, 0, ',', ' ') }} FCFA</td>
                    </tr>
                </table>
            </div>
            <div class="clear"></div>
        </div>


        <div class="signature-box">
            <strong style="text-decoration: underline;">LA DIRECTION:</strong><br>
            <img src="{{ public_path('images/signature.png') }}" alt="Signature et Cachet" class="signature-img">
        </div>

    </div>
</body>
</html>