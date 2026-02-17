<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Make user_id nullable (robust for MySQL without doctrine/dbal)
        if (Schema::hasColumn('comments', 'user_id')) {
            // Drop FK if exists (name may vary; this is best-effort)
            try {
                DB::statement('ALTER TABLE `comments` DROP FOREIGN KEY `comments_user_id_foreign`');
            } catch (\Throwable $e) {
                // ignore if FK name differs or already dropped
            }

            // Make column nullable
            try {
                DB::statement('ALTER TABLE `comments` MODIFY `user_id` BIGINT UNSIGNED NULL');
            } catch (\Throwable $e) {
                // ignore
            }

            // Re-add FK (nullable allowed)
            try {
                DB::statement('ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE');
            } catch (\Throwable $e) {
                // ignore
            }
        }

        // 2) Add guest fields
        Schema::table('comments', function (Blueprint $table) {
            if (!Schema::hasColumn('comments', 'guest_name')) {
                $table->string('guest_name')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('comments', 'guest_email')) {
                $table->string('guest_email')->nullable()->after('guest_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            if (Schema::hasColumn('comments', 'guest_name')) {
                $table->dropColumn('guest_name');
            }
            if (Schema::hasColumn('comments', 'guest_email')) {
                $table->dropColumn('guest_email');
            }
        });

        // Best-effort revert user_id to NOT NULL
        try {
            DB::statement('ALTER TABLE `comments` MODIFY `user_id` BIGINT UNSIGNED NOT NULL');
        } catch (\Throwable $e) {
            // ignore
        }
    }
};
