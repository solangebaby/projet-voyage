<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            // Link trip directly to owning agency
            $table->unsignedBigInteger('agency_id')->nullable()->after('id');
            $table->foreign('agency_id')->references('id')->on('agencies')->onDelete('set null');

            // Validation workflow: draft → pending_validation → active → completed/cancelled/rejected
            $table->enum('validation_status', [
                'draft',
                'pending_validation',
                'active',
                'rejected',
                'completed',
                'cancelled'
            ])->default('draft')->after('status');

            $table->text('rejection_reason')->nullable()->after('validation_status');
            $table->timestamp('submitted_at')->nullable()->after('rejection_reason');
            $table->timestamp('validated_at')->nullable()->after('submitted_at');
            $table->unsignedBigInteger('validated_by')->nullable()->after('validated_at');
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropForeign(['agency_id']);
            $table->dropColumn(['agency_id', 'validation_status', 'rejection_reason', 'submitted_at', 'validated_at', 'validated_by']);
        });
    }
};
