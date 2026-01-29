<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Destination;
use App\Models\Bus;
use App\Models\Trip;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'first_name' => 'System',
            'email' => 'admin@jadoo.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Create test voyageur
        User::create([
            'name' => 'Dupont',
            'first_name' => 'Jean',
            'email' => 'jean@example.com',
            'password' => Hash::make('password'),
            'phone' => '+237612345678',
            'cni_number' => '123456789',
            'role' => 'voyageur',
            'status' => 'active',
        ]);

        // Create destinations
        $destinations = ['Douala', 'Yaoundé', 'Bafoussam', 'Buea', 'Ngaoundéré', 'Bertoua'];
        foreach ($destinations as $city) {
            Destination::create(['city_name' => $city]);
        }

        // Create buses
        Bus::create([
            'bus_name' => 'Express Cameroon',
            'matricule' => 'CE-001',
            'type' => 'standard',
            'total_seats' => 45,
            'price' => 5000,
            'features' => ['Comfortable seats', 'Insurance included', 'Air conditioning']
        ]);

        Bus::create([
            'bus_name' => 'Luxury Travel VIP',
            'matricule' => 'VIP-001',
            'type' => 'vip',
            'total_seats' => 30,
            'price' => 12000,
            'features' => ['Free WiFi', 'Refreshments', 'Reclining seats', 'Priority boarding']
        ]);

        // Create sample trips
        Trip::create([
            'bus_id' => 1,
            'departure_id' => 1, // Douala
            'destination_id' => 2, // Yaoundé
            'departure_date' => '2026-02-20',
            'departure_time' => '07:00',
            'arrival_date' => '2026-02-20',
            'arrival_time' => '10:00',
            'available_seats' => 45,
            'occupied_seats' => [],
            'distance_km' => 250,
            'status' => 'active'
        ]);

        Trip::create([
            'bus_id' => 2,
            'departure_id' => 2, // Yaoundé
            'destination_id' => 1, // Douala
            'departure_date' => '2026-02-20',
            'departure_time' => '14:00',
            'arrival_date' => '2026-02-20',
            'arrival_time' => '17:30',
            'available_seats' => 30,
            'occupied_seats' => [],
            'distance_km' => 250,
            'status' => 'active'
        ]);
    }
}
