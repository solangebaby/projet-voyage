<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\TicketConfirmation;
use App\Services\NotchPayService;

class PaymentController extends Controller
{
    /**
     * Initiate a payment
     */
    public function initiate(Request $request)
    {
        // Backward compatibility: accept legacy field names
        if (!$request->has('payment_method') && $request->has('method')) {
            $request->merge(['payment_method' => $request->input('method')]);
        }
        \Log::info('Payment initiate payload', $request->all());

        $validator = Validator::make($request->all(), [
            'reservation_id' => 'required|exists:reservations,id',
            'amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'phone_number' => 'required|string',
        ]);

        if ($validator->fails()) {
            \Log::warning('Payment initiate validation failed', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()->toArray(),
                'payload' => $request->all(),
            ], 422);
        }

        try {
            $reservation = Reservation::with('trip.bus')->find($request->reservation_id);

            // Check if reservation belongs to user (or allow guest bookings)
            if ($reservation->user_id && $request->user() && $reservation->user_id !== $request->user()->id) {
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

            // Normalize payment method to match enum in DB
            $rawMethod = $request->payment_method;
            $method = 'Bancaire';
            if (is_string($rawMethod)) {
                $lower = strtolower($rawMethod);
                if (str_starts_with($lower, 'mobile_money_')) {
                    $provider = str_replace('mobile_money_', '', $lower);
                    if ($provider === 'mtn') {
                        $method = 'MTN';
                    } elseif ($provider === 'orange' || $provider === 'moov') {
                        $method = 'Orange'; // fallback unknowns to Orange to match enum
                    }
                } elseif (in_array($lower, ['card', 'carte', 'bancaire'])) {
                    $method = 'Bancaire';
                }
            }

            // Determine amount: use provided amount or derive from trip/bus price
            $amount = $request->amount;
            if (!$amount || $amount <= 0) {
                $amount = optional($reservation->trip->bus)->price ?? 0;
            }
            if (!$amount || $amount <= 0) {
                // As a final fallback, prevent null insert
                $amount = 1; // minimal placeholder in XAF for dev; adjust in production
            }

            // Validate and format phone number for NotchPay
            $phone = preg_replace('/[^0-9]/', '', $request->phone_number);
            
            // Remove leading zeros
            $phone = ltrim($phone, '0');
            
            // Add 237 if missing
            if (!str_starts_with($phone, '237')) {
                $phone = '237' . $phone;
            }
            
            // Validate length (must be exactly 12 digits: 237 + 9 digits)
            if (strlen($phone) !== 12) {
                return response()->json([
                    'success' => false,
                    'message' => "Numéro de téléphone invalide. Format requis: 237XXXXXXXXX (9 chiffres). Exemple: 237654061800"
                ], 400);
            }
            
            // Create payment record
            $reference = 'REF-' . strtoupper(Str::random(10));
            
            $payment = Payment::create([
                'reservation_id' => $reservation->id,
                'transaction_id' => 'TXN-' . strtoupper(Str::random(12)),
                'reference' => $reference,
                'amount' => $amount,
                'currency' => 'XAF',
                'method' => $method,
                'phone_number' => $phone,
                'status' => 'pending',
            ]);

            // Initiate real payment with NotchPay
            $notchPayService = new NotchPayService();
            $paymentData = [
                'amount' => $amount,
                'currency' => 'XAF',
                'email' => $reservation->passenger_email,
                'phone' => $phone,
                'reference' => $reference,
                'description' => "Réservation Jadoo Travels - Siège {$reservation->selected_seat}",
                'callback_url' => config('app.url') . '/api/payments/webhook',
            ];

            $notchPayResult = $notchPayService->initiatePayment($paymentData);

            if ($notchPayResult['success']) {
                // Update payment with NotchPay transaction ID
                $payment->update([
                    'transaction_id' => $notchPayResult['transaction_id'],
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment initiated successfully',
                    'data' => [
                        'payment' => $payment,
                        'reservation' => $reservation,
                        'payment_url' => $notchPayResult['payment_url'],
                        'notchpay_data' => $notchPayResult['data']
                    ]
                ], 201);
            } else {
                // Failed to initiate with NotchPay
                $payment->update(['status' => 'failed']);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to initiate payment with NotchPay: ' . $notchPayResult['message'],
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment initiation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify payment (simulated - in production would call actual payment gateway)
     */
    /**
     * Get all payments (Admin)
     */
    public function index(Request $request)
    {
        $query = Payment::with(['reservation.user', 'reservation.trip.departure', 'reservation.trip.destination']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Get a specific payment
     */
    public function show($id)
    {
        $payment = Payment::with(['reservation.user', 'reservation.trip'])->find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Paiement non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Refund a payment (Admin)
     */
    public function refund($id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Paiement non trouvé'
            ], 404);
        }

        if ($payment->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les paiements complétés peuvent être remboursés'
            ], 400);
        }

        // Update payment status
        $payment->status = 'refunded';
        $payment->save();

        // Update reservation status
        if ($payment->reservation) {
            $payment->reservation->status = 'cancelled';
            $payment->reservation->save();

            // Free the seat
            $trip = $payment->reservation->trip;
            if ($trip) {
                $occupiedSeats = json_decode($trip->occupied_seats, true) ?? [];
                $occupiedSeats = array_values(array_diff($occupiedSeats, [$payment->reservation->selected_seat]));
                $trip->occupied_seats = json_encode($occupiedSeats);
                $trip->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Paiement remboursé avec succès'
        ]);
    }

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
                    'ticket_type' => $reservation->ticket_type ?? 'standard',
                    'qr_code' => 'QR-' . strtoupper(Str::random(20)),
                    'status' => 'valid',
                ]);

                // Send ticket confirmation email
                try {
                    $ticket->load(['reservation.trip.bus', 'reservation.trip.departure', 'reservation.trip.destination', 'reservation.payment']);
                    Mail::to($reservation->passenger_email)->send(new TicketConfirmation($ticket));
                    \Log::info('Ticket confirmation email sent to: ' . $reservation->passenger_email);
                } catch (\Exception $e) {
                    \Log::error('Failed to send ticket email: ' . $e->getMessage());
                    // Don't fail the payment if email fails
                }

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
                        $ticket = Ticket::create([
                            'reservation_id' => $reservation->id,
                            'ticket_number' => 'TKT-' . strtoupper(Str::random(10)),
                            'ticket_type' => $reservation->ticket_type ?? 'standard',
                            'qr_code' => 'QR-' . strtoupper(Str::random(20)),
                            'status' => 'valid',
                        ]);
                        
                        // Send ticket confirmation email
                        try {
                            $ticket->load(['reservation.trip.bus', 'reservation.trip.departure', 'reservation.trip.destination', 'reservation.payment']);
                            Mail::to($reservation->passenger_email)->send(new TicketConfirmation($ticket));
                            \Log::info('Ticket confirmation email sent via webhook to: ' . $reservation->passenger_email);
                        } catch (\Exception $e) {
                            \Log::error('Failed to send ticket email via webhook: ' . $e->getMessage());
                        }
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
