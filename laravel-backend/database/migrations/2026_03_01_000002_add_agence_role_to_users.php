<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // For MySQL, modify the ENUM to include 'agence'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'voyageur', 'agence') NOT NULL DEFAULT 'voyageur'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'voyageur') NOT NULL DEFAULT 'voyageur'");
    }
};
