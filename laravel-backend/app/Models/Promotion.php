<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'agency_id',
        'code',
        'description',
        'discount_type',
        'discount_value',
        'min_amount',
        'max_discount',
        'max_uses',
        'uses_count',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'valid_from'     => 'datetime',
        'valid_until'    => 'datetime',
        'is_active'      => 'boolean',
        'discount_value' => 'float',
        'min_amount'     => 'float',
        'max_discount'   => 'float',
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * Calculate the discounted amount for a given base amount.
     */
    public function applyTo(float $amount): float
    {
        if ($this->min_amount && $amount < $this->min_amount) {
            return $amount;
        }

        if ($this->discount_type === 'percent') {
            $discount = $amount * ($this->discount_value / 100);
            if ($this->max_discount) {
                $discount = min($discount, $this->max_discount);
            }
        } else {
            $discount = $this->discount_value;
        }

        return max(0, $amount - $discount);
    }

    /**
     * Check if this promotion is currently valid and usable.
     */
    public function isValid(): bool
    {
        if (!$this->is_active) return false;
        if ($this->max_uses && $this->uses_count >= $this->max_uses) return false;
        $now = now();
        if ($this->valid_from && $now->lt($this->valid_from)) return false;
        if ($this->valid_until && $now->gt($this->valid_until)) return false;
        return true;
    }
}
