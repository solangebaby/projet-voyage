<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_id',
        'departure_id',
        'destination_id',
        'departure_date',
        'departure_time',
        'arrival_date',
        'arrival_time',
        'available_seats',
        'occupied_seats',
        'distance_km',
        'status'
    ];

    protected $casts = [
        'occupied_seats' => 'array',
        'departure_date' => 'date',
        'arrival_date' => 'date'
    ];

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    public function departure()
    {
        return $this->belongsTo(Destination::class, 'departure_id');
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
