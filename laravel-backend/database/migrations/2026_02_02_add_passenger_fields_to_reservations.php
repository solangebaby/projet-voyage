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
        Schema::table('reservations', function (Blueprint $table) {
            // Rendre user_id nullable pour permettre réservations invités
            $table->foreignId('user_id')->nullable()->change();
            
            // Ajouter champs informations passager pour réservations invités
            $table->string('passenger_name')->nullable()->after('selected_seat');
            $table->string('passenger_email')->nullable()->after('passenger_name');
            $table->string('passenger_phone')->nullable()->after('passenger_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->dropColumn(['passenger_name', 'passenger_email', 'passenger_phone']);
        });
    }
};
