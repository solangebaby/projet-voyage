<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Destination;
use App\Models\Bus;
use App\Models\Trip;
use App\Models\Tarif;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class CompleteDataSeeder extends Seeder
{
    /**
     * Run the database seeds - Peuple complètement la base de données
     */
    public function run(): void
    {
        $this->command->info('🚀 Début du peuplement de la base de données...');

        // 1. UTILISATEURS
        $this->command->info('👤 Création des utilisateurs...');
        
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@jadootravels.com'],
            [
                'name' => 'Admin',
                'first_name' => 'Super',
                'password' => Hash::make('password123'),
                'phone' => '+237600000000',
                'cni_number' => 'ADM001',
                'civility' => 'Mr',
                'gender' => 'Male',
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Voyageurs de test
        User::updateOrCreate(
            ['email' => 'voyageur@example.com'],
            [
                'name' => 'Dupont',
                'first_name' => 'Jean',
                'password' => Hash::make('password123'),
                'phone' => '+237612345678',
                'cni_number' => '123456789',
                'civility' => 'Mr',
                'gender' => 'Male',
                'role' => 'voyageur',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'marie@example.com'],
            [
                'name' => 'Martin',
                'first_name' => 'Marie',
                'password' => Hash::make('password123'),
                'phone' => '+237698765432',
                'cni_number' => '987654321',
                'civility' => 'Mrs',
                'gender' => 'Female',
                'role' => 'voyageur',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ 3 utilisateurs créés');

        // 2. VILLES / DESTINATIONS
        $this->command->info('🌍 Création des villes...');
        
        $cities = [
            ['city_name' => 'Yaoundé', 'region' => 'Centre', 'country' => 'Cameroun', 'status' => 'actif'],
            ['city_name' => 'Douala', 'region' => 'Littoral', 'country' => 'Cameroun', 'status' => 'actif'],
            ['city_name' => 'Bafoussam', 'region' => 'Ouest', 'country' => 'Cameroun', 'status' => 'actif'],
            ['city_name' => 'Bamenda', 'region' => 'Nord-Ouest', 'country' => 'Cameroun', 'status' => 'actif'],
            ['city_name' => 'Garoua', 'region' => 'Nord', 'country' => 'Cameroun', 'status' => 'actif'],
            ['city_name' => 'Ngaoundéré', 'region' => 'Adamaoua', 'country' => 'Cameroun', 'status' => 'actif'],
            ['city_name' => 'Buea', 'region' => 'Sud-Ouest', 'country' => 'Cameroun', 'status' => 'actif'],
            ['city_name' => 'Bertoua', 'region' => 'Est', 'country' => 'Cameroun', 'status' => 'actif'],
        ];

        foreach ($cities as $city) {
            Destination::updateOrCreate(['city_name' => $city['city_name']], $city);
        }

        $this->command->info('✅ 8 villes créées');

        // 3. BUS / FLOTTE
        $this->command->info('🚌 Création de la flotte de bus...');
        
        // Colonnes disponibles: bus_name, matricule, type, total_seats, price, features, 
        // internal_number, registration, brand, year, state, maintenance_note, seat_configuration
        $buses = [
            [
                'bus_name' => 'Express Cameroun 001',
                'matricule' => 'LT-2345-CM',
                'type' => 'standard',
                'total_seats' => 45,
                'price' => 2500,
                'features' => ['Climatisation', 'Sièges confortables', 'Assurance incluse'],
                'internal_number' => 'EC001',
                'registration' => 'LT-2345-CM',
                'brand' => 'Mercedes-Benz',
                'year' => 2022,
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 12,
                    'columns' => 4,
                    'layout' => '2-2'
                ]),
            ],
            [
                'bus_name' => 'VIP Travel 002',
                'matricule' => 'LT-5678-CM',
                'type' => 'vip',
                'total_seats' => 30,
                'price' => 4500,
                'features' => ['WiFi gratuit', 'Sièges inclinables', 'Rafraîchissements', 'Prises USB'],
                'internal_number' => 'VIP002',
                'registration' => 'LT-5678-CM',
                'brand' => 'Volvo',
                'year' => 2023,
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 10,
                    'columns' => 3,
                    'layout' => '1-2'
                ]),
            ],
            [
                'bus_name' => 'Express Cameroun 003',
                'matricule' => 'CE-9012-CM',
                'type' => 'standard',
                'total_seats' => 40,
                'price' => 2500,
                'features' => ['Climatisation', 'Radio', 'Assurance'],
                'internal_number' => 'EC003',
                'registration' => 'CE-9012-CM',
                'brand' => 'Iveco',
                'year' => 2021,
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 11,
                    'columns' => 4,
                    'layout' => '2-2'
                ]),
            ],
            [
                'bus_name' => 'Luxury Express 004',
                'matricule' => 'LT-3456-CM',
                'type' => 'vip',
                'total_seats' => 35,
                'price' => 4500,
                'features' => ['WiFi', 'Toilettes', 'Écran TV', 'Climatisation VIP'],
                'internal_number' => 'LUX004',
                'registration' => 'LT-3456-CM',
                'brand' => 'Mercedes-Benz',
                'year' => 2023,
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 12,
                    'columns' => 3,
                    'layout' => '1-2'
                ]),
            ],
            [
                'bus_name' => 'Budget Travel 005',
                'matricule' => 'CE-7890-CM',
                'type' => 'standard',
                'total_seats' => 50,
                'price' => 2000,
                'features' => ['Climatisation', 'Assurance'],
                'internal_number' => 'BT005',
                'registration' => 'CE-7890-CM',
                'brand' => 'Hyundai',
                'year' => 2020,
                'state' => 'actif',
                'seat_configuration' => json_encode([
                    'rows' => 13,
                    'columns' => 4,
                    'layout' => '2-2'
                ]),
            ],
        ];

        foreach ($buses as $bus) {
            Bus::updateOrCreate(['matricule' => $bus['matricule']], $bus);
        }

        $this->command->info('✅ 5 bus créés');

        // 4. TARIFS
        $this->command->info('💰 Création des tarifs...');
        
        // Récupérer les IDs des villes
        $yaounde = Destination::where('city_name', 'Yaoundé')->first();
        $douala = Destination::where('city_name', 'Douala')->first();
        $bafoussam = Destination::where('city_name', 'Bafoussam')->first();
        $garoua = Destination::where('city_name', 'Garoua')->first();

        $tarifs = [
            [
                'name' => 'Tarif Standard Yaoundé-Douala',
                'departure_id' => $yaounde->id,
                'destination_id' => $douala->id,
                'price_adult' => 2500,
                'price_student' => 2000,
                'price_child' => 1500,
                'valid_from' => Carbon::now()->subDays(30),
                'valid_to' => Carbon::now()->addMonths(6),
                'valid_days' => null,
                'time_period' => 'all',
                'group_discount_percentage' => 10,
                'group_discount_min_passengers' => 10,
                'status' => 'actif',
            ],
            [
                'name' => 'Tarif Standard Douala-Yaoundé',
                'departure_id' => $douala->id,
                'destination_id' => $yaounde->id,
                'price_adult' => 2500,
                'price_student' => 2000,
                'price_child' => 1500,
                'valid_from' => Carbon::now()->subDays(30),
                'valid_to' => Carbon::now()->addMonths(6),
                'valid_days' => null,
                'time_period' => 'all',
                'group_discount_percentage' => 10,
                'group_discount_min_passengers' => 10,
                'status' => 'actif',
            ],
            [
                'name' => 'Tarif VIP Yaoundé-Douala',
                'departure_id' => $yaounde->id,
                'destination_id' => $douala->id,
                'price_adult' => 4500,
                'price_student' => 3500,
                'price_child' => 2500,
                'valid_from' => Carbon::now()->subDays(30),
                'valid_to' => Carbon::now()->addMonths(6),
                'valid_days' => null,
                'time_period' => 'all',
                'group_discount_percentage' => 15,
                'group_discount_min_passengers' => 8,
                'status' => 'actif',
            ],
            [
                'name' => 'Tarif Yaoundé-Bafoussam',
                'departure_id' => $yaounde->id,
                'destination_id' => $bafoussam->id,
                'price_adult' => 3500,
                'price_student' => 2800,
                'price_child' => 2000,
                'valid_from' => Carbon::now()->subDays(30),
                'valid_to' => Carbon::now()->addMonths(6),
                'valid_days' => null,
                'time_period' => 'all',
                'group_discount_percentage' => 12,
                'group_discount_min_passengers' => 8,
                'status' => 'actif',
            ],
            [
                'name' => 'Tarif Yaoundé-Garoua',
                'departure_id' => $yaounde->id,
                'destination_id' => $garoua->id,
                'price_adult' => 8500,
                'price_student' => 7000,
                'price_child' => 5000,
                'valid_from' => Carbon::now()->subDays(30),
                'valid_to' => Carbon::now()->addMonths(6),
                'valid_days' => null,
                'time_period' => 'all',
                'group_discount_percentage' => 15,
                'group_discount_min_passengers' => 10,
                'status' => 'actif',
            ],
        ];

        foreach ($tarifs as $tarif) {
            Tarif::updateOrCreate(
                [
                    'departure_id' => $tarif['departure_id'],
                    'destination_id' => $tarif['destination_id'],
                    'name' => $tarif['name']
                ],
                $tarif
            );
        }

        $this->command->info('✅ 5 tarifs créés');

        // 5. VOYAGES / TRIPS
        $this->command->info('🎫 Création des voyages...');
        
        // Récupérer les bus et tarifs
        $bus1 = Bus::where('matricule', 'LT-2345-CM')->first();
        $bus2 = Bus::where('matricule', 'LT-5678-CM')->first();
        $bus3 = Bus::where('matricule', 'CE-9012-CM')->first();
        $bus4 = Bus::where('matricule', 'LT-3456-CM')->first();

        $tarif1 = Tarif::where('name', 'Tarif Standard Yaoundé-Douala')->first();
        $tarif2 = Tarif::where('name', 'Tarif Standard Douala-Yaoundé')->first();
        $tarif3 = Tarif::where('name', 'Tarif VIP Yaoundé-Douala')->first();

        // Créer des voyages pour les 7 prochains jours
        $trips = [];
        
        for ($i = 0; $i < 7; $i++) {
            $date = Carbon::now()->addDays($i)->format('Y-m-d');
            
            // Yaoundé -> Douala (3 départs par jour)
            $trips[] = [
                'bus_id' => $bus1->id,
                'departure_id' => $yaounde->id,
                'destination_id' => $douala->id,
                'tarif_id' => $tarif1->id,
                'departure_date' => $date,
                'departure_time' => '06:00',
                'arrival_date' => $date,
                'arrival_time' => '10:00',
                'available_seats' => $bus1->total_seats,
                'occupied_seats' => json_encode([]),
                'distance_km' => 250,
                'status' => 'active',
            ];

            $trips[] = [
                'bus_id' => $bus3->id,
                'departure_id' => $yaounde->id,
                'destination_id' => $douala->id,
                'tarif_id' => $tarif1->id,
                'departure_date' => $date,
                'departure_time' => '12:00',
                'arrival_date' => $date,
                'arrival_time' => '16:00',
                'available_seats' => $bus3->total_seats,
                'occupied_seats' => json_encode([]),
                'distance_km' => 250,
                'status' => 'active',
            ];

            $trips[] = [
                'bus_id' => $bus2->id,
                'departure_id' => $yaounde->id,
                'destination_id' => $douala->id,
                'tarif_id' => $tarif3->id,
                'departure_date' => $date,
                'departure_time' => '18:00',
                'arrival_date' => $date,
                'arrival_time' => '22:00',
                'available_seats' => $bus2->total_seats,
                'occupied_seats' => json_encode([]),
                'distance_km' => 250,
                'status' => 'active',
            ];

            // Douala -> Yaoundé (2 départs par jour)
            $trips[] = [
                'bus_id' => $bus1->id,
                'departure_id' => $douala->id,
                'destination_id' => $yaounde->id,
                'tarif_id' => $tarif2->id,
                'departure_date' => $date,
                'departure_time' => '08:00',
                'arrival_date' => $date,
                'arrival_time' => '12:00',
                'available_seats' => $bus1->total_seats,
                'occupied_seats' => json_encode([]),
                'distance_km' => 250,
                'status' => 'active',
            ];

            $trips[] = [
                'bus_id' => $bus4->id,
                'departure_id' => $douala->id,
                'destination_id' => $yaounde->id,
                'tarif_id' => $tarif2->id,
                'departure_date' => $date,
                'departure_time' => '16:00',
                'arrival_date' => $date,
                'arrival_time' => '20:00',
                'available_seats' => $bus4->total_seats,
                'occupied_seats' => json_encode([]),
                'distance_km' => 250,
                'status' => 'active',
            ];
        }

        foreach ($trips as $trip) {
            Trip::create($trip);
        }

        $this->command->info('✅ ' . count($trips) . ' voyages créés (7 jours × 5 départs/jour)');

        $this->command->info('');
        $this->command->info('🎉 Base de données peuplée avec succès !');
        $this->command->info('');
        $this->command->info('📊 Résumé:');
        $this->command->info('   👤 Utilisateurs: 3 (1 admin, 2 voyageurs)');
        $this->command->info('   🌍 Villes: 8');
        $this->command->info('   🚌 Bus: 5');
        $this->command->info('   💰 Tarifs: 5');
        $this->command->info('   🎫 Voyages: ' . count($trips));
        $this->command->info('');
        $this->command->info('🔐 Comptes de test:');
        $this->command->info('   Admin: admin@jadootravels.com / password123');
        $this->command->info('   Voyageur 1: voyageur@example.com / password123');
        $this->command->info('   Voyageur 2: marie@example.com / password123');
    }
}
