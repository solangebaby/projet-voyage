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
            // Ajouter le champ sexe (genre)
            $table->enum('passenger_gender', ['M', 'F'])->nullable()->after('passenger_email');
            
            // Ajouter le champ CNI (Carte Nationale d'Identité)
            $table->string('passenger_cni', 20)->nullable()->after('passenger_gender');
            
            // Séparer passenger_name en first_name et last_name
            $table->string('passenger_first_name')->nullable()->after('selected_seat');
            $table->string('passenger_last_name')->nullable()->after('passenger_first_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['passenger_gender', 'passenger_cni', 'passenger_first_name', 'passenger_last_name']);
        });
    }
};
