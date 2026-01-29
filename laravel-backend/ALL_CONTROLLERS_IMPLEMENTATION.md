# Laravel Backend Controllers Implementation

This document contains all controller implementations. Copy each controller to its respective file.

## 1. TripController.php
```php
<?php
namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TripController extends Controller
{
    public function index()
    {
        $trips = Trip::with(['bus', 'departure', 'destination'])->where('status', 'active')->get();
        return response()->json(['success' => true, 'data' => $trips]);
    }

    public function search(Request $request)
    {
        $query = Trip::with(['bus', 'departure', 'destination'])->where('status', 'active');
        
        if ($request->has('departure')) {
            $query->whereHas('departure', fn($q) => $q->where('city_name', 'like', '%'.$request->departure.'%'));
        }
        if ($request->has('destination')) {
            $query->whereHas('destination', fn($q) => $q->where('city_name', 'like', '%'.$request->destination.'%'));
        }
        if ($request->has('date')) {
            $query->whereDate('departure_date', $request->date);
        }
        
        $trips = $query->where('available_seats', '>', 0)->get();
        return response()->json(['success' => true, 'data' => $trips]);
    }

    public function show($id)
    {
        $trip = Trip::with(['bus', 'departure', 'destination'])->find($id);
        if (!$trip) return response()->json(['success' => false, 'message' => 'Trip not found'], 404);
        return response()->json(['success' => true, 'data' => $trip]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bus_id' => 'required|exists:buses,id',
            'departure_id' => 'required|exists:destinations,id',
            'destination_id' => 'required|exists:destinations,id',
            'departure_date' => 'required|date',
            'departure_time' => 'required',
            'arrival_date' => 'required|date',
            'arrival_time' => 'required',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
        
        $bus = \App\Models\Bus::find($request->bus_id);
        $trip = Trip::create(array_merge($request->all(), [
            'available_seats' => $bus->total_seats,
            'occupied_seats' => [],
            'status' => 'active'
        ]));
        
        return response()->json(['success' => true, 'data' => $trip->load(['bus', 'departure', 'destination'])], 201);
    }

    public function update(Request $request, $id)
    {
        $trip = Trip::find($id);
        if (!$trip) return response()->json(['success' => false, 'message' => 'Trip not found'], 404);
        $trip->update($request->all());
        return response()->json(['success' => true, 'data' => $trip]);
    }

    public function destroy($id)
    {
        $trip = Trip::find($id);
        if (!$trip) return response()->json(['success' => false, 'message' => 'Trip not found'], 404);
        $trip->delete();
        return response()->json(['success' => true, 'message' => 'Trip deleted']);
    }
}
```

## 2. ReservationController.php
```php
<?php
namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'trip_id' => 'required|exists:trips,id',
            'selected_seat' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $trip = Trip::find($request->trip_id);
        
        if ($trip->available_seats <= 0) {
            return response()->json(['success' => false, 'message' => 'No available seats'], 400);
        }

        $occupiedSeats = $trip->occupied_seats ?? [];
        if (in_array($request->selected_seat, $occupiedSeats)) {
            return response()->json(['success' => false, 'message' => 'Seat already taken'], 400);
        }

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'trip_id' => $request->trip_id,
            'selected_seat' => $request->selected_seat,
            'status' => 'pending',
            'expires_at' => Carbon::now()->addMinutes(10)
        ]);

        $occupiedSeats[] = $request->selected_seat;
        $trip->update([
            'occupied_seats' => $occupiedSeats,
            'available_seats' => $trip->available_seats - 1
        ]);

        return response()->json(['success' => true, 'data' => $reservation], 201);
    }

    public function show($id)
    {
        $reservation = Reservation::with(['trip', 'user', 'payment', 'ticket'])->find($id);
        if (!$reservation) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return response()->json(['success' => true, 'data' => $reservation]);
    }

    public function getUserReservations($userId)
    {
        $reservations = Reservation::with(['trip', 'payment', 'ticket'])
            ->where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $reservations]);
    }

    public function cancel(Request $request, $id)
    {
        $reservation = Reservation::with(['payment', 'trip'])->find($id);
        
        if (!$reservation) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $minutesPassed = Carbon::now()->diffInMinutes($reservation->created_at);
        if ($minutesPassed > 10) {
            return response()->json(['success' => false, 'message' => 'Cancellation period expired'], 400);
        }

        $reservation->update(['status' => 'cancelled', 'cancelled_at' => Carbon::now()]);
        
        if ($reservation->payment) {
            $reservation->payment->update(['status' => 'refunded', 'refunded_at' => Carbon::now()]);
        }

        $trip = $reservation->trip;
        $occupiedSeats = array_values(array_diff($trip->occupied_seats ?? [], [$reservation->selected_seat]));
        $trip->update([
            'occupied_seats' => $occupiedSeats,
            'available_seats' => $trip->available_seats + 1
        ]);

        return response()->json(['success' => true, 'message' => 'Reservation cancelled']);
    }
}
```

## 3. PaymentController.php
```php
<?php
namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function initiate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reservation_id' => 'required|exists:reservations,id',
            'amount' => 'required|numeric',
            'method' => 'required|in:MTN,Orange,Bancaire',
            'phone_number' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $reservation = Reservation::find($request->reservation_id);
        
        if (!$reservation) {
            return response()->json(['success' => false, 'message' => 'Reservation not found'], 404);
        }

        // Simulate NotchPay integration
        $transactionId = 'NOTCHPAY-' . time() . rand(1000, 9999);
        $reference = 'REF-' . time();

        $payment = Payment::create([
            'reservation_id' => $request->reservation_id,
            'transaction_id' => $transactionId,
            'reference' => $reference,
            'amount' => $request->amount,
            'currency' => 'XAF',
            'method' => $request->method,
            'phone_number' => $request->phone_number,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'data' => $payment,
            'authorization_url' => 'https://pay.notchpay.co/...'
        ], 201);
    }

    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'transaction_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $payment = Payment::where('transaction_id', $request->transaction_id)->first();
        
        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
        }

        // Simulate payment verification (in production, call NotchPay API)
        $payment->update([
            'status' => 'completed',
            'completed_at' => Carbon::now()
        ]);

        $reservation = Reservation::find($payment->reservation_id);
        $reservation->update(['status' => 'confirmed']);

        // Generate ticket
        $ticketNumber = 'TKT-' . time() . rand(100, 999);
        $ticket = Ticket::create([
            'reservation_id' => $reservation->id,
            'ticket_number' => $ticketNumber,
            'qr_code' => 'QR-' . $payment->transaction_id,
            'status' => 'valid'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully',
            'data' => [
                'payment' => $payment,
                'ticket' => $ticket->load('reservation.trip')
            ]
        ]);
    }

    public function webhook(Request $request)
    {
        // Handle NotchPay webhooks
        // Verify signature, update payment status, generate ticket
        return response()->json(['success' => true]);
    }
}
```

## 4. BusController.php
```php
<?php
namespace App\Http\Controllers;

use App\Models\Bus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BusController extends Controller
{
    public function index()
    {
        $buses = Bus::all();
        return response()->json(['success' => true, 'data' => $buses]);
    }

    public function show($id)
    {
        $bus = Bus::find($id);
        if (!$bus) return response()->json(['success' => false, 'message' => 'Bus not found'], 404);
        return response()->json(['success' => true, 'data' => $bus]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bus_name' => 'required|string',
            'matricule' => 'required|string|unique:buses',
            'type' => 'required|in:standard,vip',
            'total_seats' => 'required|integer',
            'price' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $bus = Bus::create($request->all());
        return response()->json(['success' => true, 'data' => $bus], 201);
    }

    public function update(Request $request, $id)
    {
        $bus = Bus::find($id);
        if (!$bus) return response()->json(['success' => false, 'message' => 'Bus not found'], 404);
        $bus->update($request->all());
        return response()->json(['success' => true, 'data' => $bus]);
    }

    public function destroy($id)
    {
        $bus = Bus::find($id);
        if (!$bus) return response()->json(['success' => false, 'message' => 'Bus not found'], 404);
        $bus->delete();
        return response()->json(['success' => true, 'message' => 'Bus deleted']);
    }
}
```

## 5. DestinationController.php
```php
<?php
namespace App\Http\Controllers;

use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DestinationController extends Controller
{
    public function index()
    {
        $destinations = Destination::all();
        return response()->json(['success' => true, 'data' => $destinations]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city_name' => 'required|string|unique:destinations',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $destination = Destination::create($request->all());
        return response()->json(['success' => true, 'data' => $destination], 201);
    }

    public function update(Request $request, $id)
    {
        $destination = Destination::find($id);
        if (!$destination) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        $destination->update($request->all());
        return response()->json(['success' => true, 'data' => $destination]);
    }

    public function destroy($id)
    {
        $destination = Destination::find($id);
        if (!$destination) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        $destination->delete();
        return response()->json(['success' => true, 'message' => 'Destination deleted']);
    }
}
```

## 6. TicketController.php
```php
<?php
namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function showByNumber($ticketNumber)
    {
        $ticket = Ticket::with(['reservation.trip.bus', 'reservation.trip.departure', 'reservation.trip.destination', 'reservation.user'])
            ->where('ticket_number', $ticketNumber)
            ->first();

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $ticket]);
    }

    public function getUserTickets($userId)
    {
        $tickets = Ticket::with(['reservation.trip'])
            ->whereHas('reservation', fn($q) => $q->where('user_id', $userId))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $tickets]);
    }
}
```

---

## Setup Instructions

1. Copy each controller class above to its respective file in `app/Http/Controllers/`
2. Run migrations: `php artisan migrate`
3. Seed database with sample data
4. Configure CORS in `config/cors.php`
5. Test API endpoints
