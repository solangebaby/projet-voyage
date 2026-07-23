<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Agency;
use App\Models\Destination;
use App\Models\Bus;
use App\Models\Trip;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\Ticket;
use Carbon\Carbon;

class MarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Ticket::truncate();
        Payment::truncate();
        Reservation::truncate();
        Trip::truncate();
        Bus::truncate();
        Agency::truncate();
        Destination::truncate();
        User::where('role', '!=', 'admin')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ── 1. ADMIN ──────────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@marketplace.cm'],
            [
                'name'       => 'Administrateur',
                'first_name' => 'Super',
                'password'   => Hash::make('password'),
                'role'       => 'admin',
                'status'     => 'active',
                'phone'      => '699000000',
            ]
        );

        // ── 2. DESTINATIONS ───────────────────────────────────────────────────
        $cities = [
            ['city_name' => 'Douala',     'region' => 'Littoral',   'country' => 'Cameroun'],
            ['city_name' => 'Yaoundé',    'region' => 'Centre',     'country' => 'Cameroun'],
            ['city_name' => 'Bafoussam',  'region' => 'Ouest',      'country' => 'Cameroun'],
            ['city_name' => 'Limbé',      'region' => 'Sud-Ouest',  'country' => 'Cameroun'],
            ['city_name' => 'Bamenda',    'region' => 'Nord-Ouest', 'country' => 'Cameroun'],
            ['city_name' => 'Garoua',     'region' => 'Nord',       'country' => 'Cameroun'],
            ['city_name' => 'Ngaoundéré', 'region' => 'Adamaoua',   'country' => 'Cameroun'],
            ['city_name' => 'Kribi',      'region' => 'Sud',        'country' => 'Cameroun'],
        ];

        $destinations = [];
        foreach ($cities as $city) {
            $destinations[$city['city_name']] = Destination::create($city);
        }

        // ── 3. AGENCY USERS & AGENCIES ────────────────────────────────────────
        $agencyData = [
            [
                'user' => [
                    'name' => 'Général Voyage', 'first_name' => 'Agence',
                    'email' => 'agence@general-voyage.cm', 'phone' => '650100001',
                    'password' => Hash::make('password'), 'role' => 'agence', 'status' => 'active',
                ],
                'agency' => [
                    'agency_name' => 'Général Voyage', 'neighborhood' => 'Akwa',
                    'address' => 'Rue de la Gare, Akwa', 'phone' => '650100001',
                    'is_main_station' => true, 'city' => 'Douala',
                ],
            ],
            [
                'user' => [
                    'name' => 'Touristique Express', 'first_name' => 'Agence',
                    'email' => 'agence@touristique-express.cm', 'phone' => '655200002',
                    'password' => Hash::make('password'), 'role' => 'agence', 'status' => 'active',
                ],
                'agency' => [
                    'agency_name' => 'Touristique Express', 'neighborhood' => 'Biyem-Assi',
                    'address' => "Avenue de l'Indépendance", 'phone' => '655200002',
                    'is_main_station' => true, 'city' => 'Yaoundé',
                ],
            ],
            [
                'user' => [
                    'name' => 'Confort Voyages', 'first_name' => 'Agence',
                    'email' => 'agence@confort-voyages.cm', 'phone' => '680300003',
                    'password' => Hash::make('password'), 'role' => 'agence', 'status' => 'active',
                ],
                'agency' => [
                    'agency_name' => 'Confort Voyages', 'neighborhood' => 'Marché B',
                    'address' => 'Boulevard des Aliments', 'phone' => '680300003',
                    'is_main_station' => false, 'city' => 'Bafoussam',
                ],
            ],
        ];

        $agencies = [];
        foreach ($agencyData as $data) {
            $user = User::create($data['user']);
            $city = $data['agency']['city'];
            unset($data['agency']['city']);
            $agency = Agency::create(array_merge($data['agency'], [
                'user_id'        => $user->id,
                'destination_id' => $destinations[$city]->id,
            ]));
            $agencies[] = $agency;
        }

        // Agences d'arrivée (Simplifié pour le test)
        $arrivalAgencies = [];
        $arrivalAgencies['gv_yde'] = Agency::create(['user_id' => $agencies[0]->user_id, 'destination_id' => $destinations['Yaoundé']->id, 'agency_name' => 'Général - Yaoundé', 'neighborhood' => 'Mvan', 'address' => 'Mvan', 'phone' => '650100002', 'is_main_station' => false]);
        $arrivalAgencies['te_dla'] = Agency::create(['user_id' => $agencies[1]->user_id, 'destination_id' => $destinations['Douala']->id, 'agency_name' => 'Touristique - Douala', 'neighborhood' => 'Bonabéri', 'address' => 'Bonabéri', 'phone' => '655200003', 'is_main_station' => false]);
        $arrivalAgencies['cv_kribi'] = Agency::create(['user_id' => $agencies[2]->user_id, 'destination_id' => $destinations['Kribi']->id, 'agency_name' => 'Confort - Kribi', 'neighborhood' => 'Plage', 'address' => 'Kribi', 'phone' => '680300006', 'is_main_station' => false]);

        // ── 4. BUSES ──────────────────────────────────────────────────────────
        $buses = [];
        $buses[] = Bus::create(['bus_name' => 'Touristique-Express ', 'matricule' => 'LT-2024-001', 'brand' => 'Mercedes', 'type' => 'standard', 'total_seats' => 32, 'price' => 5000, 'features' => json_encode(['Climatisation']), 'state' => 'actif', 'year' => 2022, 'seat_configuration' => json_encode(['rows' => 8, 'cols' => 4])]);
           $buses[] = Bus::create(['bus_name' => 'Général-voyage ', 'matricule' => 'Lp-2024-008', 'brand' => 'Mercedes', 'type' => 'standard', 'total_seats' => 32, 'price' => 5000, 'features' => json_encode(['Climatisation']), 'state' => 'actif', 'year' => 2022, 'seat_configuration' => json_encode(['rows' => 8, 'cols' => 4])]);
              $buses[] = Bus::create(['bus_name' => 'Confort-voyage', 'matricule' => 'LT-2024-007', 'brand' => 'Mercedes', 'type' => 'standard', 'total_seats' => 32, 'price' => 5000, 'features' => json_encode(['Climatisation']), 'state' => 'actif', 'year' => 2022, 'seat_configuration' => json_encode(['rows' => 8, 'cols' => 4])]);
        $buses[] = Bus::create(['bus_name' => 'Lion VIP 1', 'matricule' => 'LT-2024-002', 'brand' => 'Toyota', 'type' => 'vip', 'total_seats' => 16, 'price' => 12000, 'features' => json_encode(['VIP']), 'state' => 'actif', 'year' => 2023, 'seat_configuration' => json_encode(['rows' => 4, 'cols' => 4])]);

        // ── 5. TRIPS ──────────────────────────────────────────────────────────
        $routes = [
            ['bus' => $buses[0], 'dep' => 'Douala', 'dest' => 'Yaoundé', 'dep_agency' => $agencies[0], 'arr_agency' => $arrivalAgencies['gv_yde'], 'dep_time' => '07:00:00', 'arr_time' => '11:00:00', 'price' => 5000, 'distance' => 240],
            ['bus' => $buses[2], 'dep' => 'Douala', 'dest' => 'Yaoundé', 'dep_agency' => $agencies[0], 'arr_agency' => $arrivalAgencies['gv_yde'], 'dep_time' => '14:00:00', 'arr_time' => '18:00:00', 'price' => 12000, 'distance' => 240],
            ['bus' => $buses[3], 'dep' => 'Yaoundé', 'dest' => 'Douala', 'dep_agency' => $agencies[1], 'arr_agency' => $arrivalAgencies['te_dla'], 'dep_time' => '08:00:00', 'arr_time' => '12:00:00', 'price' => 5000, 'distance' => 240],
            ['bus' => $buses[2], 'dep' => 'Douala', 'dest' => 'Kribi', 'dep_agency' => $agencies[0], 'arr_agency' => $arrivalAgencies['cv_kribi'], 'dep_time' => '08:00:00', 'arr_time' => '11:00:00', 'price' => 4000, 'distance' => 150],
        ];

        $today = Carbon::today();
        $endDate = Carbon::create(2026, 4, 30);
        $current = $today->copy();

        while ($current->lte($endDate)) {
            foreach ($routes as $route) {
                Trip::create([
                    'agency_id'           => $route['dep_agency']->id,
                    'bus_id'              => $route['bus']->id,
                    'departure_id'        => $destinations[$route['dep']]->id,
                    'destination_id'      => $destinations[$route['dest']]->id,
                    'departure_agency_id' => $route['dep_agency']->id,
                    'arrival_agency_id'   => $route['arr_agency']->id,
                    'departure_date'      => $current->format('Y-m-d'),
                    'departure_time'      => $route['dep_time'],
                    'arrival_date'        => $current->format('Y-m-d'),
                    'arrival_time'        => $route['arr_time'],
                    'price'               => $route['price'],
                    'distance_km'         => $route['distance'],
                    'status'              => 'active',
                    'validation_status'   => 'active',
                    'occupied_seats'      => json_encode([]),
                    'submitted_at'        => Carbon::now(),
                    'validated_at'        => Carbon::now(),
                    'validated_by'        => 1,
                ]);
            }
            $current->addDay();
        }

        // ── 6. TRAVELERS ──────────────────────────────────────────────────────
        $travelers = [];
        $travelerData = [
            ['name' => 'Ngono', 'first_name' => 'Marie', 'email' => 'marie.ngono@test.cm', 'phone' => '677001001'],
            ['name' => 'Mballa', 'first_name' => 'Paul', 'email' => 'paul.mballa@test.cm', 'phone' => '691002002'],
        ];

        foreach ($travelerData as $td) {
            $travelers[] = User::create(array_merge($td, [
                'password' => Hash::make('password'),
                'role'     => 'voyageur',
                'status'   => 'active',
            ]));
        }

        // ── 7. RESERVATIONS ───────────────────────────────────────────────────
        $testTrips = Trip::limit(5)->get();

        if ($testTrips->isNotEmpty()) {
            foreach ($testTrips as $index => $trip) {
                if (isset($travelers[$index])) {
                    $res = Reservation::create([
                        'user_id' => $travelers[$index]->id,
                        'trip_id' => $trip->id,
                        'selected_seat' => 'A' . ($index + 1),
                        'passenger_first_name' => $travelers[$index]->first_name,
                        'passenger_last_name' => $travelers[$index]->name,
                        'passenger_email' => $travelers[$index]->email,
                        'passenger_phone' => $travelers[$index]->phone,
                        'passenger_gender' => 'M',
                        'passenger_cni' => 'CM' . rand(1000, 9999),
                        'status' => 'confirmed',
                    ]);

                    Payment::create([
                        'reservation_id' => $res->id,
                        'transaction_id' => 'PAY-' . uniqid(),
                        'reference'      => 'REF-' . uniqid(),
                        'amount'         => $trip->price,
                        'currency'       => 'XAF',
                        'method'         => 'MTN',
                        'status'         => 'completed',
                        'completed_at'   => Carbon::now(),
                    ]);
                }
            }
        }

        $this->command->info('✅ MarketplaceSeeder corrigé et terminé !');
    }
}