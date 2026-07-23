<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    /**
     * Store a new reservation (guest or authenticated)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'trip_id'               => 'required|exists:trips,id',
            'selected_seat'         => 'required|string',
            'ticket_type'           => 'nullable|in:standard,vip',
            'passenger_first_name'  => 'required|string|max:100',
            'passenger_last_name'   => 'required|string|max:100',
            'passenger_email'       => 'required|email|max:191',
            'passenger_phone'       => 'required|string|max:20',
            'passenger_gender'      => 'required|in:M,F',
            'passenger_cni'         => 'required|string|max:50',
            'passenger_nationality' => 'nullable|string|max:100',
            'payment_type'          => 'nullable|in:counter,online',
        ], [
            'trip_id.required'              => 'Le trajet est obligatoire',
            'trip_id.exists'                => 'Ce trajet n\'existe pas',
            'selected_seat.required'        => 'Le siège est obligatoire',
            'passenger_first_name.required' => 'Le prénom est obligatoire',
            'passenger_last_name.required'  => 'Le nom est obligatoire',
            'passenger_email.required'      => 'L\'email est obligatoire',
            'passenger_email.email'         => 'L\'email est invalide',
            'passenger_phone.required'      => 'Le téléphone est obligatoire',
            'passenger_gender.required'     => 'Le sexe est obligatoire',
            'passenger_gender.in'           => 'Le sexe doit être M ou F',
            'passenger_cni.required'        => 'Le numéro CNI est obligatoire',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request) {
                $trip = Trip::lockForUpdate()->find($request->trip_id);

                // Double-check: verify seat not taken by any active reservation in DB
                $seatConflict = \App\Models\Reservation::where('trip_id', $request->trip_id)
                    ->where('selected_seat', $request->selected_seat)
                    ->whereNotIn('status', ['cancelled'])
                    ->lockForUpdate()
                    ->exists();

                if ($seatConflict) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce siège est déjà réservé. Veuillez en choisir un autre.'
                    ], 400);
                }

                // Check seat availability
                $occupiedSeats = is_string($trip->occupied_seats)
                    ? json_decode($trip->occupied_seats, true)
                    : ($trip->occupied_seats ?? []);

                if (in_array($request->selected_seat, $occupiedSeats)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce siège est déjà occupé. Veuillez en choisir un autre.'
                    ], 400);
                }

                // Check trip status
                if ($trip->status !== 'active') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce voyage n\'est plus disponible.'
                    ], 400);
                }

                // Determine reservation status
                $isCounter  = $request->payment_type === 'counter';
                $status     = $isCounter ? 'reserved_at_counter' : 'pending';
                $expiresAt  = $isCounter ? now()->addHours(24) : now()->addMinutes(15);
                $ticketType = $request->ticket_type ?? ($trip->bus?->type ?? 'standard');

                // Get authenticated user if any
                $userId = $request->user()?->id;

                // Create reservation
                $reservation = Reservation::create([
                    'user_id'               => $userId,
                    'trip_id'               => $request->trip_id,
                    'selected_seat'         => $request->selected_seat,
                    'ticket_type'           => $ticketType,
                    'passenger_name'        => $request->passenger_first_name . ' ' . $request->passenger_last_name,
                    'passenger_first_name'  => $request->passenger_first_name,
                    'passenger_last_name'   => $request->passenger_last_name,
                    'passenger_email'       => $request->passenger_email,
                    'passenger_phone'       => $request->passenger_phone,
                    'passenger_gender'      => $request->passenger_gender,
                    'passenger_cni'         => $request->passenger_cni,
                    'passenger_nationality' => $request->passenger_nationality,
                    'status'                => $status,
                    'expires_at'            => $expiresAt,
                ]);

                // Mark seat as occupied
                $occupiedSeats[] = $request->selected_seat;
                $trip->occupied_seats = json_encode(array_values($occupiedSeats));
                $trip->save();

                return response()->json([
                    'success' => true,
                    'message' => $isCounter
                        ? 'Réservation créée. Rendez-vous à l\'agence pour payer.'
                        : 'Réservation créée. Procédez au paiement.',
                    'data' => $reservation->load(['trip.bus', 'trip.departure', 'trip.destination'])
                ], 201);
            });

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de la réservation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all reservations (admin) or user's reservations
     */
    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            $query = Reservation::with([
                'trip.bus', 'trip.departure', 'trip.destination',
                'trip.departureAgency', 'trip.arrivalAgency', 'user', 'payment'
            ]);

            if ($request->filled('status')) $query->where('status', $request->status);
            if ($request->filled('date')) {
                $query->whereHas('trip', fn($q) => $q->where('departure_date', $request->date));
            }
            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function($q) use ($s) {
                    $q->where('passenger_first_name', 'like', "%$s%")
                      ->orWhere('passenger_last_name',  'like', "%$s%")
                      ->orWhere('passenger_phone',      'like', "%$s%")
                      ->orWhere('selected_seat',        'like', "%$s%");
                });
            }

            $reservations = $query->orderBy('created_at', 'desc')->paginate(20);
        } else {
            $reservations = Reservation::with([
                'trip.bus', 'trip.departure', 'trip.destination',
                'trip.departureAgency', 'trip.arrivalAgency', 'payment', 'ticket'
            ])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        }

        return response()->json(['success' => true, 'data' => $reservations]);
    }

    /**
     * Get a specific reservation
     */
    public function show(string $id)
    {
        $reservation = Reservation::with([
            'trip.bus', 'trip.departure', 'trip.destination',
            'trip.departureAgency', 'trip.arrivalAgency',
            'payment', 'ticket', 'user'
        ])->find($id);

        if (!$reservation) {
            return response()->json(['success' => false, 'message' => 'Réservation introuvable'], 404);
        }

       // AVANT
if (request()->user()) {
    $user = request()->user();
    if ($reservation->user_id && $reservation->user_id !== $user->id && $user->role !== 'admin') {
        return response()->json(['success' => false, 'message' => 'Accès non autorisé'], 403);
    }
}

// APRÈS — on laisse passer si pas connecté
if (request()->user() && $reservation->user_id) {
    $user = request()->user();
    if ($reservation->user_id !== $user->id && $user->role !== 'admin') {
        return response()->json(['success' => false, 'message' => 'Accès non autorisé'], 403);
    }
}

        return response()->json(['success' => true, 'data' => $reservation]);
    }

    /**
     * Get all reservations for a specific user
     */
    public function getUserReservations(string $userId)
    {
        if ($userId != request()->user()->id && request()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], 403);
        }

        $reservations = Reservation::with([
            'trip.bus', 'trip.departure', 'trip.destination',
            'trip.departureAgency', 'trip.arrivalAgency', 'payment', 'ticket'
        ])
        ->where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json(['success' => true, 'data' => $reservations]);
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
                    return response()->json(['success' => false, 'message' => 'Réservation introuvable'], 404);
                }

                $user = request()->user();
                if ($reservation->user_id !== $user->id && $user->role !== 'admin') {
                    return response()->json(['success' => false, 'message' => 'Accès non autorisé'], 403);
                }

                if ($reservation->status === 'cancelled') {
                    return response()->json(['success' => false, 'message' => 'Réservation déjà annulée'], 400);
                }

                $reservation->status       = 'cancelled';
                $reservation->cancelled_at = now();
                $reservation->save();

                // Free up the seat
                $trip = Trip::find($reservation->trip_id);
                if ($trip) {
                    $occupied = is_string($trip->occupied_seats)
                        ? json_decode($trip->occupied_seats, true)
                        : ($trip->occupied_seats ?? []);
                    $occupied = array_values(array_diff($occupied, [$reservation->selected_seat]));
                    $trip->occupied_seats = json_encode($occupied);
                    $trip->save();
                }

                // Cancel ticket if exists
                if ($reservation->ticket) {
                    $reservation->ticket->update(['status' => 'cancelled']);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Réservation annulée avec succès',
                    'data'    => $reservation
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de l\'annulation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Extend payment delay (Admin only)
     */
   public function extendDelay($id)
{
    $reservation = Reservation::findOrFail($id);
    
    // On vérifie si la réservation est bien en attente
    if ($reservation->status !== 'pending') {
        return response()->json(['message' => 'Impossible de prolonger une réservation déjà traitée'], 400);
    }

    // On ajoute 2 heures à la date d'expiration (si tu as une colonne expires_at)
    // Sinon, on met simplement à jour le timestamp updated_at pour donner du répit
    if (isset($reservation->expires_at)) {
        $reservation->expires_at = \Carbon\Carbon::parse($reservation->expires_at)->addHours(2);
    }
    
    $reservation->save();

    return response()->json([
        'success' => true,
        'message' => 'Délai prolongé de 2 heures avec succès'
    ]);
}

    /**
     * Alias for destroy
     */
    public function destroy(string $id)
    {
        return $this->cancel($id);
    }
       public function storeBulk(Request $request)
{
    $request->validate([
        'trip_id'              => 'required|integer',
        'selected_seats'       => 'required|array|min:1',
        'selected_seats.*'     => 'required|string',
        'passenger_first_name' => 'required|string',
        'passenger_last_name'  => 'required|string',
        'passenger_email'      => 'required|email',
        'passenger_phone'      => 'required|string',
        'passenger_gender'     => 'required|string',
        'passenger_cni'        => 'required|string',
    ]);

    $reservations = [];
    $tickets      = [];

    foreach ($request->selected_seats as $seat) {
        $reservation = Reservation::create([
            'trip_id'              => $request->trip_id,
            'selected_seat'        => $seat,
            'passenger_first_name' => $request->passenger_first_name,
            'passenger_last_name'  => $request->passenger_last_name,
            'passenger_email'      => $request->passenger_email,
            'passenger_phone'      => $request->passenger_phone,
            'passenger_gender'     => $request->passenger_gender,
            'passenger_cni'        => $request->passenger_cni,
            'user_id'              => auth()->id(),
            'status'               => 'pending',
        ]);

        $ticket = Ticket::create([
            'reservation_id' => $reservation->id,
            'ticket_number'  => 'TKT-' . strtoupper(uniqid()),
            'status'         => 'valid',
            'ticket_type'    => $reservation->trip->bus->type ?? 'standard',
        ]);

        $reservations[] = $reservation->load([
            'trip.bus',
            'trip.departure',
            'trip.destination',
            'trip.departureAgency',
        ]);
        $tickets[] = $ticket->load('reservation');
    }

    return response()->json([
        'success'      => true,
        'reservations' => $reservations,
        'tickets'      => $tickets,
    ]);
}
public function agencyReservations(Request $request)
{
    $agency = $request->user()->agency;
    
    if (!$agency) {
        return response()->json(['error' => 'Agency not found'], 404);
    }

    $limit = $request->get('limit', 20);
    
    $reservations = \App\Models\Reservation::whereHas('trip', function($q) use ($agency) {
            $q->where('agency_id', $agency->id);
        })
        ->with(['trip'])
        ->orderBy('created_at', 'desc')
        ->limit($limit)
        ->get();

    return response()->json(['data' => $reservations]);
}
    
}
