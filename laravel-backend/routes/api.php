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
use App\Http\Controllers\PdfController;
use App\Http\Controllers\AgencyController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\CityManagementController;
use App\Http\Controllers\UserManagementController; // 👉 IMPORTANT

/*
|--------------------------------------------------------------------------
| 1. ROUTES PUBLIQUES
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/auth/setup-account', [AuthController::class, 'setupAccount']);

Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/agencies', [AgencyController::class, 'index']);
Route::get('/trips/search', [TripController::class, 'search']);
Route::get('/trips/{id}', [TripController::class, 'show']);
Route::get('/tarifs/route', [TarifController::class, 'getTarifsForRoute']);

Route::get('/tickets/{ticketNumber}', [TicketController::class, 'showByNumber']);
Route::get('/tickets/{ticketNumber}/pdf', [PdfController::class, 'generateTicketPdf']);
Route::get('/tickets/{ticketNumber}/scan', [TicketController::class, 'showForScan']);
Route::post('/tickets/{ticketNumber}/send-email', [TicketController::class, 'sendByEmail']);
Route::post('/tickets/{ticketNumber}/download', [TicketController::class, 'markAsDownloaded']);
Route::post('/reservations/bulk', [ReservationController::class, 'storeBulk']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::get('/reservations/{id}', [ReservationController::class, 'show']);

Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
Route::post('/payments/verify', [PaymentController::class, 'verify']);
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

/*
|--------------------------------------------------------------------------
| 2. ROUTES PROTÉGÉES
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Voyageur
    Route::get('/my-reservations', [ReservationController::class, 'index']);
    Route::get('/my-tickets', [TicketController::class, 'getMyTickets']);
    Route::get('/tickets/user/{userId}', [TicketController::class, 'getUserTickets']);
    Route::get('/reservations/user/{userId}', [ReservationController::class, 'getUserReservations']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
    Route::get('/payments/user/{userId}', [PaymentController::class, 'getUserPayments']);
    Route::get('/disputes/my', [App\Http\Controllers\DisputeController::class, 'myDisputes']);
    Route::post('/disputes', [App\Http\Controllers\DisputeController::class, 'store']);
    Route::post('/promotions/apply', [App\Http\Controllers\PromotionController::class, 'apply']);

    /*
    |--------------------------------------------------------------------------
    | 3. ESPACE AGENCE
    |--------------------------------------------------------------------------
    */
    Route::middleware('agency')->prefix('agency')->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\AgencyDashboardController::class, 'index']);
        Route::get('/stats', [App\Http\Controllers\AgencyTripController::class, 'stats']);
        Route::get('/profile', [AgencyController::class, 'profile']);
        Route::get('/trips', [App\Http\Controllers\AgencyTripController::class, 'index']);
        Route::post('/trips', [App\Http\Controllers\AgencyTripController::class, 'store']);
        Route::put('/trips/{id}', [App\Http\Controllers\AgencyTripController::class, 'update']);
        Route::post('/trips/{id}/submit', [App\Http\Controllers\AgencyTripController::class, 'submit']);
        Route::post('/trips/{id}/cancel', [App\Http\Controllers\AgencyTripController::class, 'cancel']);
        Route::get('/trips/{id}/passengers', [App\Http\Controllers\AgencyTripController::class, 'passengers']);
        Route::get('/buses', [App\Http\Controllers\AgencyTripController::class, 'buses']);
        Route::get('/reservations', [ReservationController::class, 'agencyReservations']);
        Route::get('/payments', [PaymentController::class, 'agencyPayments']);
        Route::get('/promotions', [App\Http\Controllers\PromotionController::class, 'index']);
        Route::post('/promotions', [App\Http\Controllers\PromotionController::class, 'store']);
        Route::put('/promotions/{id}', [App\Http\Controllers\PromotionController::class, 'update']);
        Route::delete('/promotions/{id}', [App\Http\Controllers\PromotionController::class, 'destroy']);
        Route::post('/promotions/{id}/toggle', [App\Http\Controllers\PromotionController::class, 'toggle']);
    });

    /*
    |--------------------------------------------------------------------------
    | 4. ESPACE ADMIN
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {

        // ROUTES DE GESTION DES UTILISATEURS AJOUTÉES ICI
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::put('/users/{id}', [UserManagementController::class, 'update']);
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
        Route::post('/users/{id}/activate', [UserManagementController::class, 'activate']);
        Route::post('/users/{id}/deactivate', [UserManagementController::class, 'deactivate']);
        Route::get('/users-statistics', [UserManagementController::class, 'statistics']);

        // (le reste déjà existant…)
        Route::get('/stats', [App\Http\Controllers\StatisticsController::class, 'index']);
        Route::get('/trips/pending', [App\Http\Controllers\TripValidationController::class, 'pending']);
        Route::get('/trips', [App\Http\Controllers\TripValidationController::class, 'allTrips']);
        Route::post('/trips/{id}/approve', [App\Http\Controllers\TripValidationController::class, 'approve']);
        Route::post('/trips/{id}/reject', [App\Http\Controllers\TripValidationController::class, 'reject']);

        Route::get('/tariffs', [TarifController::class, 'index']);
        Route::get('/tariffs/{id}', [TarifController::class, 'show']);
        Route::post('/tariffs', [TarifController::class, 'store']);
        Route::put('/tariffs/{id}', [TarifController::class, 'update']);
        Route::delete('/tariffs/{id}', [TarifController::class, 'destroy']);

        Route::get('/cities', [CityManagementController::class, 'index']);
        Route::post('/cities', [CityManagementController::class, 'store']);
        Route::put('/cities/{id}', [CityManagementController::class, 'update']);
        Route::delete('/cities/{id}', [CityManagementController::class, 'destroy']);

        Route::get('/routes', [App\Http\Controllers\RouteManagementController::class, 'index']);
        Route::post('/routes', [App\Http\Controllers\RouteManagementController::class, 'store']);
        Route::put('/routes/{id}', [App\Http\Controllers\RouteManagementController::class, 'update']);
        Route::delete('/routes/{id}', [App\Http\Controllers\RouteManagementController::class, 'destroy']);

        Route::get('/agencies', [AgencyController::class, 'adminIndex']);
        Route::get('/agencies/stats', [AgencyController::class, 'adminStats']);
        Route::post('/agencies/{id}/approve', [AgencyController::class, 'approve']);
        Route::post('/agencies/{id}/suspend', [AgencyController::class, 'suspend']);
        Route::post('/agencies/{id}/reject', [AgencyController::class, 'reject']);

        Route::get('/disputes', [App\Http\Controllers\DisputeController::class, 'index']);
        Route::get('/disputes/{id}', [App\Http\Controllers\DisputeController::class, 'show']);
        Route::put('/disputes/{id}', [App\Http\Controllers\DisputeController::class, 'update']);

        Route::get('/fleet/buses', [BusController::class, 'index']);
        Route::post('/fleet/buses', [BusController::class, 'store']);
        Route::put('/fleet/buses/{id}', [BusController::class, 'update']);
        Route::delete('/fleet/buses/{id}', [BusController::class, 'destroy']);

        Route::put('/comments/{id}/status', [App\Http\Controllers\CommentController::class, 'updateStatus']);
        Route::delete('/comments/{id}', [App\Http\Controllers\CommentController::class, 'destroy']);
    });
});