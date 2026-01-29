<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'transaction_id',
        'reference',
        'amount',
        'currency',
        'method',
        'phone_number',
        'status',
        'completed_at',
        'refunded_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'completed_at' => 'datetime',
        'refunded_at' => 'datetime'
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
