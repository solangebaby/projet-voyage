<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Bus;
use App\Models\Destination;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getDashboardStats()
    {
        // Total counts
        $totalTrips = Trip::count();
        $activeBuses = Bus::count();
        $totalDestinations = Destination::count();
        $totalBookings = Reservation::count();
        $confirmedBookings = Reservation::where('status', 'confirmed')->count();
        $totalUsers = User::where('role', 'voyageur')->count();
        
        // Revenue statistics
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $monthlyRevenue = Payment::where('status', 'completed')
            ->whereMonth('created_at', date('m'))
            ->whereYear('created_at', date('Y'))
            ->sum('amount');
        
        // Booking statistics by month (last 6 months)
        $bookingsByMonth = Reservation::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();
        
        // Revenue by month (last 6 months)
        $revenueByMonth = Payment::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('SUM(amount) as total')
        )
        ->where('status', 'completed')
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();
        
        // Popular destinations
        $popularDestinations = Reservation::select(
            'destinations.city_name',
            DB::raw('COUNT(*) as booking_count')
        )
        ->join('trips', 'reservations.trip_id', '=', 'trips.id')
        ->join('destinations', 'trips.destination_id', '=', 'destinations.id')
        ->where('reservations.status', 'confirmed')
        ->groupBy('destinations.id', 'destinations.city_name')
        ->orderBy('booking_count', 'desc')
        ->limit(5)
        ->get();
        
        // Bus usage statistics
        $busUsage = Reservation::select(
            'buses.bus_name',
            'buses.total_seats',
            DB::raw('COUNT(*) as bookings')
        )
        ->join('trips', 'reservations.trip_id', '=', 'trips.id')
        ->join('buses', 'trips.bus_id', '=', 'buses.id')
        ->where('reservations.status', 'confirmed')
        ->groupBy('buses.id', 'buses.bus_name', 'buses.total_seats')
        ->get()
        ->map(function($bus) {
            $bus->usage_percentage = ($bus->bookings / ($bus->total_seats * 10)) * 100; // Assuming 10 trips per bus
            return $bus;
        });
        
        // Average rating from comments
        $averageRating = Comment::where('status', 'approved')->avg('rating');
        $totalComments = Comment::count();
        $pendingComments = Comment::where('status', 'pending')->count();
        
        // Recent bookings
        $recentBookings = Reservation::with(['user', 'trip.departure', 'trip.destination'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total_trips' => $totalTrips,
                    'active_buses' => $activeBuses,
                    'total_destinations' => $totalDestinations,
                    'total_bookings' => $totalBookings,
                    'confirmed_bookings' => $confirmedBookings,
                    'total_users' => $totalUsers,
                    'total_revenue' => $totalRevenue,
                    'monthly_revenue' => $monthlyRevenue,
                    'average_rating' => round($averageRating, 1),
                    'total_comments' => $totalComments,
                    'pending_comments' => $pendingComments,
                ],
                'charts' => [
                    'bookings_by_month' => $bookingsByMonth,
                    'revenue_by_month' => $revenueByMonth,
                    'popular_destinations' => $popularDestinations,
                    'bus_usage' => $busUsage,
                ],
                'recent_bookings' => $recentBookings,
            ]
        ]);
    }
}
