<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Http;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Log;
class PdfController extends Controller
{
    /**
     * Generate and download ticket PDF
     */
    public function generateTicketPdf($ticketNumber)
    {
        $ticket = Ticket::with([
            'reservation.user',
            'reservation.trip.bus',
            'reservation.trip.departure',
            'reservation.trip.destination',
            'reservation.trip.departureAgency',
            'reservation.trip.arrivalAgency',
            'reservation.payment'
        ])->where('ticket_number', $ticketNumber)->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        // Check authorization
        if (auth()->check()) {
            if ($ticket->reservation->user_id != auth()->id() && auth()->user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
        }

        $reservation = $ticket->reservation;
        $trip = $reservation->trip;

        // Generate QR code using external API as fallback (no PHP extension needed)
        $qrCode = null;
        try {
            $qrValue = url('/api/tickets/'.$ticket->ticket_number);
            // Use external QR code service
            $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrValue);
            $response = Http::timeout(5)->get($qrCodeUrl);
            
            if ($response->successful()) {
                $qrCode = base64_encode($response->body());
            }
        } catch (\Throwable $e) {
            Log::error('QR code generation failed', ['error' => $e->getMessage()]);
        }

        $data = [
            'ticketNumber' => $ticket->ticket_number,
            'passengerFirstName' => $reservation->passenger_first_name ?? explode(' ', $reservation->passenger_name)[0] ?? 'N/A',
            'passengerLastName' => $reservation->passenger_last_name ?? explode(' ', $reservation->passenger_name)[1] ?? 'N/A',
            'passengerNationality' => $reservation->passenger_nationality ?? 'N/A',
            'passengerGender' => $reservation->passenger_gender === 'M' ? 'Male' : ($reservation->passenger_gender === 'F' ? 'Female' : 'N/A'),
            'passengerCNI' => $reservation->passenger_cni ?? 'N/A',
            'passengerPhone' => $reservation->passenger_phone ?? 'N/A',
            'passengerEmail' => $reservation->passenger_email ?? 'N/A',
            'departureCity' => $trip->departure->city_name,
            'destinationCity' => $trip->destination->city_name,
            'departureAgency' => $trip->departureAgency->neighborhood ?? 'Main Station',
            'arrivalAgency' => $trip->arrivalAgency->neighborhood ?? 'Main Station',
            'travelDate' => \Carbon\Carbon::parse($trip->departure_date)->format('l, F j, Y'),
            'departureTime' => \Carbon\Carbon::parse($trip->departure_time)->format('h:i A'),
            'arrivalTime' => \Carbon\Carbon::parse($trip->arrival_time)->format('h:i A'),
            'seatNumber' => $reservation->selected_seat,
            'busType' => $trip->bus->type ?? 'Standard',
            'busName' => $trip->bus->bus_name ?? 'N/A',
            'busMatricule' => $trip->bus->matricule ?? 'N/A',
            'amount' => $reservation->payment->amount ?? $trip->price ?? 0,
            'paymentMethod' => $reservation->payment->method ?? 'N/A',
            'transactionRef' => $reservation->payment->transaction_reference ?? 'N/A',
            'qrCode' => $qrCode,
        ];

        try {
            $pdf = Pdf::loadView('tickets.pdf_professional', $data);
            // Enable remote assets
            if (method_exists($pdf, 'setOption')) {
                $pdf->setOption('isRemoteEnabled', true);
            }
            // Set paper size to A4
            $pdf->setPaper('A4', 'portrait');
            return $pdf->download('KCTrip_Ticket_' . $ticketNumber . '.pdf');
        } catch (\Throwable $e) {
            Log::error('PDF generation failed', [
                'ticket' => $ticketNumber,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }
}
