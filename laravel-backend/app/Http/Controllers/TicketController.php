<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Get ticket by ticket number (public endpoint for verification)
     */
    public function showByNumber(string $ticketNumber)
    {
        $ticket = Ticket::with([
            'reservation.user',
            'reservation.trip.bus',
            'reservation.trip.departure',
            'reservation.trip.destination'
        ])->where('ticket_number', $ticketNumber)->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket
        ]);
    }

    /**
     * Get all tickets for a user
     */
    public function getUserTickets(string $userId)
    {
        // Check authorization
        if ($userId != request()->user()->id && request()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $tickets = Ticket::with([
            'reservation.trip.bus',
            'reservation.trip.departure',
            'reservation.trip.destination'
        ])
        ->whereHas('reservation', function($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $tickets
        ]);
    }
}
