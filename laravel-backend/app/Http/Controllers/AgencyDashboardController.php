<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Trip;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\Bus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AgencyDashboardController extends Controller
{
    /**
     * Get the agency linked to the authenticated user.
     */
    private function getAgency()
    {
        return Agency::where('user_id', Auth::id())->first();
    }

    /**
     * Dashboard statistics for the agency.
     */
    public function stats()
    {
        $agency = $this->getAgency();
        if (!$agency) {
            return response()->json(['message' => 'Aucune agence liée à ce compte.'], 404);
        }

        $tripIds = Trip::where('departure_agency_id', $agency->id)
            ->orWhere('arrival_agency_id', $agency->id)
            ->pluck('id');

        $totalTrips = $tripIds->count();
        $totalReservations = Reservation::whereIn('trip_id', $tripIds)->count();
        $confirmedReservations = Reservation::whereIn('trip_id', $tripIds)->where('status', 'confirmed')->count();
        $pendingReservations = Reservation::whereIn('trip_id', $tripIds)->where('status', 'pending')->count();
        $counterReservations = Reservation::whereIn('trip_id', $tripIds)->where('status', 'reserved_at_counter')->count();

        $reservationIds = Reservation::whereIn('trip_id', $tripIds)->pluck('id');
        $totalRevenue = Payment::whereIn('reservation_id', $reservationIds)->where('status', 'completed')->sum('amount');
        $pendingRevenue = Payment::whereIn('reservation_id', $reservationIds)->where('status', 'pending')->sum('amount');

        // Monthly revenue (last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $revenue = Payment::whereIn('reservation_id', $reservationIds)
                ->where('status', 'completed')
                ->whereYear('completed_at', $month->year)
                ->whereMonth('completed_at', $month->month)
                ->sum('amount');
            $monthlyRevenue[] = [
                'month' => $month->format('M Y'),
                'revenue' => $revenue,
            ];
        }

        return response()->json([
            'agency' => $agency,
            'stats' => [
                'total_trips' => $totalTrips,
                'total_reservations' => $totalReservations,
                'confirmed_reservations' => $confirmedReservations,
                'pending_reservations' => $pendingReservations,
                'counter_reservations' => $counterReservations,
                'total_revenue' => $totalRevenue,
                'pending_revenue' => $pendingRevenue,
                'monthly_revenue' => $monthlyRevenue,
            ]
        ]);
    }

    /**
     * Get trips for the agency.
     */
    public function trips(Request $request)
    {
        $agency = $this->getAgency();
        if (!$agency) {
            return response()->json(['message' => 'Aucune agence liée à ce compte.'], 404);
        }

        $query = Trip::with(['bus', 'departure', 'destination', 'departureAgency', 'arrivalAgency'])
            ->where(function ($q) use ($agency) {
                $q->where('departure_agency_id', $agency->id)
                  ->orWhere('arrival_agency_id', $agency->id);
            });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('departure_date', $request->date);
        }

        $trips = $query->orderBy('departure_date', 'desc')->paginate(20);

        return response()->json($trips);
    }

    /**
     * Get reservations for the agency's trips.
     */
    public function reservations(Request $request)
    {
        $agency = $this->getAgency();
        if (!$agency) {
            return response()->json(['message' => 'Aucune agence liée à ce compte.'], 404);
        }

        $tripIds = Trip::where('departure_agency_id', $agency->id)
            ->orWhere('arrival_agency_id', $agency->id)
            ->pluck('id');

        $query = Reservation::with(['trip.bus', 'trip.departure', 'trip.destination', 'payment', 'ticket'])
            ->whereIn('trip_id', $tripIds);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('passenger_first_name', 'like', "%{$search}%")
                  ->orWhere('passenger_last_name', 'like', "%{$search}%")
                  ->orWhere('passenger_phone', 'like', "%{$search}%")
                  ->orWhere('selected_seat', 'like', "%{$search}%");
            });
        }

        $reservations = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($reservations);
    }

    /**
     * Get payments for the agency's reservations.
     */
    public function payments(Request $request)
    {
        $agency = $this->getAgency();
        if (!$agency) {
            return response()->json(['message' => 'Aucune agence liée à ce compte.'], 404);
        }

        $tripIds = Trip::where('departure_agency_id', $agency->id)
            ->orWhere('arrival_agency_id', $agency->id)
            ->pluck('id');

        $reservationIds = Reservation::whereIn('trip_id', $tripIds)->pluck('id');

        $query = Payment::with(['reservation.trip.departure', 'reservation.trip.destination'])
            ->whereIn('reservation_id', $reservationIds);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($payments);
    }

    /**
     * Get agency profile info.
     */
    public function profile()
    {
        $agency = $this->getAgency();
        if (!$agency) {
            return response()->json(['message' => 'Aucune agence liée à ce compte.'], 404);
        }

        return response()->json(['data' => $agency->load('destination')]);
    }
}
