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
            $table->enum('ticket_type', ['standard', 'vip'])->default('standard')->after('selected_seat');
        });
        
        Schema::table('tickets', function (Blueprint $table) {
            $table->enum('ticket_type', ['standard', 'vip'])->default('standard')->after('ticket_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('ticket_type');
        });
        
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('ticket_type');
        });
    }
};
