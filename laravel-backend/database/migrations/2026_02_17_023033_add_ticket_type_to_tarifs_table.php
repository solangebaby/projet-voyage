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
        Schema::table('tarifs', function (Blueprint $table) {
            $table->enum('ticket_type', ['standard', 'vip'])->default('standard')->after('destination_id');
            $table->decimal('price', 10, 2)->default(0)->after('ticket_type'); // Single price field
            $table->text('description')->nullable()->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tarifs', function (Blueprint $table) {
            $table->dropColumn(['ticket_type', 'price', 'description']);
        });
    }
};
