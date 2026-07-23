<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'agency_id',
        'bus_id',
        'departure_id',
        'destination_id',
        'departure_agency_id',
        'arrival_agency_id',
        'departure_date',
        'departure_time',
        'arrival_date',
        'arrival_time',
        'occupied_seats',
        'distance_km',
        'price',
        'status',
        'validation_status',
        'submitted_at',
        'rejection_reason',
        'notes',
         'validated_at',   
    'validated_by',
    ];

    protected $casts = [
        'occupied_seats' => 'array',
        'departure_date' => 'date',
        'arrival_date'   => 'date',
        'submitted_at'   => 'datetime',
         'validated_at'   => 'datetime',
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

    public function departureAgency()
    {
        return $this->belongsTo(Agency::class, 'departure_agency_id');
    }

    public function arrivalAgency()
    {
        return $this->belongsTo(Agency::class, 'arrival_agency_id');
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class, 'agency_id');
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
