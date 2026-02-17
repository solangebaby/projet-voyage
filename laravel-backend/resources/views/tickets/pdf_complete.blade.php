<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bus Ticket - {{ $ticketNumber }}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: #ffffff;
            color: #000;
            padding: 40px;
            line-height: 1.6;
        }
        
        .ticket-container {
            max-width: 800px;
            margin: 0 auto;
            border: 3px solid #1E3A8A;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        
        .header {
            background: linear-gradient(135deg, #1E3A8A 0%, #0EA5E9 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 5px;
            letter-spacing: 2px;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .ticket-number-bar {
            background: #FDB900;
            color: #000;
            padding: 15px 30px;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            border-bottom: 3px solid #F9A825;
        }
        
        .content {
            padding: 30px;
            background: #fff;
        }
        
        .section {
            margin-bottom: 25px;
            padding: 20px;
            background: #F0F9FF;
            border-left: 4px solid #0EA5E9;
            border-radius: 8px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #0EA5E9;
            text-transform: uppercase;
            margin-bottom: 15px;
            letter-spacing: 1px;
        }
        
        .info-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
        }
        
        .info-row {
            display: table-row;
        }
        
        .info-label {
            display: table-cell;
            font-weight: bold;
            color: #374151;
            padding: 8px 15px 8px 0;
            width: 40%;
            font-size: 13px;
        }
        
        .info-value {
            display: table-cell;
            color: #000;
            padding: 8px 0;
            font-size: 13px;
        }
        
        .journey-section {
            background: linear-gradient(135deg, #FFF9E5 0%, #FFF3C4 100%);
            border: 3px solid #FDB900;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
        }
        
        .journey-grid {
            display: table;
            width: 100%;
        }
        
        .journey-col {
            display: table-cell;
            width: 45%;
            vertical-align: top;
        }
        
        .journey-arrow {
            display: table-cell;
            width: 10%;
            text-align: center;
            vertical-align: middle;
            font-size: 32px;
            color: #FDB900;
            font-weight: bold;
        }
        
        .journey-label {
            font-size: 11px;
            color: #6B7280;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .journey-city {
            font-size: 24px;
            font-weight: bold;
            color: #0F172A;
            margin-bottom: 5px;
        }
        
        .journey-agency {
            font-size: 14px;
            color: #0EA5E9;
            font-weight: bold;
            background: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
        }
        
        .journey-time {
            font-size: 16px;
            color: #374151;
            margin-top: 5px;
        }
        
        .price-section {
            background: linear-gradient(135deg, #FDB900 0%, #F9A825 100%);
            color: #0F172A;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 25px;
            border: 3px solid #0EA5E9;
        }
        
        .price-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .price-amount {
            font-size: 36px;
            font-weight: bold;
        }
        
        .qr-section {
            text-align: center;
            padding: 25px;
            background: #fff;
            border: 2px dashed #9CA3AF;
            border-radius: 12px;
            margin-bottom: 25px;
        }
        
        .qr-code img {
            width: 180px;
            height: 180px;
            margin: 10px auto;
            border: 4px solid #0EA5E9;
            border-radius: 8px;
            padding: 10px;
            background: white;
            box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3);
        }
        
        .qr-label {
            font-size: 12px;
            color: #6B7280;
            margin-top: 10px;
        }
        
        .footer {
            background: #F3F4F6;
            padding: 20px;
            text-align: center;
            border-top: 3px solid #E5E7EB;
        }
        
        .footer p {
            font-size: 11px;
            color: #6B7280;
            margin: 5px 0;
        }
        
        .important-notice {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .important-notice strong {
            color: #92400E;
            display: block;
            margin-bottom: 8px;
        }
        
        .important-notice ul {
            margin-left: 20px;
            font-size: 12px;
            color: #78350F;
        }
        
        .important-notice li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- Header -->
        <div class="header">
            <h1>🚌 KCTRIP</h1>
            <p>Your Trusted Travel Partner in Cameroon</p>
        </div>
        
        <!-- Ticket Number Bar -->
        <div class="ticket-number-bar">
            TICKET N° {{ $ticketNumber }}
        </div>
        
        <div class="content">
            <!-- Journey Information -->
            <div class="journey-section">
                <div class="journey-grid">
                    <div class="journey-col">
                        <div class="journey-label">DEPARTURE</div>
                        <div class="journey-city">{{ $departureCity }}</div>
                        <div class="journey-agency">📍 {{ $departureAgency }}</div>
                        <div class="journey-time">🕐 {{ $departureTime }}</div>
                    </div>
                    
                    <div class="journey-arrow">→</div>
                    
                    <div class="journey-col">
                        <div class="journey-label">ARRIVAL</div>
                        <div class="journey-city">{{ $destinationCity }}</div>
                        <div class="journey-agency">📍 {{ $arrivalAgency }}</div>
                        <div class="journey-time">🕐 {{ $arrivalTime }}</div>
                    </div>
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #FDB900;">
                    <div class="info-grid">
                        <div class="info-row">
                            <div class="info-label">📅 Travel Date:</div>
                            <div class="info-value"><strong>{{ $travelDate }}</strong></div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">💺 Seat Number:</div>
                            <div class="info-value"><strong style="font-size: 20px; color: #FDB900; background: #0F172A; padding: 4px 12px; border-radius: 6px;">{{ $seatNumber }}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Passenger Information -->
            <div class="section">
                <div class="section-title">👤 Passenger Information</div>
                <div class="info-grid">
                    <div class="info-row">
                        <div class="info-label">First Name:</div>
                        <div class="info-value">{{ $passengerFirstName }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Last Name:</div>
                        <div class="info-value">{{ $passengerLastName }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Nationality:</div>
                        <div class="info-value">{{ $passengerNationality }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">ID Number (CNI):</div>
                        <div class="info-value"><strong>{{ $passengerCNI }}</strong></div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Phone Number:</div>
                        <div class="info-value">{{ $passengerPhone }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Email:</div>
                        <div class="info-value">{{ $passengerEmail }}</div>
                    </div>
                </div>
            </div>
            
            <!-- Price -->
            <div class="price-section">
                <div class="price-label">TOTAL AMOUNT PAID</div>
                <div class="price-amount">{{ number_format($amount, 0, ',', ' ') }} FCFA</div>
                <div style="margin-top: 10px; opacity: 0.9;">✓ Payment Confirmed</div>
            </div>
            
            <!-- Agency Information -->
            <div class="section">
                <div class="section-title">🏢 Travel Agency</div>
                <div class="info-grid">
                    <div class="info-row">
                        <div class="info-label">Agency:</div>
                        <div class="info-value"><strong>KCTRIP</strong></div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Contact:</div>
                        <div class="info-value">+237 XXX XXX XXX</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Email:</div>
                        <div class="info-value">contact@kctrip.com</div>
                    </div>
                </div>
            </div>
            
            <!-- QR Code -->
            <div class="qr-section">
                <div style="font-weight: bold; color: #1E3A8A; margin-bottom: 10px;">SCAN FOR VERIFICATION</div>
                <div class="qr-code">
                    <img src="data:image/png;base64,{{ $qrCode }}" alt="QR Code">
                </div>
                <div class="qr-label">Present this QR code at boarding</div>
            </div>
            
            <!-- Important Notice -->
            <div class="important-notice">
                <strong>⚠️ IMPORTANT INFORMATION</strong>
                <ul>
                    <li>Arrive at the departure station at least <strong>30 minutes</strong> before departure time</li>
                    <li>Bring a valid ID (CNI, Passport) for verification</li>
                    <li>This ticket is <strong>non-transferable</strong></li>
                    <li>Seat assignment cannot be changed</li>
                    <li>Contact customer service for cancellations or modifications</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>KCTRIP</strong> - Your Trusted Travel Partner</p>
            <p>Website: www.kctrip.com | Email: support@kctrip.com | Phone: +237 XXX XXX XXX</p>
            <p>Issued on {{ \Carbon\Carbon::now()->format('l, F j, Y \a\t h:i A') }}</p>
            <p style="margin-top: 10px; font-size: 10px;">This ticket is valid only for the date, time, and journey specified above.</p>
        </div>
    </div>
</body>
</html>
