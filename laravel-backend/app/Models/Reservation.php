<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'trip_id',
        'departure_agency_id',
        'arrival_agency_id',
        'selected_seat',
        'ticket_type',
        'passenger_name',
        'passenger_first_name',
        'passenger_last_name',
        'passenger_email',
        'passenger_phone',
        'passenger_gender',
        'passenger_cni',
        'passenger_nationality',
        'status',
        'expires_at',
        'cancelled_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'cancelled_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function departureAgency()
    {
        return $this->belongsTo(Agency::class, 'departure_agency_id');
    }

    public function arrivalAgency()
    {
        return $this->belongsTo(Agency::class, 'arrival_agency_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function ticket()
    {
        return $this->hasOne(Ticket::class);
    }
}
