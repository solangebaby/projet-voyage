<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default admin user if not exists
        $adminEmail = 'admin@jadootravels.com';
        
        if (!User::where('email', $adminEmail)->exists()) {
            User::create([
                'name' => 'Admin',
                'first_name' => 'Super',
                'email' => $adminEmail,
                'password' => Hash::make('Admin@123456'),
                'phone' => '+237600000000',
                'cni_number' => 'ADMIN001',
                'civility' => 'Mr',
                'gender' => 'Male',
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            
            $this->command->info('✅ Admin user created successfully!');
            $this->command->info('Email: ' . $adminEmail);
            $this->command->info('Password: Admin@123456');
        } else {
            $this->command->info('ℹ️  Admin user already exists.');
        }
    }
}
