<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Trip;
use App\Models\Bus;
use App\Models\Destination;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AgencyTripController extends Controller
{
    private function getAgency(): ?Agency
    {
        return Agency::where('user_id', Auth::id())->first();
    }

    /**
     * List agency's own trips
     */
    public function index(Request $request)
    {
        $agency = $this->getAgency();
        if (!$agency) return response()->json(['message' => 'Agence introuvable'], 404);

        $query = Trip::with(['bus', 'departure', 'destination', 'departureAgency', 'arrivalAgency'])
            ->where('agency_id', $agency->id);

        if ($request->filled('validation_status')) $query->where('validation_status', $request->validation_status);
        if ($request->filled('date')) $query->whereDate('departure_date', $request->date);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->whereHas('departure', fn($q) => $q->where('city_name', 'like', "%$s%"))
                  ->orWhereHas('destination', fn($q) => $q->where('city_name', 'like', "%$s%"));
        }

        $trips = $query->orderBy('departure_date', 'desc')->paginate(20);

        return response()->json(['success' => true, 'data' => $trips]);
    }

    /**
     * Create a new trip (saved as draft by default)
     */
    public function store(Request $request)
    {
        $agency = $this->getAgency();
        if (!$agency) return response()->json(['message' => 'Agence introuvable'], 404);

        $validator = Validator::make($request->all(), [
            'bus_id'               => 'required|exists:buses,id',
            'departure_id'         => 'required|exists:destinations,id',
            'destination_id'       => 'required|exists:destinations,id|different:departure_id',
            'arrival_agency_id'    => 'nullable|exists:agencies,id',
            'departure_date'       => 'required|date|after_or_equal:today',
            'departure_time'       => 'required|date_format:H:i',
            'arrival_time'         => 'required|date_format:H:i',
            'price'                => 'required|numeric|min:0',
            'distance_km'          => 'nullable|numeric|min:0',
            'submit_for_validation'=> 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $submitForValidation = $request->boolean('submit_for_validation', false);
        $validationStatus    = $submitForValidation ? 'pending_validation' : 'draft';

        $bus = Bus::find($request->bus_id);

        $trip = Trip::create([
            'agency_id'            => $agency->id,
            'bus_id'               => $request->bus_id,
            'departure_id'         => $request->departure_id,
            'destination_id'       => $request->destination_id,
            'departure_agency_id'  => $agency->id,
            'arrival_agency_id'    => $request->arrival_agency_id ?? $agency->id,
            'departure_date'       => $request->departure_date,
            'departure_time'       => $request->departure_time . ':00',
            'arrival_date'         => $request->departure_date,
            'arrival_time'         => $request->arrival_time . ':00',
            'price'                => $request->price,
            'distance_km'          => $request->distance_km,
            'status'               => $submitForValidation ? 'active' : 'active',
            'validation_status'    => $validationStatus,
            'occupied_seats'       => json_encode([]),
            'submitted_at'         => $submitForValidation ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => $submitForValidation
                ? 'Voyage soumis pour validation par l\'administrateur.'
                : 'Voyage enregistré en brouillon.',
            'data' => $trip->load(['bus', 'departure', 'destination'])
        ], 201);
    }

    /**
     * Update a trip (only if draft or rejected)
     */
    public function update(Request $request, string $id)
    {
        $agency = $this->getAgency();
        if (!$agency) return response()->json(['message' => 'Agence introuvable'], 404);

        $trip = Trip::where('id', $id)->where('agency_id', $agency->id)->first();
        if (!$trip) return response()->json(['message' => 'Voyage introuvable'], 404);

        if (!in_array($trip->validation_status, ['draft', 'rejected'])) {
            return response()->json(['message' => 'Seuls les brouillons et voyages rejetés peuvent être modifiés.'], 403);
        }

        $trip->update($request->only([
            'bus_id', 'departure_id', 'destination_id', 'departure_date',
            'departure_time', 'arrival_time', 'price', 'distance_km', 'arrival_agency_id'
        ]));

        return response()->json(['success' => true, 'message' => 'Voyage mis à jour.', 'data' => $trip]);
    }

    /**
     * Submit a draft trip for admin validation
     */
    public function submit(string $id)
    {
        $agency = $this->getAgency();
        if (!$agency) return response()->json(['message' => 'Agence introuvable'], 404);

        $trip = Trip::where('id', $id)->where('agency_id', $agency->id)->first();
        if (!$trip) return response()->json(['message' => 'Voyage introuvable'], 404);

        if (!in_array($trip->validation_status, ['draft', 'rejected'])) {
            return response()->json(['message' => 'Ce voyage ne peut pas être soumis.'], 400);
        }

        $trip->update([
            'validation_status' => 'pending_validation',
            'submitted_at'      => now(),
            'rejection_reason'  => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Voyage soumis pour validation.', 'data' => $trip]);
    }

    /**
     * Cancel a trip (only if no confirmed reservations)
     */
    public function cancel(string $id)
    {
        $agency = $this->getAgency();
        if (!$agency) return response()->json(['message' => 'Agence introuvable'], 404);

        $trip = Trip::where('id', $id)->where('agency_id', $agency->id)->first();
        if (!$trip) return response()->json(['message' => 'Voyage introuvable'], 404);

        $confirmedCount = Reservation::where('trip_id', $trip->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->count();

        if ($confirmedCount > 0) {
            return response()->json([
                'message' => "Impossible d'annuler : {$confirmedCount} réservation(s) active(s) existent."
            ], 400);
        }

        $trip->update(['validation_status' => 'cancelled', 'status' => 'cancelled']);

        return response()->json(['success' => true, 'message' => 'Voyage annulé.']);
    }

    /**
     * Get passengers for a specific trip
     */
    public function passengers(string $id)
    {
        $agency = $this->getAgency();
        if (!$agency) return response()->json(['message' => 'Agence introuvable'], 404);

        $trip = Trip::where('id', $id)->where('agency_id', $agency->id)->first();
        if (!$trip) return response()->json(['message' => 'Voyage introuvable'], 404);

        $reservations = Reservation::with(['payment', 'ticket'])
            ->where('trip_id', $trip->id)
            ->whereIn('status', ['confirmed', 'pending', 'reserved_at_counter'])
            ->orderBy('selected_seat')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'trip'         => $trip->load(['bus', 'departure', 'destination']),
                'passengers'   => $reservations,
                'total'        => $reservations->count(),
                'confirmed'    => $reservations->where('status', 'confirmed')->count(),
                'pending'      => $reservations->where('status', 'pending')->count(),
                'counter'      => $reservations->where('status', 'reserved_at_counter')->count(),
            ]
        ]);
    }

    /**
     * Agency's own buses
     */
    public function buses()
    {
        $agency = $this->getAgency();
        if (!$agency) return response()->json(['message' => 'Agence introuvable'], 404);

        // For now return all buses (in future add agency_id to buses table)
        $buses = Bus::where('state', 'actif')->get();
        return response()->json(['success' => true, 'data' => $buses]);
    }

    /**
     * Agency statistics (extended)
     */
    public function stats()
    {
        $agency = $this->getAgency();
        if (!$agency) return response()->json(['message' => 'Agence introuvable'], 404);

        $tripIds = Trip::where('agency_id', $agency->id)->pluck('id');
        $reservationIds = Reservation::whereIn('trip_id', $tripIds)->pluck('id');

        // Counts by validation status
        $tripsByStatus = Trip::where('agency_id', $agency->id)
            ->selectRaw('validation_status, count(*) as count')
            ->groupBy('validation_status')
            ->pluck('count', 'validation_status');

        // Reservation counts
        $resByStatus = Reservation::whereIn('trip_id', $tripIds)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Revenue
        $totalRevenue   = \App\Models\Payment::whereIn('reservation_id', $reservationIds)->where('status', 'completed')->sum('amount');
        $pendingRevenue = \App\Models\Payment::whereIn('reservation_id', $reservationIds)->where('status', 'pending')->sum('amount');

        // Monthly revenue (last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $month   = now()->subMonths($i);
            $revenue = \App\Models\Payment::whereIn('reservation_id', $reservationIds)
                ->where('status', 'completed')
                ->whereYear('completed_at', $month->year)
                ->whereMonth('completed_at', $month->month)
                ->sum('amount');
            $monthlyRevenue[] = ['month' => $month->format('M Y'), 'revenue' => $revenue];
        }

        // Top routes
        $topRoutes = Trip::where('agency_id', $agency->id)
            ->with(['departure', 'destination'])
            ->withCount(['reservations as booking_count' => fn($q) => $q->where('status', 'confirmed')])
            ->orderByDesc('booking_count')
            ->take(5)
            ->get()
            ->map(fn($t) => [
                'route'         => ($t->departure->city_name ?? '') . ' → ' . ($t->destination->city_name ?? ''),
                'booking_count' => $t->booking_count,
                'revenue'       => $t->price * $t->booking_count,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'agency'         => $agency,
                'trips_by_status'=> $tripsByStatus,
                'total_trips'    => $tripIds->count(),
                'total_reservations'     => $resByStatus->sum(),
                'confirmed_reservations' => $resByStatus->get('confirmed', 0),
                'pending_reservations'   => $resByStatus->get('pending', 0),
                'counter_reservations'   => $resByStatus->get('reserved_at_counter', 0),
                'total_revenue'          => $totalRevenue,
                'pending_revenue'        => $pendingRevenue,
                'monthly_revenue'        => $monthlyRevenue,
                'top_routes'             => $topRoutes,
            ]
        ]);
    }
}
