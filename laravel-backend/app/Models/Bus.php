<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_name',
        'internal_number',
        'registration',
        'brand',
        'year',
        'matricule',
        'type',
        'state',
        'maintenance_note',
        'total_seats',
        'seat_configuration',
        'price',
        'features'
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:2'
    ];

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
}
