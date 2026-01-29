<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add missing fields to trips table for route management
        Schema::table('trips', function (Blueprint $table) {
            $table->decimal('distance', 8, 2)->nullable()->after('arrival_time')->comment('Distance en km');
            $table->string('duration')->nullable()->after('distance')->comment('Durée estimée HH:MM');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn(['distance', 'duration']);
        });
    }
};
