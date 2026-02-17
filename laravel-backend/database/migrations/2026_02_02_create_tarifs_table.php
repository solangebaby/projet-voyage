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
        Schema::create('tarifs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('departure_id')->constrained('destinations')->onDelete('cascade');
            $table->foreignId('destination_id')->constrained('destinations')->onDelete('cascade');
            
            // Route information
            $table->decimal('distance_km', 8, 2)->nullable(); // Distance en km
            $table->decimal('duration_hours', 5, 2)->nullable(); // Durée en heures
            
            // Pricing by bus type
            $table->decimal('base_price', 10, 2); // Prix de base (standard)
            $table->decimal('vip_price', 10, 2)->nullable(); // Prix VIP
            $table->decimal('economy_price', 10, 2)->nullable(); // Prix économique
            $table->string('currency', 10)->default('XAF'); // Devise
            
            // Optional fields for future enhancements
            $table->string('name')->nullable(); // Nom du tarif
            $table->decimal('price_student', 10, 2)->nullable(); // Prix étudiant
            $table->decimal('price_child', 10, 2)->nullable(); // Prix enfant
            $table->date('valid_from')->nullable(); // Date début validité
            $table->date('valid_to')->nullable(); // Date fin validité
            $table->json('valid_days')->nullable(); // Jours applicables
            $table->enum('time_period', ['all', 'day', 'night'])->default('all'); // Période
            $table->decimal('group_discount_percentage', 5, 2)->nullable(); // % réduction groupe
            $table->integer('group_discount_min_passengers')->nullable(); // Min passagers pour réduction
            
            // Statut
            $table->enum('status', ['actif', 'inactif'])->default('actif');
            
            $table->timestamps();
            
            // Index pour performance
            $table->index(['departure_id', 'destination_id', 'status']);
        });
        
        // Ajouter colonne tarif_id à la table trips
        Schema::table('trips', function (Blueprint $table) {
            $table->foreignId('tarif_id')->nullable()->after('destination_id')->constrained('tarifs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropForeign(['tarif_id']);
            $table->dropColumn('tarif_id');
        });
        
        Schema::dropIfExists('tarifs');
    }
};
