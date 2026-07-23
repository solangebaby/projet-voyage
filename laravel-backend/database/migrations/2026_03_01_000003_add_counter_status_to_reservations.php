<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'reserved_at_counter' and 'expired' to reservation status enum
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('pending','confirmed','cancelled','reserved_at_counter','expired') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending'");
    }
};
