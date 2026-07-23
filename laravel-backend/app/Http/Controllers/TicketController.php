<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Mail\TicketConfirmation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
    /**
     * Get ticket by ticket number (public)
     */
    public function showByNumber(string $ticketNumber)
    {
        $ticket = Ticket::with([
            'reservation.user',
            'reservation.payment',
            'reservation.trip.bus',
            'reservation.trip.departure',
            'reservation.trip.destination',
            'reservation.trip.departureAgency',
            'reservation.trip.arrivalAgency'
        ])->where('ticket_number', $ticketNumber)->first();

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket introuvable'], 404);
        }

        return response()->json(['success' => true, 'data' => $ticket]);
    }

    /**
     * Public scan endpoint — for QR code verification
     */
    public function showForScan(string $ticketNumber)
    {
        $ticket = Ticket::with([
            'reservation.user',
            'reservation.payment',
            'reservation.trip.bus',
            'reservation.trip.departure',
            'reservation.trip.destination',
            'reservation.trip.departureAgency',
            'reservation.trip.arrivalAgency'
        ])->where('ticket_number', $ticketNumber)->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket introuvable. Ce QR code est invalide ou expiré.'
            ], 404);
        }

        $reservation = $ticket->reservation;
        $trip        = $reservation->trip ?? null;

        return response()->json([
            'success' => true,
            'data' => [
                'ticket_number'  => $ticket->ticket_number,
                'ticket_status'  => $ticket->status,
                'ticket_type'    => $ticket->ticket_type,
                'downloaded_at'  => $ticket->downloaded_at,
                'passenger' => [
                    'first_name'  => $reservation->passenger_first_name,
                    'last_name'   => $reservation->passenger_last_name,
                    'phone'       => $reservation->passenger_phone,
                    'email'       => $reservation->passenger_email,
                    'gender'      => $reservation->passenger_gender,
                    'cni'         => $reservation->passenger_cni,
                    'nationality' => $reservation->passenger_nationality,
                ],
                'reservation' => [
                    'id'            => $reservation->id,
                    'selected_seat' => $reservation->selected_seat,
                    'status'        => $reservation->status,
                    'created_at'    => $reservation->created_at,
                ],
                'trip' => $trip ? [
                    'id'             => $trip->id,
                    'departure_city' => $trip->departure->city_name ?? '',
                    'arrival_city'   => $trip->destination->city_name ?? '',
                    'departure_date' => $trip->departure_date,
                    'departure_time' => $trip->departure_time,
                    'arrival_time'   => $trip->arrival_time,
                    'price'          => $trip->price,
                    'bus_name'       => $trip->bus->bus_name ?? '',
                    'bus_type'       => $trip->bus->type ?? '',
                    'agency_name'    => $trip->departureAgency->agency_name ?? '',
                    'agency_address' => $trip->departureAgency->address ?? '',
                ] : null,
                'payment' => $reservation->payment ? [
                    'method'       => $reservation->payment->method,
                    'amount'       => $reservation->payment->amount,
                    'status'       => $reservation->payment->status,
                    'completed_at' => $reservation->payment->completed_at,
                ] : null,
            ]
        ]);
    }

    /**
     * Send ticket by email
     */
    public function sendByEmail(Request $request, string $ticketNumber)
    {
        $ticket = Ticket::with([
            'reservation.payment',
            'reservation.trip.bus',
            'reservation.trip.departure',
            'reservation.trip.destination',
            'reservation.trip.departureAgency',
            'reservation.trip.arrivalAgency'
        ])->where('ticket_number', $ticketNumber)->first();

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket introuvable'], 404);
        }

        $email = $request->input('email') ?? $ticket->reservation->passenger_email;

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'success' => false,
                'message' => 'Adresse email invalide ou introuvable'
            ], 422);
        }

        try {
            Mail::to($email)->send(new TicketConfirmation($ticket));
            return response()->json([
                'success' => true,
                'message' => "Billet envoyé avec succès à {$email}"
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send ticket email', [
                'ticket' => $ticketNumber,
                'email'  => $email,
                'error'  => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tickets for a user
     */
    public function getUserTickets(string $userId)
    {
        if ($userId != request()->user()->id && request()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], 403);
        }

        $tickets = Ticket::with([
            'reservation.trip.bus',
            'reservation.trip.departure',
            'reservation.trip.destination',
            'reservation.trip.departureAgency',
            'reservation.trip.arrivalAgency'
        ])
        ->whereHas('reservation', fn($q) => $q->where('user_id', $userId))
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json(['success' => true, 'data' => $tickets]);
    }

    /**
     * Mark ticket as downloaded
     */
    public function markAsDownloaded(string $ticketNumber)
    {
        $ticket = Ticket::where('ticket_number', $ticketNumber)->first();

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket introuvable'], 404);
        }

        if (!$ticket->downloaded_at) {
            $ticket->downloaded_at = now();
            $ticket->save();
        }

        return response()->json(['success' => true, 'message' => 'Ticket marqué comme téléchargé', 'data' => $ticket]);
    }
   
 
}
