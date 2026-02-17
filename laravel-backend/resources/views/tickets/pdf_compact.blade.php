<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket {{ $ticket->ticket_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 10px; color: #000; }
        .ticket { width: 100%; padding: 10px; border: 2px dashed #000; }
        .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 8px; }
        .header h1 { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
        .ticket-no { font-size: 8px; font-weight: bold; }
        .route { text-align: center; font-size: 12px; font-weight: bold; margin: 8px 0; padding: 6px; background: #f0f0f0; border: 1px solid #000; }
        .route .arrow { margin: 0 5px; }
        .section { margin: 6px 0; }
        .section-title { font-size: 9px; font-weight: bold; border-bottom: 1px dotted #000; margin-bottom: 3px; }
        .row { display: table; width: 100%; margin: 2px 0; }
        .label { display: table-cell; width: 40%; font-size: 9px; font-weight: bold; }
        .value { display: table-cell; font-size: 9px; }
        .qr { text-align: center; margin: 8px 0; }
        .qr img { width: 100px; height: 100px; }
        .footer { text-align: center; font-size: 7px; margin-top: 8px; border-top: 1px solid #000; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="ticket">
        <!-- Header -->
        <div class="header">
            <h1>KCTRIP</h1>
            <div class="ticket-no">{{ $ticket->ticket_number }}</div>
        </div>

        <!-- Route -->
        <div class="route">
            {{ optional($departure)->city_name ?? '—' }}
            <span class="arrow">→</span>
            {{ optional($destination)->city_name ?? '—' }}
        </div>

        <!-- Passenger Info -->
        <div class="section">
            <div class="section-title">PASSENGER</div>
            <div class="row">
                <span class="label">Name:</span>
                <span class="value">{{ $reservation->passenger_name ?? 'N/A' }}</span>
            </div>
            <div class="row">
                <span class="label">Phone:</span>
                <span class="value">{{ $reservation->passenger_phone ?? 'N/A' }}</span>
            </div>
        </div>

        <!-- Trip Info -->
        <div class="section">
            <div class="section-title">TRIP</div>
            <div class="row">
                <span class="label">Date:</span>
                <span class="value">{{ $trip->departure_date ? \Carbon\Carbon::parse($trip->departure_date)->format('m/d/Y') : 'N/A' }}</span>
            </div>
            <div class="row">
                <span class="label">Departure:</span>
                <span class="value">{{ $trip->departure_time ? \Carbon\Carbon::parse($trip->departure_time)->format('H:i') : 'N/A' }}</span>
            </div>
            <div class="row">
                <span class="label">Arrival:</span>
                <span class="value">{{ $trip->arrival_time ? \Carbon\Carbon::parse($trip->arrival_time)->format('H:i') : 'N/A' }}</span>
            </div>
            <div class="row">
                <span class="label">Seat:</span>
                <span class="value">{{ $reservation->selected_seat ?? 'N/A' }}</span>
            </div>
        </div>

        <!-- Bus Info -->
        <div class="section">
            <div class="section-title">BUS</div>
            <div class="row">
                <span class="label">Bus:</span>
                <span class="value">{{ $bus->bus_name ?? $bus->brand ?? 'N/A' }}</span>
            </div>
            <div class="row">
                <span class="label">Type:</span>
                <span class="value">{{ isset($bus->type) ? ucfirst($bus->type) : 'N/A' }}</span>
            </div>
        </div>

        <!-- Payment Info -->
        <div class="section">
            <div class="section-title">PAYMENT</div>
            <div class="row">
                <span class="label">Amount:</span>
                <span class="value">{{ number_format($payment->amount ?? 0, 0) }} {{ $payment->currency ?? 'XAF' }}</span>
            </div>
            <div class="row">
                <span class="label">Method:</span>
                <span class="value">{{ $payment->method ?? 'N/A' }}</span>
            </div>
        </div>

        <!-- QR Code -->
        <div class="qr">
            @if (!empty($qr_png))
                <img src="data:image/png;base64,{{ $qr_png }}" alt="QR Code" />
            @else
                @php
                    $qrAvailable = class_exists(\SimpleSoftwareIO\QrCode\Facades\QrCode::class);
                    $qrValue = url('/api/tickets/'.$ticket->ticket_number);
                @endphp
                @if ($qrAvailable)
                    {!! \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(100)->margin(1)->generate($qrValue) !!}
                @else
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ urlencode($qrValue) }}" alt="QR Code" width="100" height="100" />
                @endif
            @endif
        </div>

        <!-- Footer -->
        <div class="footer">
            Have a safe trip! • www.jadoo-travels.com
        </div>
    </div>
</body>
</html>
