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
        // Create agencies table
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained()->onDelete('cascade');
            $table->string('agency_name');
            $table->string('neighborhood'); // Quartier
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_main_station')->default(false);
            $table->timestamps();
        });

        // Add agency fields to trips
        Schema::table('trips', function (Blueprint $table) {
            $table->foreignId('departure_agency_id')->nullable()->after('departure_id')->constrained('agencies')->onDelete('set null');
            $table->foreignId('arrival_agency_id')->nullable()->after('destination_id')->constrained('agencies')->onDelete('set null');
        });

        // Add agency fields to reservations
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('departure_agency_id')->nullable()->after('trip_id')->constrained('agencies')->onDelete('set null');
            $table->foreignId('arrival_agency_id')->nullable()->after('departure_agency_id')->constrained('agencies')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['departure_agency_id']);
            $table->dropForeign(['arrival_agency_id']);
            $table->dropColumn(['departure_agency_id', 'arrival_agency_id']);
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->dropForeign(['departure_agency_id']);
            $table->dropForeign(['arrival_agency_id']);
            $table->dropColumn(['departure_agency_id', 'arrival_agency_id']);
        });

        Schema::dropIfExists('agencies');
    }
};
