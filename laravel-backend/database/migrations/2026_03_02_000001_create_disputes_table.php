<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('agency_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('reservation_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['cancellation', 'delay', 'overcharge', 'quality', 'lost_luggage', 'other'])->default('other');
            $table->string('subject');
            $table->text('description');
            $table->enum('status', ['open', 'in_review', 'resolved', 'closed', 'rejected'])->default('open');
            $table->text('resolution')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
