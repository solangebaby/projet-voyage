<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add a partial unique constraint: only one confirmed/pending reservation per seat per trip
        // We use a regular index here for performance; the real lock is lockForUpdate() in ReservationController
        Schema::table('reservations', function (Blueprint $table) {
            $table->index(['trip_id', 'selected_seat'], 'idx_trip_seat');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex('idx_trip_seat');
        });
    }
};
