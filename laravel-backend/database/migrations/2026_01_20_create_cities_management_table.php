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
        // Add missing columns to destinations table
        Schema::table('destinations', function (Blueprint $table) {
            $table->string('region')->nullable()->after('city_name');
            $table->string('country')->default('Cameroun')->after('region');
            $table->enum('status', ['actif', 'inactif'])->default('actif')->after('country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn(['region', 'country', 'status']);
        });
    }
};
