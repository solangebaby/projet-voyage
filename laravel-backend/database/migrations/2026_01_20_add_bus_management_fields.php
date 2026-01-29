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
        // Add missing fields to buses table for fleet management
        Schema::table('buses', function (Blueprint $table) {
            $table->string('internal_number')->nullable()->after('bus_name')->comment('Numéro interne');
            $table->string('registration')->nullable()->after('internal_number')->comment('Immatriculation');
            $table->string('brand')->nullable()->after('registration')->comment('Marque');
            $table->integer('year')->nullable()->after('brand')->comment('Année');
            $table->enum('state', ['actif', 'en_maintenance', 'hors_service'])->default('actif')->after('type');
            $table->text('maintenance_note')->nullable()->after('state')->comment('Note de maintenance');
            $table->json('seat_configuration')->nullable()->after('total_seats')->comment('Configuration des sièges');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropColumn(['internal_number', 'registration', 'brand', 'year', 'state', 'maintenance_note', 'seat_configuration']);
        });
    }
};
