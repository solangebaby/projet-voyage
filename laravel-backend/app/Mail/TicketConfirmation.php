<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use App\Models\Ticket;
use App\Models\Reservation;

class TicketConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $reservation;
    public $trip;

    /**
     * Create a new message instance.
     */
    public function __construct(Ticket $ticket)
    {
        $this->ticket = $ticket;
        $this->reservation = $ticket->reservation;
        $this->trip = $this->reservation->trip;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Bus Ticket - KCTrip',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Load relationships
        $this->trip->load(['departureAgency', 'arrivalAgency', 'departure', 'destination', 'bus']);
        
        return new Content(
            view: 'emails.ticket',
            with: [
                'ticketNumber' => $this->ticket->ticket_number,
                'passengerName' => $this->reservation->passenger_name,
                'passengerFirstName' => $this->reservation->passenger_first_name,
                'passengerLastName' => $this->reservation->passenger_last_name,
                'passengerEmail' => $this->reservation->passenger_email,
                'passengerPhone' => $this->reservation->passenger_phone,
                'passengerCNI' => $this->reservation->passenger_cni,
                'passengerGender' => $this->reservation->passenger_gender,
                'passengerNationality' => $this->reservation->passenger_nationality,
                'departure' => $this->trip->departure->city_name,
                'destination' => $this->trip->destination->city_name,
                'departureAgency' => $this->trip->departureAgency->agency_name ?? $this->trip->departureAgency->neighborhood ?? 'N/A',
                'arrivalAgency' => $this->trip->arrivalAgency->agency_name ?? $this->trip->arrivalAgency->neighborhood ?? 'N/A',
                'departureDate' => $this->trip->departure_date,
                'departureTime' => $this->trip->departure_time,
                'arrivalTime' => $this->trip->arrival_time,
                'seatNumber' => $this->reservation->selected_seat,
                'amount' => $this->reservation->payment->amount ?? 0,
                'qrCodeUrl' => url("/api/tickets/{$this->ticket->ticket_number}"),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        // Attach the PDF ticket
        try {
            $pdfController = new \App\Http\Controllers\PdfController();
            $pdfContent = $pdfController->generateTicketPdfForEmail($this->ticket->ticket_number);
            
            if ($pdfContent) {
                return [
                    Attachment::fromData(fn () => $pdfContent, 'KCTrip_Ticket_' . $this->ticket->ticket_number . '.pdf')
                        ->withMime('application/pdf')
                ];
            }
            
            return [];
        } catch (\Exception $e) {
            \Log::error('Failed to attach ticket PDF', ['error' => $e->getMessage()]);
            return [];
        }
    }
}
