<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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
        'latitude'        => 'decimal:8',
        'longitude'       => 'decimal:8',
    ];

    /** The user account linked to this agency */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** The city/destination where this agency is located */
    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    /** Trips created/owned by this agency (via agency_id on trips table) */
    public function trips()
    {
        return $this->hasMany(Trip::class, 'agency_id');
    }

    /** Trips departing from this agency location */
    public function departingTrips()
    {
        return $this->hasMany(Trip::class, 'departure_agency_id');
    }

    /** Trips arriving at this agency location */
    public function arrivingTrips()
    {
        return $this->hasMany(Trip::class, 'arrival_agency_id');
    }

    /** Disputes related to this agency */
    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }

    /** Promotions created by this agency */
    public function promotions()
    {
        return $this->hasMany(Promotion::class);
    }
}
