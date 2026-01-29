<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    use HasFactory;

    protected $fillable = ['city_name', 'region', 'country', 'status'];

    public function departureTrips()
    {
        return $this->hasMany(Trip::class, 'departure_id');
    }

    public function destinationTrips()
    {
        return $this->hasMany(Trip::class, 'destination_id');
    }
}
