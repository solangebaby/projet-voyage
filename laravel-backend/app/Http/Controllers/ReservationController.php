<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    /**
     * Store a new reservation
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'trip_id' => 'required|exists:trips,id',
            'selected_seat' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request) {
                $trip = Trip::lockForUpdate()->find($request->trip_id);

                // Check if seat is already occupied
                $occupiedSeats = $trip->occupied_seats ?? [];
                if (in_array($request->selected_seat, $occupiedSeats)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Seat is already occupied'
                    ], 400);
                }

                // Check if trip is still active
                if ($trip->status !== 'active') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Trip is not active'
                    ], 400);
                }

                // Create reservation
                $reservation = Reservation::create([
                    'user_id' => $request->user()->id,
                    'trip_id' => $request->trip_id,
                    'selected_seat' => $request->selected_seat,
                    'status' => 'pending',
                    'expires_at' => now()->addMinutes(15), // 15 minutes to complete payment
                ]);

                // Update trip occupied seats
                $occupiedSeats[] = $request->selected_seat;
                $trip->occupied_seats = $occupiedSeats;
                $trip->available_seats = $trip->available_seats - 1;
                $trip->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Reservation created successfully',
                    'data' => $reservation->load(['trip.bus', 'trip.departure', 'trip.destination'])
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create reservation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific reservation
     */
    public function show(string $id)
    {
        $reservation = Reservation::with([
            'trip.bus', 
            'trip.departure', 
            'trip.destination',
            'payment',
            'ticket'
        ])->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found'
            ], 404);
        }

        // Check authorization
        if ($reservation->user_id !== request()->user()->id && request()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $reservation
        ]);
    }

    /**
     * Get all reservations for a user
     */
    public function getUserReservations(string $userId)
    {
        // Check authorization
        if ($userId != request()->user()->id && request()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $reservations = Reservation::with([
            'trip.bus',
            'trip.departure',
            'trip.destination',
            'payment',
            'ticket'
        ])
        ->where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);
    }

    /**
     * Cancel a reservation
     */
    public function cancel(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $reservation = Reservation::lockForUpdate()->find($id);

                if (!$reservation) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Reservation not found'
                    ], 404);
                }

                // Check authorization
                if ($reservation->user_id !== request()->user()->id && request()->user()->role !== 'admin') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized'
                    ], 403);
                }

                // Check if already cancelled
                if ($reservation->status === 'cancelled') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Reservation is already cancelled'
                    ], 400);
                }

                // Cancel reservation
                $reservation->status = 'cancelled';
                $reservation->cancelled_at = now();
                $reservation->save();

                // Free up the seat
                $trip = Trip::find($reservation->trip_id);
                $occupiedSeats = $trip->occupied_seats ?? [];
                $occupiedSeats = array_values(array_diff($occupiedSeats, [$reservation->selected_seat]));
                $trip->occupied_seats = $occupiedSeats;
                $trip->available_seats = $trip->available_seats + 1;
                $trip->save();

                // Cancel ticket if exists
                if ($reservation->ticket) {
                    $reservation->ticket->update(['status' => 'cancelled']);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Reservation cancelled successfully',
                    'data' => $reservation
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel reservation: ' . $e->getMessage()
            ], 500);
        }
    }
}
