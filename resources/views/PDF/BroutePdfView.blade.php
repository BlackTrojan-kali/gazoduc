<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bordereau de Route #{{ $roadbill->id }}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            margin: 20px;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .header h1 {
            font-size: 24px;
            color: #0056b3;
            margin: 0;
            padding-bottom: 5px;
        }
        .header p {
            font-size: 14px;
            color: #666;
            margin: 0;
        }
        .section-title {
            font-size: 16px;
            color: #0056b3;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .details-table, .articles-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .details-table th, .details-table td,
        .articles-table th, .articles-table td {
            padding: 8px 12px;
            border: 1px solid #ddd;
            text-align: left;
            vertical-align: top;
        }
        .details-table th, .articles-table th {
            background-color: #f7f7f7;
            font-weight: bold;
            color: #555;
            width: 30%; /* Adjust as needed for labels */
        }
        .articles-table th {
            width: auto; /* Reset width for article table headers */
        }
        /* Styles for signature section without flexbox */
        .signature-section {
            overflow: hidden; /* Clearfix for floats */
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px dashed #ddd;
        }
        .signature-box-left {
            width: 45%;
            float: left; /* Float to the left */
            text-align: center;
            padding: 15px 0;
            border: 1px dashed #ccc;
            min-height: 80px; /* Space for signature */
            position: relative;
        }
        .signature-box-right {
            width: 45%;
            float: right; /* Float to the right */
            text-align: center;
            padding: 15px 0;
            border: 1px dashed #ccc;
            min-height: 80px; /* Space for signature */
            position: relative;
        }
        .signature-label {
            position: absolute;
            bottom: 5px;
            width: 100%;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bordereau de Route</h1>
            <p><strong>N°: {{ $roadbill->id }}</strong></p>
            <p>Date de Départ: {{ \Carbon\Carbon::parse($roadbill->departure_date)->format('d/m/Y') }}</p>
        </div>

        <div class="details">
            <h2 class="section-title">Informations Générales</h2>
            <table class="details-table">
                <tr>
                    <th>Véhicule</th>
                    <td>{{ $roadbill->vehicule->licence_plate }}</td>
                </tr>
                <tr>
                    <th>Chauffeur</th>
                    <td>{{ $roadbill->chauffeur->name }}</td>
                </tr>
                @if($roadbill->co_chauffeur)
                <tr>
                    <th>Co-Chauffeur</th>
                    <td>{{ $roadbill->co_chauffeur->name }}</td>
                </tr>
                @endif
                <tr>
                    <th>Agence de Départ</th>
                    <td>{{ $roadbill->departure->name }}</td>
                </tr>
                <tr>
                    <th>Agence d'Arrivée</th>
                    <td>{{ $roadbill->arrival->name }}</td>
                </tr>
                <tr>
                    <th>Type de Transport</th>
                    <td>{{ $roadbill->types }}</td>
                </tr>
                <tr>
                    <th>Statut Actuel</th>
                    <td>{{ $roadbill->status }}</td>
                </tr>
                <tr>
                    <th>Notes</th>
                    <td>{{ $roadbill->notes }}</td>
                </tr>
            </table>
        </div>

        <div class="articles">
            <h2 class="section-title">Détail des Articles Transférés</h2>
            <table class="articles-table">
                <thead>
                    <tr>
                        <th>Article</th>
                        <th>Quantité</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($roadbill->articles as $article)
                    <tr>
                        <td>{{ $article->name }}</td>
                        <td>{{ $article->pivot->qty }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="signature-section">
            <div class="signature-box-left">
                <span class="signature-label">Signature de l'Émetteur</span>
            </div>
            <div class="signature-box-right">
                <span class="signature-label">Signature du Récepteur</span>
            </div>
        </div>
    </div>
</body>
</html>