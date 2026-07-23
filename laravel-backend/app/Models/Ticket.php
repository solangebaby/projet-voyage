<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'ticket_number',
        'ticket_type',
        'qr_code',
        'status',
        'downloaded_at'
    ];

    protected $casts = [
        'downloaded_at' => 'datetime',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
