<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\BusController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\PdfController;
use App\Http\Controllers\AgencyController;
use App\Http\Controllers\UserManagementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Destinations (public)
Route::get('/destinations', [DestinationController::class, 'index']);

// Agencies (public - for viewing)
Route::get('/agencies', [AgencyController::class, 'index']);
Route::get('/agencies/{id}', [AgencyController::class, 'show']);

// City Management (Admin Only)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/cities', [App\Http\Controllers\CityManagementController::class, 'index']);
    Route::post('/cities', [App\Http\Controllers\CityManagementController::class, 'store']);
    Route::get('/cities/{id}', [App\Http\Controllers\CityManagementController::class, 'show']);
    Route::put('/cities/{id}', [App\Http\Controllers\CityManagementController::class, 'update']);
    Route::delete('/cities/{id}', [App\Http\Controllers\CityManagementController::class, 'destroy']);
    
    // Route Management
    Route::get('/routes', [App\Http\Controllers\RouteManagementController::class, 'index']);
    Route::post('/routes', [App\Http\Controllers\RouteManagementController::class, 'store']);
    Route::get('/routes/{id}', [App\Http\Controllers\RouteManagementController::class, 'show']);
    Route::put('/routes/{id}', [App\Http\Controllers\RouteManagementController::class, 'update']);
    Route::delete('/routes/{id}', [App\Http\Controllers\RouteManagementController::class, 'destroy']);
    Route::post('/routes/calculate-arrival', [App\Http\Controllers\RouteManagementController::class, 'calculateArrivalTime']);
    
    // Agency Management
    Route::post('/agencies', [AgencyController::class, 'store']);
    Route::put('/agencies/{id}', [AgencyController::class, 'update']);
    Route::delete('/agencies/{id}', [AgencyController::class, 'destroy']);
    
    // Bus Fleet Management
    Route::get('/fleet/buses', [App\Http\Controllers\BusFleetController::class, 'index']);
    Route::post('/fleet/buses', [App\Http\Controllers\BusFleetController::class, 'store']);
    Route::get('/fleet/buses/{id}', [App\Http\Controllers\BusFleetController::class, 'show']);
    Route::put('/fleet/buses/{id}', [App\Http\Controllers\BusFleetController::class, 'update']);
    Route::delete('/fleet/buses/{id}', [App\Http\Controllers\BusFleetController::class, 'destroy']);
    Route::put('/fleet/buses/{id}/seats', [App\Http\Controllers\BusFleetController::class, 'updateSeatConfiguration']);
    
    // Tarif Management
    Route::get('/tarifs', [App\Http\Controllers\TarifController::class, 'index']);
    Route::post('/tarifs', [App\Http\Controllers\TarifController::class, 'store']);
    Route::get('/tarifs/{id}', [App\Http\Controllers\TarifController::class, 'show']);
    Route::put('/tarifs/{id}', [App\Http\Controllers\TarifController::class, 'update']);
    Route::delete('/tarifs/{id}', [App\Http\Controllers\TarifController::class, 'destroy']);
    Route::post('/tarifs/{id}/calculate-price', [App\Http\Controllers\TarifController::class, 'calculatePrice']);
    
    // Voyage Management
    Route::get('/voyages', [App\Http\Controllers\VoyageManagementController::class, 'index']);
    Route::post('/voyages', [App\Http\Controllers\VoyageManagementController::class, 'store']);
    Route::post('/voyages/bulk', [App\Http\Controllers\VoyageManagementController::class, 'storeBulk']);
    Route::get('/voyages/calendar', [App\Http\Controllers\VoyageManagementController::class, 'calendar']);
    Route::get('/voyages/{id}', [App\Http\Controllers\VoyageManagementController::class, 'show']);
    Route::put('/voyages/{id}', [App\Http\Controllers\VoyageManagementController::class, 'update']);
    Route::delete('/voyages/{id}', [App\Http\Controllers\VoyageManagementController::class, 'destroy']);
    Route::post('/voyages/{id}/activate', [App\Http\Controllers\VoyageManagementController::class, 'activate']);
    Route::post('/voyages/{id}/deactivate', [App\Http\Controllers\VoyageManagementController::class, 'deactivate']);
});

// Buses (public)
Route::get('/buses', [BusController::class, 'index']);
Route::get('/buses/{id}', [BusController::class, 'show']);

// Trips (public)
Route::get('/trips', [TripController::class, 'index']);
Route::get('/trips/search', [TripController::class, 'search']);
Route::get('/trips/{id}', [TripController::class, 'show']);

// Tarifs (public - pour affichage)
Route::get('/tarifs/route', [App\Http\Controllers\TarifController::class, 'getTarifsForRoute']);

// Tickets (public - for verification)
Route::get('/tickets/{ticketNumber}', [TicketController::class, 'showByNumber']);
Route::get('/tickets/{ticketNumber}/pdf', [PdfController::class, 'generateTicketPdf']);
Route::post('/tickets/{ticketNumber}/download', [TicketController::class, 'markAsDownloaded']);

// Comments
Route::get('/comments', [CommentController::class, 'index']);
// Allow guests to submit comments (name/email required when not authenticated)
Route::post('/comments', [CommentController::class, 'store']);

// Reservations (public - allow guest bookings)
Route::post('/reservations', [ReservationController::class, 'store']);

// Payments (public - allow guest payments)
Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
Route::post('/payments/verify', [PaymentController::class, 'verify']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Reservations (authenticated)
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
    Route::get('/reservations/user/{userId}', [ReservationController::class, 'getUserReservations']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
    Route::post('/reservations/{id}/extend-delay', [ReservationController::class, 'extendDelay'])->middleware('admin');
    
    // Admin - Payments
    Route::middleware('admin')->group(function () {
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/payments/{id}', [PaymentController::class, 'show']);
        Route::post('/payments/{id}/refund', [PaymentController::class, 'refund']);
    });
    
    // Tickets
    Route::get('/tickets/user/{userId}', [TicketController::class, 'getUserTickets']);
    
    // Comments
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    Route::get('/comments/user/{userId}', [CommentController::class, 'getUserComments']);
    
    // Admin routes
    Route::middleware('admin')->group(function () {
        // Trips management
        Route::post('/trips', [TripController::class, 'store']);
        Route::put('/trips/{id}', [TripController::class, 'update']);
        Route::delete('/trips/{id}', [TripController::class, 'destroy']);
        
        // Buses management
        Route::post('/buses', [BusController::class, 'store']);
        Route::put('/buses/{id}', [BusController::class, 'update']);
        Route::delete('/buses/{id}', [BusController::class, 'destroy']);
        
        // Destinations management
        Route::post('/destinations', [DestinationController::class, 'store']);
        Route::put('/destinations/{id}', [DestinationController::class, 'update']);
        Route::delete('/destinations/{id}', [DestinationController::class, 'destroy']);
        
        // Comments management
        Route::put('/comments/{id}/status', [CommentController::class, 'updateStatus']);
        
        // Statistics
        Route::get('/statistics/dashboard', [StatisticsController::class, 'getDashboardStats']);
        
        // User Management
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::get('/users/statistics', [UserManagementController::class, 'statistics']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::put('/users/{id}', [UserManagementController::class, 'update']);
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
        Route::post('/users/{id}/activate', [UserManagementController::class, 'activate']);
        Route::post('/users/{id}/deactivate', [UserManagementController::class, 'deactivate']);
    });
});

// Payment webhook (public for NotchPay callbacks)
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);
