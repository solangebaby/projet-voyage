<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

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

        $data = [
            'ticket' => $ticket,
            'reservation' => $ticket->reservation,
            'trip' => $ticket->reservation->trip,
            'bus' => $ticket->reservation->trip->bus,
            'passenger' => $ticket->reservation->user,
            'departure' => $ticket->reservation->trip->departure,
            'destination' => $ticket->reservation->trip->destination,
            'payment' => $ticket->reservation->payment,
        ];

        $pdf = Pdf::loadView('tickets.pdf', $data);
        
        return $pdf->download('ticket-' . $ticketNumber . '.pdf');
    }
}
