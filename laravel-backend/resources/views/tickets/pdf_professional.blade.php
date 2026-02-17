<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket KCTrip - {{ $ticketNumber }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }

        .ticket-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid #d1d5db;
        }

        .ticket-header {
            padding: 20px;
            text-align: center;
            background: white;
            border-bottom: 1px solid #e5e7eb;
        }

        .logo {
            height: 40px;
            margin-bottom: 10px;
        }

        .ticket-icon {
            width: 40px;
            height: 40px;
            margin: 10px auto;
        }

        .ticket-body {
            padding: 30px;
        }

        .info-row {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 0;
        }

        .info-label {
            width: 200px;
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }

        .info-value {
            flex: 1;
            font-size: 12px;
            color: #111827;
            font-weight: 600;
        }

        .qr-section {
            text-align: center;
            padding-top: 20px;
        }

        .qr-label {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 8px;
        }

        .qr-code-container {
            background: white;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            display: inline-block;
        }

        .qr-code-container img {
            display: block;
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- Header with Logo -->
        <div class="ticket-header">
            <img src="{{ public_path('logo3.jpg') }}" alt="KCTrip" class="logo">
            <svg class="ticket-icon" viewBox="0 0 256 256" fill="#9ca3af">
                <path d="M227.19,104.48l-64-32A8,8,0,0,0,152,80v31.5L93.18,80.48a8,8,0,0,0-11.18,7.29V136H40a8,8,0,0,0,0,16H82v48.23a8,8,0,0,0,11.18,7.29L152,176.5V208a8,8,0,0,0,11.19,7.29l64-32a8,8,0,0,0,0-14.31L168,136.5V119.5l59.19-29.69A8,8,0,0,0,227.19,104.48Z"></path>
            </svg>
        </div>

        <!-- Ticket Body -->
        <div class="ticket-body">
            <!-- Nom -->
            <div class="info-row">
                <span class="info-label">Nom :</span>
                <span class="info-value">{{ $passengerLastName }}</span>
            </div>

            <!-- Prénom -->
            <div class="info-row">
                <span class="info-label">Prénom :</span>
                <span class="info-value">{{ $passengerFirstName }}</span>
            </div>

            <!-- Nationalité -->
            <div class="info-row">
                <span class="info-label">Nationalité :</span>
                <span class="info-value">{{ $passengerNationality }}</span>
            </div>

            <!-- Numéro de CNI -->
            <div class="info-row">
                <span class="info-label">Numéro de CNI :</span>
                <span class="info-value" style="font-family: monospace;">{{ $passengerCNI }}</span>
            </div>

            <!-- Numéro de téléphone -->
            <div class="info-row">
                <span class="info-label">Numéro de téléphone :</span>
                <span class="info-value">{{ $passengerPhone }}</span>
            </div>

            <!-- Email -->
            <div class="info-row">
                <span class="info-label">Email :</span>
                <span class="info-value" style="word-break: break-all;">{{ $passengerEmail }}</span>
            </div>

            <!-- Sexe -->
            <div class="info-row">
                <span class="info-label">Sexe :</span>
                <span class="info-value">{{ $passengerGender }}</span>
            </div>

            <!-- Lieu de départ -->
            <div class="info-row">
                <span class="info-label">Lieu de départ :</span>
                <span class="info-value">{{ $departureAgency }} - {{ $departureCity }}</span>
            </div>

            <!-- Lieu d'arrivée -->
            <div class="info-row">
                <span class="info-label">Lieu d'arrivée :</span>
                <span class="info-value">{{ $arrivalAgency }} - {{ $destinationCity }}</span>
            </div>

            <!-- Agence de voyage -->
            <div class="info-row">
                <span class="info-label">Agence de voyage :</span>
                <span class="info-value">KCTrip</span>
            </div>

            <!-- Montant -->
            <div class="info-row">
                <span class="info-label">Montant :</span>
                <span class="info-value">{{ number_format($amount, 0, ',', ' ') }} Frs cfa</span>
            </div>

            <!-- Siège -->
            <div class="info-row">
                <span class="info-label">Numéro de siège :</span>
                <span class="info-value">{{ $seatNumber }}</span>
            </div>

            <!-- QR Code -->
            <div class="qr-section">
                <p class="qr-label">QR Code</p>
                <div class="qr-code-container">
                    @if($qrCode)
                        <img src="data:image/png;base64,{{ $qrCode }}" alt="QR Code" width="120" height="120" style="display: block;">
                    @else
                        <p style="font-size: 10px; color: #999;">QR Code non disponible</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</body>
</html>
