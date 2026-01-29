<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Initiate a payment
     */
    public function initiate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reservation_id' => 'required|exists:reservations,id',
            'method' => 'required|in:MTN,Orange,Bancaire',
            'phone_number' => 'required_if:method,MTN,Orange|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reservation = Reservation::with('trip.bus')->find($request->reservation_id);

        // Check if reservation belongs to user
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if reservation is still valid
        if ($reservation->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Reservation is cancelled'
            ], 400);
        }

        if ($reservation->status === 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'Reservation is already confirmed'
            ], 400);
        }

        // Check if not expired
        if ($reservation->expires_at && $reservation->expires_at < now()) {
            $reservation->update(['status' => 'cancelled']);
            return response()->json([
                'success' => false,
                'message' => 'Reservation has expired'
            ], 400);
        }

        // Calculate amount from bus price
        $amount = $reservation->trip->bus->price;

        // Create payment record
        $payment = Payment::create([
            'reservation_id' => $reservation->id,
            'transaction_id' => 'TXN-' . strtoupper(Str::random(12)),
            'reference' => 'REF-' . strtoupper(Str::random(10)),
            'amount' => $amount,
            'currency' => 'XAF',
            'method' => $request->method,
            'phone_number' => $request->phone_number,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment initiated successfully',
            'data' => [
                'payment' => $payment,
                'reservation' => $reservation,
                'amount' => $amount
            ]
        ], 201);
    }

    /**
     * Verify payment (simulated - in production would call actual payment gateway)
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'transaction_id' => 'required|string',
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
                $payment = Payment::where('transaction_id', $request->transaction_id)->first();

                if (!$payment) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment not found'
                    ], 404);
                }

                if ($payment->status === 'completed') {
                    return response()->json([
                        'success' => true,
                        'message' => 'Payment already verified',
                        'data' => $payment->load(['reservation.ticket'])
                    ]);
                }

                // Simulate payment verification (in production, call actual gateway API)
                // For now, we'll mark as completed
                $payment->status = 'completed';
                $payment->completed_at = now();
                $payment->save();

                // Update reservation status
                $reservation = Reservation::find($payment->reservation_id);
                $reservation->status = 'confirmed';
                $reservation->save();

                // Generate ticket
                $ticket = Ticket::create([
                    'reservation_id' => $reservation->id,
                    'ticket_number' => 'TKT-' . strtoupper(Str::random(10)),
                    'qr_code' => 'QR-' . strtoupper(Str::random(20)),
                    'status' => 'valid',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified successfully',
                    'data' => [
                        'payment' => $payment,
                        'reservation' => $reservation->load('trip.bus', 'trip.departure', 'trip.destination'),
                        'ticket' => $ticket
                    ]
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook for payment gateway callbacks (e.g., NotchPay)
     */
    public function webhook(Request $request)
    {
        // Validate webhook signature (implement based on payment gateway)
        // For now, basic implementation

        try {
            $transactionId = $request->input('transaction_id');
            $status = $request->input('status'); // 'success', 'failed', etc.

            $payment = Payment::where('transaction_id', $transactionId)->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }

            if ($status === 'success') {
                DB::transaction(function () use ($payment) {
                    $payment->status = 'completed';
                    $payment->completed_at = now();
                    $payment->save();

                    $reservation = Reservation::find($payment->reservation_id);
                    $reservation->status = 'confirmed';
                    $reservation->save();

                    // Generate ticket if not exists
                    if (!$reservation->ticket) {
                        Ticket::create([
                            'reservation_id' => $reservation->id,
                            'ticket_number' => 'TKT-' . strtoupper(Str::random(10)),
                            'qr_code' => 'QR-' . strtoupper(Str::random(20)),
                            'status' => 'valid',
                        ]);
                    }
                });
            } else {
                $payment->status = 'failed';
                $payment->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Webhook processed'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Webhook processing failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
