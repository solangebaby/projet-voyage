<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use App\Models\Payment;
use App\Models\Trip;
use App\Services\NotchPayService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessExpiredReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:process-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process expired reservations and refund payments made more than 2 hours ago without ticket download';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Processing expired reservations...');

        try {
            DB::transaction(function () {
                // 1. Cancel pending reservations that have expired (15 minutes timeout)
                $expiredPending = Reservation::where('status', 'pending')
                    ->where('expires_at', '<', now())
                    ->get();

                foreach ($expiredPending as $reservation) {
                    $this->cancelReservation($reservation, 'Délai de paiement expiré');
                }

                $this->info("Cancelled {$expiredPending->count()} expired pending reservations");

                // 2. Process refunds for confirmed reservations older than 2 hours without ticket download
                $refundCutoff = now()->subHours(2);
                
                $reservationsToRefund = Reservation::where('status', 'confirmed')
                    ->whereHas('payment', function($query) {
                        $query->where('status', 'completed');
                    })
                    ->whereHas('ticket', function($query) {
                        $query->where('downloaded_at', null);
                    })
                    ->where('created_at', '<', $refundCutoff)
                    ->get();

                $notchPayService = new NotchPayService();

                foreach ($reservationsToRefund as $reservation) {
                    $payment = $reservation->payment;
                    
                    if ($payment && $payment->status === 'completed') {
                        // Process refund through NotchPay
                        $refundResult = $notchPayService->refundPayment(
                            $payment->reference,
                            $payment->amount
                        );

                        if ($refundResult['success']) {
                            // Update payment status
                            $payment->update([
                                'status' => 'refunded',
                                'refunded_at' => now(),
                            ]);

                            // Cancel reservation
                            $this->cancelReservation($reservation, 'Remboursement automatique - Ticket non téléchargé dans les 2h');

                            $this->info("Refunded reservation #{$reservation->id} - Amount: {$payment->amount} XAF");
                        } else {
                            Log::error("Failed to refund reservation #{$reservation->id}: " . $refundResult['message']);
                            $this->error("Failed to refund reservation #{$reservation->id}");
                        }
                    }
                }

                $this->info("Processed {$reservationsToRefund->count()} reservations for refund");
            });

            $this->info('✅ Expired reservations processed successfully!');
            return 0;

        } catch (\Exception $e) {
            Log::error('Error processing expired reservations: ' . $e->getMessage());
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Cancel a reservation and free up the seat
     */
    protected function cancelReservation(Reservation $reservation, string $reason)
    {
        $reservation->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // Free up the seat
        $trip = Trip::find($reservation->trip_id);
        if ($trip) {
            $occupiedSeats = is_string($trip->occupied_seats) 
                ? json_decode($trip->occupied_seats, true) 
                : $trip->occupied_seats;
            
            $occupiedSeats = $occupiedSeats ?? [];
            $occupiedSeats = array_values(array_diff($occupiedSeats, [$reservation->selected_seat]));
            
            $trip->occupied_seats = json_encode($occupiedSeats);
            $trip->save();
        }

        // Cancel ticket if exists
        if ($reservation->ticket) {
            $reservation->ticket->update(['status' => 'cancelled']);
        }

        Log::info("Cancelled reservation #{$reservation->id}: {$reason}");
    }
}
