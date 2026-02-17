<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Destination;
use App\Models\Bus;
use App\Models\Trip;
use App\Models\User;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\Ticket;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting to seed test data...');

        // 1. Créer des destinations (villes)
        $this->command->info('📍 Creating destinations...');
        $destinations = [
            ['city_name' => 'Yaoundé', 'country' => 'Cameroon'],
            ['city_name' => 'Douala', 'country' => 'Cameroon'],
            ['city_name' => 'Bafoussam', 'country' => 'Cameroon'],
            ['city_name' => 'Bamenda', 'country' => 'Cameroon'],
            ['city_name' => 'Garoua', 'country' => 'Cameroon'],
            ['city_name' => 'Ngaoundéré', 'country' => 'Cameroon'],
        ];

        foreach ($destinations as $dest) {
            Destination::create($dest);
        }
        $this->command->info('✅ Created ' . count($destinations) . ' destinations');

        // 2. Créer des bus
        $this->command->info('🚌 Creating buses...');
        $buses = [
            [
                'bus_name' => 'VIP Express 001',
                'type' => 'vip',
                'matricule' => 'LT-2345-CE',
                'total_seats' => 40,
                'price' => 5000.00,
                'features' => json_encode(['AC', 'WiFi', 'Reclining Seats', 'TV', 'USB Charging'])
            ],
            [
                'bus_name' => 'VIP Express 002',
                'type' => 'vip',
                'matricule' => 'LT-5678-CE',
                'total_seats' => 40,
                'price' => 5000.00,
                'features' => json_encode(['AC', 'WiFi', 'Reclining Seats', 'TV', 'USB Charging'])
            ],
            [
                'bus_name' => 'Standard Plus 001',
                'type' => 'standard',
                'matricule' => 'LT-1234-CE',
                'total_seats' => 50,
                'price' => 3500.00,
                'features' => json_encode(['AC', 'USB Charging'])
            ],
            [
                'bus_name' => 'Standard Plus 002',
                'type' => 'standard',
                'matricule' => 'LT-9876-CE',
                'total_seats' => 50,
                'price' => 3500.00,
                'features' => json_encode(['AC', 'USB Charging'])
            ],
            [
                'bus_name' => 'Economy 001',
                'type' => 'standard',
                'matricule' => 'LT-4567-CE',
                'total_seats' => 60,
                'price' => 2500.00,
                'features' => json_encode(['Basic Comfort'])
            ],
        ];

        foreach ($buses as $bus) {
            Bus::create($bus);
        }
        $this->command->info('✅ Created ' . count($buses) . ' buses');

        // 3. Créer des utilisateurs (admin + voyageurs)
        $this->command->info('👥 Creating users...');
        
        // Admin (si n'existe pas déjà)
        if (!User::where('email', 'admin@kctrip.com')->exists()) {
            User::create([
                'name' => 'Admin KCTrip',
                'email' => 'admin@kctrip.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '+237 6XX XXX XXX'
            ]);
            $this->command->info('✅ Created admin user (email: admin@kctrip.com, password: admin123)');
        }

        // Voyageurs de test
        $travelers = [
            [
                'name' => 'Jean Dupont',
                'email' => 'jean@example.com',
                'password' => Hash::make('password'),
                'role' => 'voyageur',
                'phone' => '+237 677123456'
            ],
            [
                'name' => 'Marie Kamga',
                'email' => 'marie@example.com',
                'password' => Hash::make('password'),
                'role' => 'voyageur',
                'phone' => '+237 699234567'
            ],
            [
                'name' => 'Paul Mbida',
                'email' => 'paul@example.com',
                'password' => Hash::make('password'),
                'role' => 'voyageur',
                'phone' => '+237 655345678'
            ],
        ];

        foreach ($travelers as $traveler) {
            if (!User::where('email', $traveler['email'])->exists()) {
                User::create($traveler);
            }
        }
        $this->command->info('✅ Created ' . count($travelers) . ' traveler users');

        // 4. Créer des trips (voyages)
        $this->command->info('🎫 Creating trips...');
        
        // Récupérer les destinations
        $yaounde = Destination::where('city_name', 'Yaoundé')->first();
        $douala = Destination::where('city_name', 'Douala')->first();
        $bafoussam = Destination::where('city_name', 'Bafoussam')->first();
        $bamenda = Destination::where('city_name', 'Bamenda')->first();
        
        $routes = [
            ['departure_id' => $yaounde->id, 'destination_id' => $douala->id],
            ['departure_id' => $douala->id, 'destination_id' => $yaounde->id],
            ['departure_id' => $yaounde->id, 'destination_id' => $bafoussam->id],
            ['departure_id' => $bafoussam->id, 'destination_id' => $yaounde->id],
            ['departure_id' => $douala->id, 'destination_id' => $bamenda->id],
            ['departure_id' => $bamenda->id, 'destination_id' => $douala->id],
        ];

        $times = [
            ['departure_time' => '06:00:00', 'arrival_time' => '10:00:00'],
            ['departure_time' => '08:00:00', 'arrival_time' => '12:00:00'],
            ['departure_time' => '10:00:00', 'arrival_time' => '14:00:00'],
            ['departure_time' => '14:00:00', 'arrival_time' => '18:00:00'],
            ['departure_time' => '16:00:00', 'arrival_time' => '20:00:00'],
        ];

        $allBuses = Bus::all();
        $tripCount = 0;

        // Créer des trips pour les 7 prochains jours
        for ($day = 0; $day < 7; $day++) {
            $date = Carbon::now()->addDays($day);

            foreach ($routes as $route) {
                foreach ($times as $time) {
                    // Alterner entre les bus
                    $bus = $allBuses->random();
                    
                    Trip::create([
                        'bus_id' => $bus->id,
                        'departure_id' => $route['departure_id'],
                        'destination_id' => $route['destination_id'],
                        'departure_date' => $date->format('Y-m-d'),
                        'departure_time' => $time['departure_time'],
                        'arrival_date' => $date->format('Y-m-d'),
                        'arrival_time' => $time['arrival_time'],
                        'available_seats' => $bus->total_seats,
                        'status' => 'active'
                    ]);
                    $tripCount++;
                }
            }
        }
        $this->command->info('✅ Created ' . $tripCount . ' trips');

        // 5. Créer quelques réservations de test (commenté car structure de réservation peut être différente)
        $this->command->info('📋 Skipping sample reservations (can be added manually via app)...');

        $this->command->info('');
        $this->command->info('🎉 ========================================');
        $this->command->info('🎉  Test data seeding completed!');
        $this->command->info('🎉 ========================================');
        $this->command->info('');
        $this->command->info('📊 Summary:');
        $this->command->info('   - Destinations: ' . Destination::count());
        $this->command->info('   - Buses: ' . Bus::count());
        $this->command->info('   - Trips: ' . Trip::count());
        $this->command->info('   - Users: ' . User::count());
        $this->command->info('   - Reservations: ' . Reservation::count());
        $this->command->info('');
        $this->command->info('🔐 Login Credentials:');
        $this->command->info('   Admin: admin@kctrip.com / admin123');
        $this->command->info('   User: jean@example.com / password');
        $this->command->info('');
    }
}
