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
            'ticket_type' => 'required|in:standard,vip',
            'passenger_name' => 'nullable|string',
            'passenger_first_name' => 'required|string|regex:/^[a-zA-ZÀ-ÿ\s]+$/u',
            'passenger_last_name' => 'required|string|regex:/^[a-zA-ZÀ-ÿ\s]+$/u',
            'passenger_email' => 'required|email',
            'passenger_phone' => 'required|string',
            'passenger_gender' => 'required|in:M,F',
            'passenger_cni' => 'required|string|regex:/^[A-Z]{2}[0-9]{8}$/',
        ], [
            'passenger_first_name.required' => 'Le prénom est obligatoire',
            'passenger_first_name.regex' => 'Le prénom doit contenir uniquement des lettres alphabétiques',
            'passenger_last_name.required' => 'Le nom est obligatoire',
            'passenger_last_name.regex' => 'Le nom doit contenir uniquement des lettres alphabétiques',
            'passenger_gender.required' => 'Le sexe est obligatoire',
            'passenger_gender.in' => 'Le sexe doit être M (Masculin) ou F (Féminin)',
            'passenger_cni.required' => 'Le numéro de CNI est obligatoire',
            'passenger_cni.regex' => 'Le format du numéro de CNI camerounais est invalide (2 lettres majuscules + 8 chiffres, ex: AB12345678)',
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
                $occupiedSeats = is_string($trip->occupied_seats) ? json_decode($trip->occupied_seats, true) : $trip->occupied_seats;
                $occupiedSeats = $occupiedSeats ?? [];
                
                if (in_array($request->selected_seat, $occupiedSeats)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce siège est déjà occupé'
                    ], 400);
                }

                // Check if trip is still active
                if ($trip->status !== 'active') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce voyage n\'est pas disponible'
                    ], 400);
                }

                // Get user_id (authenticated user or null for guest booking)
                $userId = null;
                if ($request->user()) {
                    $userId = $request->user()->id;
                }

                // Create reservation
                $reservation = Reservation::create([
                    'user_id' => $userId,
                    'trip_id' => $request->trip_id,
                    'selected_seat' => $request->selected_seat,
                    'ticket_type' => $request->ticket_type,
                    'passenger_name' => $request->passenger_first_name . ' ' . $request->passenger_last_name,
                    'passenger_first_name' => $request->passenger_first_name,
                    'passenger_last_name' => $request->passenger_last_name,
                    'passenger_email' => $request->passenger_email,
                    'passenger_phone' => $request->passenger_phone,
                    'passenger_gender' => $request->passenger_gender,
                    'passenger_cni' => $request->passenger_cni,
                    'status' => 'pending',
                    'expires_at' => now()->addMinutes(15), // 15 minutes to complete payment
                ]);

                // Update trip occupied seats
                $occupiedSeats[] = $request->selected_seat;
                $trip->occupied_seats = json_encode($occupiedSeats);
                // Available seats is now calculated dynamically from reservations
                // No need to update a field

                return response()->json([
                    'success' => true,
                    'message' => __('messages.reservation_created'),
                    'data' => $reservation->load(['trip.bus', 'trip.departure', 'trip.destination'])
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de la création de réservation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific reservation
     */
    /**
     * Get all reservations (or user's reservations)
     */
    public function index(Request $request)
    {
        // Check if admin - show all reservations
        if ($request->user()->role === 'admin') {
            $query = Reservation::with(['trip.bus', 'trip.departure', 'trip.destination', 'trip.departureAgency', 'trip.arrivalAgency', 'user', 'payment']);
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by date
            if ($request->has('date')) {
                $query->whereHas('trip', function($q) use ($request) {
                    $q->where('departure_date', $request->date);
                });
            }
            
            $reservations = $query->orderBy('created_at', 'desc')->get();
        } else {
            // Show only user's reservations
            $reservations = Reservation::with(['trip.bus', 'trip.departure', 'trip.destination', 'trip.departureAgency', 'trip.arrivalAgency', 'user', 'payment'])
                ->where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);
    }
    
    /**
     * Extend payment delay for a reservation (Admin only)
     */
    public function extendDelay($id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => __('messages.reservation_not_found')
            ], 404);
        }

        if ($reservation->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Seules les réservations en attente peuvent bénéficier d\'un délai'
            ], 400);
        }

        // Extend by 2 hours
        $reservation->expires_at = now()->addHours(2);
        $reservation->save();

        return response()->json([
            'success' => true,
            'message' => 'Délai de paiement accordé (+2 heures)',
            'data' => $reservation
        ]);
    }

    public function show(string $id)
    {
        $reservation = Reservation::with([
            'trip.bus', 
            'trip.departure', 
            'trip.destination',
            'trip.departureAgency',
            'trip.arrivalAgency',
            'payment',
            'ticket'
        ])->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found'
            ], 404);
        }

        // Check authorization (allow if user owns it, is admin, or is guest booking)
        if (request()->user()) {
            if ($reservation->user_id && $reservation->user_id !== request()->user()->id && request()->user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
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
            'trip.departureAgency',
            'trip.arrivalAgency',
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
                // Available seats is now calculated dynamically from reservations
                // No need to update a field

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
