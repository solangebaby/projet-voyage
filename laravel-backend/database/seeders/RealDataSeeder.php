<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Destination;
use App\Models\Bus;
use App\Models\Trip;
use App\Models\Tarif;
use App\Models\Agency;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class RealDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clean existing data
        \App\Models\Reservation::truncate();
        \App\Models\Payment::truncate();
        \App\Models\Ticket::truncate();
        Trip::truncate();
        Tarif::truncate();
        \App\Models\Agency::truncate();
        Bus::truncate();
        Destination::truncate();
        User::where('email', '!=', 'admin@finexsvoyage.com')->delete();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@finexsvoyage.com'],
            [
                'name' => 'Admin Finexs',
                'phone' => '+237677123456',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // Create sample traveler
        User::firstOrCreate(
            ['email' => 'traveler@example.com'],
            [
                'name' => 'Jean Dupont',
                'phone' => '+237699876543',
                'password' => Hash::make('password123'),
                'role' => 'voyageur',
            ]
        );

        $this->command->info('Users created successfully!');

        // Create Real Cameroonian Cities
        $destinations = [
            [
                'city_name' => 'Yaoundé',
                'description' => 'Capital city of Cameroon, political and administrative center',
                'image' => 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800',
            ],
            [
                'city_name' => 'Douala',
                'description' => 'Economic capital and largest city of Cameroon',
                'image' => 'https://images.unsplash.com/photo-1523978591478-c753949ff840?w=800',
            ],
            [
                'city_name' => 'Bafoussam',
                'description' => 'Capital of the West Region, known for its coffee production',
                'image' => 'https://images.unsplash.com/photo-1564759298141-cef86f51d4d5?w=800',
            ],
            [
                'city_name' => 'Bamenda',
                'description' => 'Capital of the Northwest Region, beautiful highland city',
                'image' => 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
            ],
            [
                'city_name' => 'Garoua',
                'description' => 'Capital of the North Region, gateway to the northern regions',
                'image' => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            ],
            [
                'city_name' => 'Kribi',
                'description' => 'Coastal city with beautiful beaches and waterfalls',
                'image' => 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
            ],
            [
                'city_name' => 'Bertoua',
                'description' => 'Capital of the East Region, mining and agricultural center',
                'image' => 'https://images.unsplash.com/photo-1542407184-430f1362b27b?w=800',
            ],
            [
                'city_name' => 'Limbé',
                'description' => 'Coastal town at the foot of Mount Cameroon',
                'image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            ],
        ];

        $destinationModels = [];
        foreach ($destinations as $dest) {
            $destinationModels[$dest['city_name']] = Destination::create($dest);
        }

        $this->command->info('Destinations created successfully!');

        // Create Real Bus Fleet
        $buses = [
            [
                'bus_name' => 'VIP Express 001',
                'matricule' => 'LT-001-YA',
                'type' => 'vip',
                'total_seats' => 32,
                'price' => 7500,
                'features' => json_encode(['Air Conditioning', 'Reclining Seats', 'WiFi', 'USB Charging', 'Entertainment System']),
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 8,
                    'seatsPerRow' => 4,
                    'layout' => '2-2'
                ])
            ],
            [
                'bus_name' => 'Standard Express 001',
                'matricule' => 'LT-002-YA',
                'type' => 'standard',
                'total_seats' => 40,
                'price' => 5000,
                'features' => json_encode(['Air Conditioning', 'Comfortable Seats', 'Music System']),
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 10,
                    'seatsPerRow' => 4,
                    'layout' => '2-2'
                ])
            ],
            [
                'bus_name' => 'VIP Luxury 002',
                'matricule' => 'LT-003-DLA',
                'type' => 'vip',
                'total_seats' => 28,
                'price' => 8000,
                'features' => json_encode(['Premium Air Conditioning', 'Leather Seats', 'WiFi', 'USB Charging', 'Entertainment System', 'Onboard Refreshments']),
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 7,
                    'seatsPerRow' => 4,
                    'layout' => '2-2'
                ])
            ],
            [
                'bus_name' => 'Standard Express 002',
                'matricule' => 'LT-004-YA',
                'type' => 'standard',
                'total_seats' => 44,
                'price' => 5000,
                'features' => json_encode(['Air Conditioning', 'Comfortable Seats']),
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 11,
                    'seatsPerRow' => 4,
                    'layout' => '2-2'
                ])
            ],
            [
                'bus_name' => 'Economy Express 001',
                'matricule' => 'LT-005-BFM',
                'type' => 'standard',
                'total_seats' => 52,
                'price' => 4000,
                'features' => json_encode(['Ventilation', 'Basic Seats']),
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 13,
                    'seatsPerRow' => 4,
                    'layout' => '2-2'
                ])
            ],
        ];

        $busModels = [];
        foreach ($buses as $bus) {
            $busModels[] = Bus::create($bus);
        }

        $this->command->info('Buses created successfully!');

        // Create Agencies
        $this->call(AgenciesSeeder::class);

        // Create Routes with Real Tarifs
        $routes = [
            // Yaoundé routes
            ['from' => 'Yaoundé', 'to' => 'Douala', 'distance_km' => 250, 'duration_hours' => 3.5, 'standard_price' => 5000, 'vip_price' => 7500],
            ['from' => 'Yaoundé', 'to' => 'Bafoussam', 'distance_km' => 280, 'duration_hours' => 4.0, 'standard_price' => 5500, 'vip_price' => 8000],
            ['from' => 'Yaoundé', 'to' => 'Bamenda', 'distance_km' => 380, 'duration_hours' => 5.5, 'standard_price' => 7000, 'vip_price' => 10000],
            ['from' => 'Yaoundé', 'to' => 'Kribi', 'distance_km' => 180, 'duration_hours' => 2.5, 'standard_price' => 4000, 'vip_price' => 6000],
            ['from' => 'Yaoundé', 'to' => 'Bertoua', 'distance_km' => 350, 'duration_hours' => 5.0, 'standard_price' => 6500, 'vip_price' => 9500],
            
            // Douala routes
            ['from' => 'Douala', 'to' => 'Yaoundé', 'distance_km' => 250, 'duration_hours' => 3.5, 'standard_price' => 5000, 'vip_price' => 7500],
            ['from' => 'Douala', 'to' => 'Limbé', 'distance_km' => 70, 'duration_hours' => 1.0, 'standard_price' => 2000, 'vip_price' => 3000],
            ['from' => 'Douala', 'to' => 'Bafoussam', 'distance_km' => 200, 'duration_hours' => 3.0, 'standard_price' => 4500, 'vip_price' => 6500],
            ['from' => 'Douala', 'to' => 'Kribi', 'distance_km' => 160, 'duration_hours' => 2.5, 'standard_price' => 3500, 'vip_price' => 5500],
            
            // Bafoussam routes
            ['from' => 'Bafoussam', 'to' => 'Yaoundé', 'distance_km' => 280, 'duration_hours' => 4.0, 'standard_price' => 5500, 'vip_price' => 8000],
            ['from' => 'Bafoussam', 'to' => 'Douala', 'distance_km' => 200, 'duration_hours' => 3.0, 'standard_price' => 4500, 'vip_price' => 6500],
            ['from' => 'Bafoussam', 'to' => 'Bamenda', 'distance_km' => 120, 'duration_hours' => 2.0, 'standard_price' => 3000, 'vip_price' => 4500],
            
            // Bamenda routes
            ['from' => 'Bamenda', 'to' => 'Yaoundé', 'distance_km' => 380, 'duration_hours' => 5.5, 'standard_price' => 7000, 'vip_price' => 10000],
            ['from' => 'Bamenda', 'to' => 'Bafoussam', 'distance_km' => 120, 'duration_hours' => 2.0, 'standard_price' => 3000, 'vip_price' => 4500],
            ['from' => 'Bamenda', 'to' => 'Douala', 'distance_km' => 320, 'duration_hours' => 4.5, 'standard_price' => 6000, 'vip_price' => 9000],
        ];

        $this->command->info('Creating routes and tarifs...');

        foreach ($routes as $routeData) {
            $departure = $destinationModels[$routeData['from']];
            $destination = $destinationModels[$routeData['to']];

            // Create tarif for this route
            $tarif = Tarif::create([
                'departure_id' => $departure->id,
                'destination_id' => $destination->id,
                'distance_km' => $routeData['distance_km'],
                'duration_hours' => $routeData['duration_hours'],
                'base_price' => $routeData['standard_price'],
                'vip_price' => $routeData['vip_price'],
                'economy_price' => $routeData['standard_price'] - 1000,
                'currency' => 'XAF',
            ]);

            $this->command->info("Tarif created: {$routeData['from']} → {$routeData['to']}");
        }

        $this->command->info('Tarifs created successfully!');

        // Create Trips - For each route, create trips with ALL agency combinations
        $this->command->info('Creating trips with ALL agency combinations...');
        
        $today = now();
        $createdTrips = 0;
        
        // Create trips for the next 7 days
        for ($day = 0; $day < 7; $day++) {
            $date = $today->copy()->addDays($day);
            
            // For each route, create trips with different agency combinations
            foreach ($routes as $index => $routeData) {
                $departure = $destinationModels[$routeData['from']];
                $destination = $destinationModels[$routeData['to']];
                
                // Get ALL agencies for departure and arrival
                $departureAgencies = Agency::where('destination_id', $departure->id)->get();
                $arrivalAgencies = Agency::where('destination_id', $destination->id)->get();
                
                // Skip if no agencies found
                if ($departureAgencies->isEmpty() || $arrivalAgencies->isEmpty()) {
                    continue;
                }
                
                // Select bus based on route
                $busIndex = $index % count($busModels);
                $bus = $busModels[$busIndex];
                
                // Determine price based on bus type
                $price = match($bus->type) {
                    'vip' => $routeData['vip_price'],
                    default => $routeData['standard_price'],
                };
                
                // Define departure times
                $departureTimes = [
                    ['06:00:00', '09:30:00'],
                    ['09:00:00', '12:30:00'],
                    ['14:00:00', '17:30:00'],
                    ['18:00:00', '21:30:00'],
                ];
                
                // Create trips for EACH combination of agencies
                $timeIndex = 0;
                foreach ($departureAgencies as $depAgency) {
                    foreach ($arrivalAgencies as $arrAgency) {
                        // Use different time slots for different agency combinations
                        $times = $departureTimes[$timeIndex % count($departureTimes)];
                        
                        Trip::create([
                            'bus_id' => $bus->id,
                            'departure_id' => $departure->id,
                            'destination_id' => $destination->id,
                            'departure_agency_id' => $depAgency->id,
                            'arrival_agency_id' => $arrAgency->id,
                            'departure_date' => $date->format('Y-m-d'),
                            'departure_time' => $times[0],
                            'arrival_time' => $times[1],
                            'price' => $price,
                            'occupied_seats' => json_encode([]),
                            'status' => 'active',
                        ]);
                        $createdTrips++;
                        $timeIndex++;
                        
                        // Limit to avoid too many trips (optional)
                        if ($timeIndex >= 4) break 2; // Max 4 trips per route per day
                    }
                }
            }
        }

        $this->command->info('Trips created successfully!');
        $this->command->info('✅ Real data seeding completed!');
        $this->command->info('📊 Summary:');
        $this->command->info('   - Cities: ' . Destination::count());
        $this->command->info('   - Agencies: ' . Agency::count());
        $this->command->info('   - Buses: ' . Bus::count());
        $this->command->info('   - Tarifs: ' . Tarif::count());
        $this->command->info('   - Trips: ' . Trip::count());
        $this->command->info('');
        $this->command->info('👤 Admin Login:');
        $this->command->info('   Email: admin@finexsvoyage.com');
        $this->command->info('   Password: admin123');
    }
}
