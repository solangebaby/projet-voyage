<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket {{ $ticket->ticket_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #F97316;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #F97316;
            margin: 0;
            font-size: 32px;
        }
        .ticket-number {
            background: #F97316;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 10px;
            font-size: 18px;
            font-weight: bold;
        }
        .section {
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #F97316;
            margin-bottom: 15px;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 8px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
        }
        .info-label {
            font-weight: bold;
            color: #6b7280;
        }
        .info-value {
            color: #111827;
        }
        .trip-route {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            color: #1f2937;
        }
        .arrow {
            color: #F97316;
            margin: 0 15px;
        }
        .qr-code {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
        }
        .status-valid {
            background: #10b981;
            color: white;
        }
        table {
            width: 100%;
        }
        .seat-highlight {
            background: #fef3c7;
            padding: 5px 10px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 18px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚌 JADOO TRAVELS</h1>
        <p style="margin: 5px 0; color: #6b7280;">Bus Ticket Reservation</p>
        <div class="ticket-number">{{ $ticket->ticket_number }}</div>
    </div>

    <div class="trip-route">
        {{ $departure->city_name }} 
        <span class="arrow">→</span> 
        {{ $destination->city_name }}
    </div>

    <div class="section">
        <div class="section-title">Passenger Information</div>
        <table>
            <tr>
                <td class="info-label">Full Name:</td>
                <td class="info-value">{{ $passenger->first_name }} {{ $passenger->name }}</td>
            </tr>
            <tr>
                <td class="info-label">Email:</td>
                <td class="info-value">{{ $passenger->email }}</td>
            </tr>
            <tr>
                <td class="info-label">Phone:</td>
                <td class="info-value">{{ $passenger->phone ?? 'N/A' }}</td>
            </tr>
            @if($passenger->cni_number)
            <tr>
                <td class="info-label">CNI Number:</td>
                <td class="info-value">{{ $passenger->cni_number }}</td>
            </tr>
            @endif
        </table>
    </div>

    <div class="section">
        <div class="section-title">Trip Details</div>
        <table>
            <tr>
                <td class="info-label">Bus Name:</td>
                <td class="info-value">{{ $bus->bus_name }}</td>
            </tr>
            <tr>
                <td class="info-label">Bus Type:</td>
                <td class="info-value">{{ ucfirst($bus->type) }}</td>
            </tr>
            <tr>
                <td class="info-label">Departure Date:</td>
                <td class="info-value">{{ \Carbon\Carbon::parse($trip->departure_date)->format('F d, Y') }}</td>
            </tr>
            <tr>
                <td class="info-label">Departure Time:</td>
                <td class="info-value">{{ \Carbon\Carbon::parse($trip->departure_time)->format('h:i A') }}</td>
            </tr>
            <tr>
                <td class="info-label">Arrival Time:</td>
                <td class="info-value">{{ \Carbon\Carbon::parse($trip->arrival_time)->format('h:i A') }}</td>
            </tr>
            <tr>
                <td class="info-label">Seat Number:</td>
                <td class="info-value"><span class="seat-highlight">{{ $reservation->selected_seat }}</span></td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Payment Information</div>
        <table>
            <tr>
                <td class="info-label">Payment Reference:</td>
                <td class="info-value">{{ $payment->reference }}</td>
            </tr>
            <tr>
                <td class="info-label">Amount Paid:</td>
                <td class="info-value">{{ number_format($payment->amount, 0) }} {{ $payment->currency }}</td>
            </tr>
            <tr>
                <td class="info-label">Payment Method:</td>
                <td class="info-value">{{ $payment->method }}</td>
            </tr>
            <tr>
                <td class="info-label">Payment Date:</td>
                <td class="info-value">{{ \Carbon\Carbon::parse($payment->completed_at)->format('F d, Y h:i A') }}</td>
            </tr>
        </table>
    </div>

    <div class="qr-code">
        <img src="data:image/png;base64,{{ base64_encode(QrCode::format('png')->size(150)->generate($ticket->ticket_number)) }}" alt="QR Code">
        <p style="margin-top: 10px; color: #6b7280; font-size: 12px;">Scan this QR code for verification</p>
    </div>

    <div style="text-align: center; margin: 20px 0;">
        <span class="status-badge status-valid">{{ strtoupper($ticket->status) }}</span>
    </div>

    <div class="footer">
        <p><strong>Important Information:</strong></p>
        <p>Please arrive at the departure point at least 30 minutes before departure time.</p>
        <p>This ticket is non-transferable and must be presented along with a valid ID.</p>
        <p>For any inquiries, please contact us at: support@jadootravels.com | +237 XXX XXX XXX</p>
        <p style="margin-top: 15px;">© {{ date('Y') }} Jadoo Travels. All rights reserved.</p>
    </div>
</body>
</html>
