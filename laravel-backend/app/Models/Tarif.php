<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tarif extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'departure_id',
        'destination_id',
        'price_adult',
        'price_student',
        'price_child',
        'valid_from',
        'valid_to',
        'valid_days',
        'time_period',
        'group_discount_percentage',
        'group_discount_min_passengers',
        'status',
    ];

    protected $casts = [
        'valid_days' => 'array',
        'price_adult' => 'decimal:2',
        'price_student' => 'decimal:2',
        'price_child' => 'decimal:2',
        'group_discount_percentage' => 'decimal:2',
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];

    // Relations
    public function departure()
    {
        return $this->belongsTo(Destination::class, 'departure_id');
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    // Méthodes utilitaires
    
    /**
     * Vérifie si le tarif est applicable à une date donnée
     */
    public function isValidForDate($date)
    {
        $checkDate = is_string($date) ? \Carbon\Carbon::parse($date) : $date;
        
        if ($this->valid_from && $checkDate->lt($this->valid_from)) {
            return false;
        }
        
        if ($this->valid_to && $checkDate->gt($this->valid_to)) {
            return false;
        }
        
        return true;
    }

    /**
     * Vérifie si le tarif est applicable à un jour de la semaine
     */
    public function isValidForDay($dayName)
    {
        if (!$this->valid_days || empty($this->valid_days)) {
            return true; // Si aucun jour spécifié, applicable tous les jours
        }
        
        return in_array(strtolower($dayName), array_map('strtolower', $this->valid_days));
    }

    /**
     * Calcule le prix avec réduction groupe si applicable
     */
    public function calculatePrice($category = 'adult', $numberOfPassengers = 1)
    {
        $basePrice = 0;
        
        switch ($category) {
            case 'adult':
                $basePrice = $this->price_adult;
                break;
            case 'student':
                $basePrice = $this->price_student ?? $this->price_adult;
                break;
            case 'child':
                $basePrice = $this->price_child ?? $this->price_adult;
                break;
        }
        
        // Appliquer réduction groupe si conditions remplies
        if ($this->group_discount_percentage && 
            $this->group_discount_min_passengers && 
            $numberOfPassengers >= $this->group_discount_min_passengers) {
            $discount = ($basePrice * $this->group_discount_percentage) / 100;
            $basePrice -= $discount;
        }
        
        return $basePrice;
    }

    /**
     * Scope pour récupérer uniquement les tarifs actifs
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'actif');
    }

    /**
     * Scope pour récupérer les tarifs d'un trajet spécifique
     */
    public function scopeForRoute($query, $departureId, $destinationId)
    {
        return $query->where('departure_id', $departureId)
                     ->where('destination_id', $destinationId);
    }
}
