<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bus Ticket - {{ $ticketNumber }}</title>
    <style>
        @page { size: A4 portrait; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            background: #ffffff;
            color: #000;
            padding: 20px;
        }
        
        .ticket {
            max-width: 750px;
            margin: 0 auto;
            border: 4px solid #1E3A8A;
            background: white;
        }
        
        /* Header Section */
        .header {
            background: linear-gradient(135deg, #1E3A8A 0%, #0EA5E9 100%);
            color: white;
            padding: 25px;
            text-align: center;
            border-bottom: 5px solid #FDB900;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
            letter-spacing: 3px;
        }
        
        .header p {
            font-size: 13px;
            margin-top: 5px;
        }
        
        /* Ticket Number */
        .ticket-number {
            background: #FDB900;
            color: #000;
            padding: 12px 20px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            border-bottom: 3px solid #0EA5E9;
        }
        
        /* Main Content */
        .content {
            padding: 25px;
        }
        
        /* Route Section - MOST IMPORTANT */
        .route-section {
            background: linear-gradient(135deg, #FFF9E5 0%, #FFF3C4 100%);
            border: 4px solid #FDB900;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 10px;
        }
        
        .route-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        
        .route-col {
            display: table-cell;
            width: 42%;
            vertical-align: top;
            padding: 10px;
        }
        
        .route-arrow {
            display: table-cell;
            width: 16%;
            text-align: center;
            vertical-align: middle;
            font-size: 40px;
            font-weight: bold;
            color: #0EA5E9;
        }
        
        .city-name {
            font-size: 28px;
            font-weight: bold;
            color: #0F172A;
            margin-bottom: 8px;
        }
        
        .agency-name {
            background: #0EA5E9;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 15px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 8px;
        }
        
        .time-info {
            font-size: 22px;
            font-weight: bold;
            color: #0F172A;
            margin-top: 5px;
        }
        
        .date-seat-row {
            display: table;
            width: 100%;
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #0EA5E9;
        }
        
        .date-seat-row > div {
            display: table-cell;
            width: 50%;
            padding: 5px;
        }
        
        .label-small {
            font-size: 11px;
            color: #6B7280;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        
        .value-large {
            font-size: 18px;
            font-weight: bold;
            color: #0F172A;
        }
        
        .seat-number-highlight {
            font-size: 32px;
            font-weight: bold;
            color: #FDB900;
            background: #0F172A;
            padding: 8px 20px;
            border-radius: 8px;
            display: inline-block;
        }
        
        /* Passenger Info */
        .info-section {
            background: #F0F9FF;
            border-left: 5px solid #0EA5E9;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
        }
        
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #0EA5E9;
            text-transform: uppercase;
            margin-bottom: 12px;
            letter-spacing: 1px;
        }
        
        .info-table {
            width: 100%;
        }
        
        .info-table td {
            padding: 6px 0;
            font-size: 13px;
        }
        
        .info-table td:first-child {
            font-weight: bold;
            color: #374151;
            width: 35%;
        }
        
        .info-table td:last-child {
            color: #000;
        }
        
        /* Price Section */
        .price-section {
            background: linear-gradient(135deg, #FDB900 0%, #F9A825 100%);
            color: #0F172A;
            padding: 18px;
            text-align: center;
            border-radius: 10px;
            border: 4px solid #0EA5E9;
            margin-bottom: 15px;
        }
        
        .price-label {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .price-amount {
            font-size: 36px;
            font-weight: bold;
        }
        
        .price-status {
            margin-top: 8px;
            font-weight: bold;
            font-size: 14px;
        }
        
        /* QR Code */
        .qr-section {
            text-align: center;
            padding: 20px;
            background: #F9FAFB;
            border: 3px dashed #0EA5E9;
            border-radius: 10px;
            margin-bottom: 15px;
        }
        
        .qr-section img {
            width: 170px;
            height: 170px;
            border: 4px solid #0EA5E9;
            padding: 8px;
            background: white;
            border-radius: 10px;
        }
        
        .qr-text {
            font-size: 12px;
            color: #6B7280;
            margin-top: 10px;
            font-weight: bold;
        }
        
        /* Important Notice */
        .notice {
            background: #FEF3C7;
            border-left: 5px solid #F59E0B;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        
        .notice strong {
            color: #92400E;
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
        }
        
        .notice ul {
            margin-left: 18px;
            font-size: 11px;
            color: #78350F;
            line-height: 1.6;
        }
        
        /* Footer */
        .footer {
            background: #F3F4F6;
            padding: 15px;
            text-align: center;
            border-top: 3px solid #E5E7EB;
            font-size: 10px;
            color: #6B7280;
        }
        
        .footer p {
            margin: 3px 0;
        }
    </style>
</head>
<body>
    <div class="ticket">
        <!-- Header -->
        <div class="header">
            <h1>🚌 KCTRIP</h1>
            <p>Your Trusted Travel Partner | Cameroon Bus Service</p>
            <p style="font-size: 11px; margin-top: 8px;">📞 +237 XXX XXX XXX | 📧 contact@kctrip.com</p>
        </div>
        
        <!-- Ticket Number -->
        <div class="ticket-number">
            TICKET No: {{ $ticketNumber }}
        </div>
        
        <div class="content">
            <!-- ROUTE INFORMATION - VERY VISIBLE -->
            <div class="route-section">
                <div class="route-grid">
                    <!-- DEPARTURE -->
                    <div class="route-col">
                        <div style="background: #E0F2FE; padding: 12px; border-radius: 8px;">
                            <div class="label-small">🚀 DEPARTURE FROM</div>
                            <div class="city-name">{{ $departureCity }}</div>
                            <div class="agency-name">📍 {{ $departureAgency }}</div>
                            <div class="time-info">🕐 {{ $departureTime }}</div>
                        </div>
                    </div>
                    
                    <!-- ARROW -->
                    <div class="route-arrow">→</div>
                    
                    <!-- ARRIVAL -->
                    <div class="route-col">
                        <div style="background: #FFF9E5; padding: 12px; border-radius: 8px;">
                            <div class="label-small">🏁 ARRIVAL AT</div>
                            <div class="city-name">{{ $destinationCity }}</div>
                            <div class="agency-name" style="background: #FDB900; color: #000;">📍 {{ $arrivalAgency }}</div>
                            <div class="time-info">🕐 {{ $arrivalTime }}</div>
                        </div>
                    </div>
                </div>
                
                <!-- DATE AND SEAT -->
                <div class="date-seat-row">
                    <div>
                        <div class="label-small">📅 TRAVEL DATE</div>
                        <div class="value-large">{{ $travelDate }}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="label-small">💺 SEAT NUMBER</div>
                        <div class="seat-number-highlight">{{ $seatNumber }}</div>
                    </div>
                </div>
            </div>
            
            <!-- PASSENGER INFORMATION - COMPLETE -->
            <div class="info-section">
                <div class="section-title">👤 PASSENGER INFORMATION (SECURITY)</div>
                <table class="info-table">
                    <tr>
                        <td>Full Name:</td>
                        <td><strong style="font-size: 14px;">{{ $passengerFirstName }} {{ $passengerLastName }}</strong></td>
                    </tr>
                    <tr>
                        <td>Nationality:</td>
                        <td><strong>{{ $passengerNationality }}</strong></td>
                    </tr>
                    <tr>
                        <td>Gender:</td>
                        <td><strong>{{ $passengerGender }}</strong></td>
                    </tr>
                    <tr>
                        <td>ID Number (CNI):</td>
                        <td><strong style="font-size: 14px; color: #0EA5E9;">{{ $passengerCNI }}</strong></td>
                    </tr>
                    <tr>
                        <td>Phone Number:</td>
                        <td><strong>{{ $passengerPhone }}</strong></td>
                    </tr>
                    <tr>
                        <td>Email Address:</td>
                        <td><strong>{{ $passengerEmail }}</strong></td>
                    </tr>
                </table>
            </div>
            
            <!-- BOOKING DETAILS -->
            <div class="info-section" style="background: #FFF9E5; border-left-color: #FDB900;">
                <div class="section-title" style="color: #F59E0B;">📋 BOOKING DETAILS</div>
                <table class="info-table">
                    <tr>
                        <td>Departure City:</td>
                        <td><strong>{{ $departureCity }}</strong></td>
                    </tr>
                    <tr>
                        <td>Departure Agency:</td>
                        <td><strong style="color: #0EA5E9;">📍 {{ $departureAgency }}</strong></td>
                    </tr>
                    <tr>
                        <td>Arrival City:</td>
                        <td><strong>{{ $destinationCity }}</strong></td>
                    </tr>
                    <tr>
                        <td>Arrival Agency:</td>
                        <td><strong style="color: #FDB900;">📍 {{ $arrivalAgency }}</strong></td>
                    </tr>
                    <tr>
                        <td>Travel Date:</td>
                        <td><strong>{{ $travelDate }}</strong></td>
                    </tr>
                    <tr>
                        <td>Departure Time:</td>
                        <td><strong>{{ $departureTime }}</strong></td>
                    </tr>
                    <tr>
                        <td>Expected Arrival:</td>
                        <td><strong>{{ $arrivalTime }}</strong></td>
                    </tr>
                    <tr>
                        <td>Seat Number:</td>
                        <td><strong style="font-size: 16px; color: #FDB900;">{{ $seatNumber }}</strong></td>
                    </tr>
                    <tr>
                        <td>Bus Type:</td>
                        <td><strong>{{ $busType ?? 'Standard' }}</strong></td>
                    </tr>
                    <tr>
                        <td>Booking Date:</td>
                        <td><strong>{{ \Carbon\Carbon::now()->format('F j, Y \a\t h:i A') }}</strong></td>
                    </tr>
                </table>
            </div>
            
            <!-- PRICE -->
            <div class="price-section">
                <div class="price-label">💰 TOTAL AMOUNT PAID</div>
                <div class="price-amount">{{ number_format($amount, 0, ',', ' ') }} FCFA</div>
                <div class="price-status">✓ PAYMENT CONFIRMED</div>
            </div>
            
            <!-- QR CODE -->
            <div class="qr-section">
                <div style="font-weight: bold; color: #0EA5E9; margin-bottom: 10px; font-size: 14px;">SCAN FOR VERIFICATION</div>
                <img src="data:image/png;base64,{{ $qrCode }}" alt="QR Code">
                <div class="qr-text">Present this QR code at boarding</div>
            </div>
            
            <!-- AGENCY INFO -->
            <div class="info-section">
                <div class="section-title">🏢 TRAVEL AGENCY</div>
                <table class="info-table">
                    <tr>
                        <td>Agency:</td>
                        <td><strong>KCTRIP</strong></td>
                    </tr>
                    <tr>
                        <td>Contact:</td>
                        <td>+237 XXX XXX XXX</td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td>contact@kctrip.com</td>
                    </tr>
                </table>
            </div>
            
            <!-- IMPORTANT NOTICE -->
            <div class="notice">
                <strong>⚠️ IMPORTANT INFORMATION</strong>
                <ul>
                    <li>Arrive at <strong>{{ $departureAgency }}</strong> station at least <strong>30 minutes</strong> before departure</li>
                    <li>Bring a valid ID (CNI, Passport) for verification</li>
                    <li>This ticket is <strong>non-transferable</strong> and valid only for seat <strong>{{ $seatNumber }}</strong></li>
                    <li>Seat assignment cannot be changed after booking</li>
                    <li>Contact customer service for cancellations or modifications</li>
                </ul>
            </div>
        </div>
        
        <!-- FOOTER -->
        <div class="footer">
            <p><strong>KCTRIP</strong> - Your Trusted Travel Partner in Cameroon</p>
            <p>www.kctrip.com | support@kctrip.com | +237 XXX XXX XXX</p>
            <p style="margin-top: 8px;">Issued on {{ \Carbon\Carbon::now()->format('l, F j, Y \a\t h:i A') }}</p>
            <p>This ticket is valid only for the date, time, and journey specified above.</p>
        </div>
    </div>
</body>
</html>
