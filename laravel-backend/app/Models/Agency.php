<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    use HasFactory;

    protected $fillable = [
        'destination_id',
        'agency_name',
        'neighborhood',
        'address',
        'phone',
        'latitude',
        'longitude',
        'is_main_station',
    ];

    protected $casts = [
        'is_main_station' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get the destination that owns the agency
     */
    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    /**
     * Get trips departing from this agency
     */
    public function departingTrips()
    {
        return $this->hasMany(Trip::class, 'departure_agency_id');
    }

    /**
     * Get trips arriving at this agency
     */
    public function arrivingTrips()
    {
        return $this->hasMany(Trip::class, 'arrival_agency_id');
    }
}
