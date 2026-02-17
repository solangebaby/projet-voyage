<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Destination;
use App\Models\Bus;
use App\Models\Trip;
use App\Models\Tarif;
use App\Models\Agency;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\Ticket;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CompleteRealisticSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clean existing data
        Ticket::truncate();
        Payment::truncate();
        Reservation::truncate();
        Trip::truncate();
        Tarif::truncate();
        Agency::truncate();
        Bus::truncate();
        Destination::truncate();
        User::where('email', '!=', 'admin@jadoo.com')->delete();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "🔄 Création des données réalistes pour Jadoo Travels...\n\n";

        // ============================================
        // 1. UTILISATEURS
        // ============================================
        echo "👥 Création des utilisateurs...\n";
        
        // Admin principal (vérifier s'il existe déjà)
        $admin = User::firstOrCreate(
            ['email' => 'admin@jadoo.com'],
            [
                'name' => 'Admin Jadoo',
                'first_name' => 'Admin',
                'phone' => '+237677123456',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // Voyageurs actifs (avec réservations payées et tickets téléchargés)
        $activeUsers = [
            ['name' => 'Kamdem Jean', 'email' => 'jean.kamdem@email.cm', 'phone' => '+237650111222'],
            ['name' => 'Nguesso Marie', 'email' => 'marie.nguesso@email.cm', 'phone' => '+237651222333'],
            ['name' => 'Biya Paul', 'email' => 'paul.biya@email.cm', 'phone' => '+237652333444'],
            ['name' => 'Fotso Sandrine', 'email' => 'sandrine.fotso@email.cm', 'phone' => '+237653444555'],
            ['name' => 'Manga David', 'email' => 'david.manga@email.cm', 'phone' => '+237654555666'],
        ];

        $createdActiveUsers = [];
        foreach ($activeUsers as $userData) {
            $createdActiveUsers[] = User::create([
                'name' => $userData['name'],
                'first_name' => explode(' ', $userData['name'])[1],
                'email' => $userData['email'],
                'phone' => $userData['phone'],
                'password' => Hash::make('password123'),
                'role' => 'voyageur',
                'status' => 'active',
            ]);
        }

        // Voyageurs inactifs (avec réservations mais pas encore activés)
        $inactiveUsers = [
            ['name' => 'Nkomo Victor', 'email' => 'victor.nkomo@email.cm', 'phone' => '+237655666777'],
            ['name' => 'Essomba Grace', 'email' => 'grace.essomba@email.cm', 'phone' => '+237656777888'],
            ['name' => 'Tchoumi Pascal', 'email' => 'pascal.tchoumi@email.cm', 'phone' => '+237690111222'],
        ];

        $createdInactiveUsers = [];
        foreach ($inactiveUsers as $userData) {
            $createdInactiveUsers[] = User::create([
                'name' => $userData['name'],
                'first_name' => explode(' ', $userData['name'])[1],
                'email' => $userData['email'],
                'phone' => $userData['phone'],
                'password' => Hash::make('password123'),
                'role' => 'voyageur',
                'status' => 'inactive',
            ]);
        }

        echo "✅ " . (count($activeUsers) + count($inactiveUsers) + 1) . " utilisateurs créés\n\n";

        // ============================================
        // 2. DESTINATIONS (Villes camerounaises)
        // ============================================
        echo "🏙️ Création des destinations...\n";
        
        $cities = [
            ['city_name' => 'Yaoundé', 'description' => 'Capitale politique du Cameroun'],
            ['city_name' => 'Douala', 'description' => 'Capitale économique et plus grande ville'],
            ['city_name' => 'Bafoussam', 'description' => 'Chef-lieu de la région de l\'Ouest'],
            ['city_name' => 'Bamenda', 'description' => 'Chef-lieu de la région du Nord-Ouest'],
            ['city_name' => 'Garoua', 'description' => 'Ville du Nord, capitale régionale'],
            ['city_name' => 'Maroua', 'description' => 'Ville de l\'Extrême-Nord'],
            ['city_name' => 'Ngaoundéré', 'description' => 'Ville de l\'Adamaoua'],
            ['city_name' => 'Bertoua', 'description' => 'Chef-lieu de la région de l\'Est'],
            ['city_name' => 'Buea', 'description' => 'Ville du Sud-Ouest, aux pieds du Mont Cameroun'],
            ['city_name' => 'Limbé', 'description' => 'Ville balnéaire du Sud-Ouest'],
            ['city_name' => 'Kribi', 'description' => 'Station balnéaire du Sud'],
            ['city_name' => 'Ebolowa', 'description' => 'Chef-lieu de la région du Sud'],
        ];

        $destinations = [];
        foreach ($cities as $city) {
            $destinations[$city['city_name']] = Destination::create($city);
        }

        echo "✅ " . count($cities) . " destinations créées\n\n";

        // ============================================
        // 3. AGENCES PAR VILLE
        // ============================================
        echo "🏢 Création des agences...\n";
        
        $agenciesData = [
            'Yaoundé' => ['Gare Routière Mvan', 'Agence Tsinga', 'Terminus Efoulan'],
            'Douala' => ['Gare Routière Bonabéri', 'Agence Akwa', 'Terminus Bessengue'],
            'Bafoussam' => ['Gare Routière Centrale', 'Agence Tamdja'],
            'Bamenda' => ['Gare Routière Commercial Avenue', 'Agence Nkwen'],
            'Garoua' => ['Gare Routière Centrale'],
            'Maroua' => ['Gare Routière Domayo'],
            'Ngaoundéré' => ['Gare Routière Centrale'],
            'Bertoua' => ['Gare Routière Centrale'],
            'Buea' => ['Agence Molyko', 'Gare Routière Great Soppo'],
            'Limbé' => ['Agence Mile 4'],
            'Kribi' => ['Gare Routière Centrale'],
            'Ebolowa' => ['Gare Routière Centrale'],
        ];

        $agencies = [];
        foreach ($agenciesData as $cityName => $agencyNames) {
            $destination = $destinations[$cityName];
            foreach ($agencyNames as $agencyName) {
                $agencies[] = Agency::create([
                    'destination_id' => $destination->id,
                    'agency_name' => $agencyName,
                    'neighborhood' => explode(' ', $agencyName)[0],
                    'address' => $agencyName . ', ' . $cityName,
                    'phone' => '+237' . rand(650000000, 699999999),
                    'is_main_station' => str_contains($agencyName, 'Gare Routière'),
                ]);
            }
        }

        echo "✅ " . count($agencies) . " agences créées\n\n";

        // ============================================
        // 4. BUS
        // ============================================
        echo "🚌 Création de la flotte de bus...\n";
        
        $busTypes = [
            ['name' => 'VIP Express', 'capacity' => 30, 'price' => 8000, 'type' => 'vip'],
            ['name' => 'Confort Plus', 'capacity' => 40, 'price' => 6000, 'type' => 'standard'],
            ['name' => 'Standard', 'capacity' => 50, 'price' => 4000, 'type' => 'standard'],
            ['name' => 'Classique', 'capacity' => 45, 'price' => 5000, 'type' => 'standard'],
        ];

        $buses = [];
        foreach ($busTypes as $index => $busType) {
            for ($i = 1; $i <= 3; $i++) {
                $buses[] = Bus::create([
                    'bus_name' => $busType['name'] . ' ' . $i,
                    'internal_number' => 'BUS-' . str_pad(($index * 3 + $i), 3, '0', STR_PAD_LEFT),
                    'registration' => 'CM-' . strtoupper(substr(md5(rand()), 0, 6)),
                    'matricule' => 'LT-' . rand(1000, 9999) . '-CM',
                    'brand' => ['Toyota', 'Mercedes', 'Volvo', 'Scania'][array_rand(['Toyota', 'Mercedes', 'Volvo', 'Scania'])],
                    'year' => rand(2018, 2024),
                    'type' => $busType['type'],
                    'state' => 'actif',
                    'total_seats' => $busType['capacity'],
                    'seat_configuration' => json_encode(['rows' => ceil($busType['capacity'] / 4), 'cols' => 4]),
                    'price' => $busType['price'],
                    'features' => json_encode(['climatisation', 'wifi', 'prises USB']),
                ]);
            }
        }

        echo "✅ " . count($buses) . " bus créés\n\n";

        // ============================================
        // 5. ROUTES ET TARIFS
        // ============================================
        echo "🗺️ Création des routes et tarifs...\n";
        
        $routes = [
            ['from' => 'Yaoundé', 'to' => 'Douala', 'distance' => 250, 'duration' => '4h00', 'base_price' => 3500],
            ['from' => 'Yaoundé', 'to' => 'Bafoussam', 'distance' => 280, 'duration' => '5h00', 'base_price' => 4000],
            ['from' => 'Douala', 'to' => 'Bafoussam', 'distance' => 300, 'duration' => '5h30', 'base_price' => 4500],
            ['from' => 'Yaoundé', 'to' => 'Bamenda', 'distance' => 380, 'duration' => '7h00', 'base_price' => 6000],
            ['from' => 'Douala', 'to' => 'Bamenda', 'distance' => 400, 'duration' => '7h30', 'base_price' => 6500],
            ['from' => 'Yaoundé', 'to' => 'Garoua', 'distance' => 850, 'duration' => '14h00', 'base_price' => 12000],
            ['from' => 'Douala', 'to' => 'Limbé', 'distance' => 75, 'duration' => '1h30', 'base_price' => 2000],
            ['from' => 'Douala', 'to' => 'Buea', 'distance' => 70, 'duration' => '1h30', 'base_price' => 2000],
            ['from' => 'Douala', 'to' => 'Kribi', 'distance' => 200, 'duration' => '3h30', 'base_price' => 3500],
            ['from' => 'Yaoundé', 'to' => 'Bertoua', 'distance' => 350, 'duration' => '6h00', 'base_price' => 5500],
        ];

        $tarifs = [];
        foreach ($routes as $route) {
            $departure = $destinations[$route['from']];
            $arrival = $destinations[$route['to']];
            
            $durationHours = (int)substr($route['duration'], 0, strpos($route['duration'], 'h'));
            
            $tarifs[] = Tarif::create([
                'departure_id' => $departure->id,
                'destination_id' => $arrival->id,
                'name' => $route['from'] . ' - ' . $route['to'],
                'distance_km' => $route['distance'],
                'duration_hours' => $durationHours,
                'base_price' => $route['base_price'],
                'vip_price' => $route['base_price'] * 1.5,
                'economy_price' => $route['base_price'] * 0.8,
                'currency' => 'XAF',
                'status' => 'actif',
            ]);
        }

        echo "✅ " . count($tarifs) . " routes/tarifs créés\n\n";

        // ============================================
        // 6. VOYAGES (TRIPS)
        // ============================================
        echo "🎫 Création des voyages...\n";
        
        $trips = [];
        $today = now();
        
        // Créer des voyages pour les 7 prochains jours
        for ($day = 0; $day < 7; $day++) {
            $date = $today->copy()->addDays($day);
            
            // Pour chaque route principale, créer 2-3 voyages par jour
            foreach (array_slice($routes, 0, 5) as $route) {
                $departure = $destinations[$route['from']];
                $arrival = $destinations[$route['to']];
                
                // Voyage du matin (6h)
                $morningTime = $date->copy()->setTime(6, 0);
                $trips[] = Trip::create([
                    'departure_id' => $departure->id,
                    'destination_id' => $arrival->id,
                    'bus_id' => $buses[array_rand($buses)]->id,
                    'departure_date' => $morningTime->format('Y-m-d'),
                    'departure_time' => $morningTime->format('H:i:s'),
                    'arrival_time' => $morningTime->copy()->addHours((int)substr($route['duration'], 0, 2))->format('H:i:s'),
                    'price' => $route['base_price'],
                    'status' => 'active',
                    'occupied_seats' => json_encode([]),
                ]);
                
                // Voyage de midi (12h)
                $noonTime = $date->copy()->setTime(12, 0);
                $trips[] = Trip::create([
                    'departure_id' => $departure->id,
                    'destination_id' => $arrival->id,
                    'bus_id' => $buses[array_rand($buses)]->id,
                    'departure_date' => $noonTime->format('Y-m-d'),
                    'departure_time' => $noonTime->format('H:i:s'),
                    'arrival_time' => $noonTime->copy()->addHours((int)substr($route['duration'], 0, 2))->format('H:i:s'),
                    'price' => $route['base_price'],
                    'status' => 'active',
                    'occupied_seats' => json_encode([]),
                ]);

                // Voyage du soir (18h) - seulement pour courtes distances
                if ($route['distance'] < 300) {
                    $eveningTime = $date->copy()->setTime(18, 0);
                    $trips[] = Trip::create([
                        'departure_id' => $departure->id,
                        'destination_id' => $arrival->id,
                        'bus_id' => $buses[array_rand($buses)]->id,
                        'departure_date' => $eveningTime->format('Y-m-d'),
                        'departure_time' => $eveningTime->format('H:i:s'),
                        'arrival_time' => $eveningTime->copy()->addHours((int)substr($route['duration'], 0, 2))->format('H:i:s'),
                        'price' => $route['base_price'],
                        'status' => 'active',
                        'occupied_seats' => json_encode([]),
                    ]);
                }
            }
        }

        echo "✅ " . count($trips) . " voyages créés\n\n";

        // ============================================
        // 7. RÉSERVATIONS, PAIEMENTS ET TICKETS
        // ============================================
        echo "🎟️ Création des réservations avec paiements...\n";
        
        $reservations = [];
        $payments = [];
        $tickets = [];
        
        // Créer des réservations pour les utilisateurs actifs
        foreach ($createdActiveUsers as $index => $user) {
            // 2-3 réservations confirmées par utilisateur
            $numReservations = rand(2, 3);
            
            for ($i = 0; $i < $numReservations; $i++) {
                $trip = $trips[array_rand($trips)];
                $seatNumber = 'A' . rand(1, 20);
                
                // Créer la réservation
                $reservation = Reservation::create([
                    'user_id' => $user->id,
                    'trip_id' => $trip->id,
                    'selected_seat' => $seatNumber,
                    'passenger_name' => $user->name,
                    'passenger_first_name' => $user->first_name,
                    'passenger_last_name' => explode(' ', $user->name)[0],
                    'passenger_email' => $user->email,
                    'passenger_phone' => $user->phone,
                    'passenger_gender' => rand(0, 1) ? 'M' : 'F',
                    'passenger_cni' => 'CM' . rand(10000000, 99999999),
                    'status' => 'confirmed',
                    'expires_at' => now()->addHours(2),
                ]);
                
                // Créer le paiement
                $payment = Payment::create([
                    'reservation_id' => $reservation->id,
                    'transaction_id' => 'TXN-' . strtoupper(substr(md5(rand()), 0, 12)),
                    'reference' => 'REF-' . strtoupper(substr(md5(rand()), 0, 10)),
                    'amount' => $trip->price,
                    'currency' => 'XAF',
                    'method' => rand(0, 1) ? 'MTN' : 'Orange',
                    'phone_number' => $user->phone,
                    'status' => 'completed',
                    'completed_at' => now()->subHours(rand(3, 48)),
                ]);
                
                // Créer le ticket
                $ticket = Ticket::create([
                    'reservation_id' => $reservation->id,
                    'ticket_number' => 'TKT-' . strtoupper(substr(md5(rand()), 0, 10)),
                    'qr_code' => 'QR-' . strtoupper(substr(md5(rand()), 0, 20)),
                    'status' => 'valid',
                    'downloaded_at' => now()->subHours(rand(1, 24)), // Téléchargé
                ]);
                
                // Mettre à jour les sièges occupés
                $occupiedSeats = json_decode($trip->occupied_seats, true) ?? [];
                $occupiedSeats[] = $seatNumber;
                $trip->occupied_seats = json_encode($occupiedSeats);
                $trip->save();
                
                $reservations[] = $reservation;
                $payments[] = $payment;
                $tickets[] = $ticket;
            }
        }
        
        // Créer des réservations pour les utilisateurs inactifs (non téléchargés)
        foreach ($createdInactiveUsers as $user) {
            $trip = $trips[array_rand($trips)];
            $seatNumber = 'B' . rand(1, 20);
            
            $reservation = Reservation::create([
                'user_id' => $user->id,
                'trip_id' => $trip->id,
                'selected_seat' => $seatNumber,
                'passenger_name' => $user->name,
                'passenger_first_name' => $user->first_name,
                'passenger_last_name' => explode(' ', $user->name)[0],
                'passenger_email' => $user->email,
                'passenger_phone' => $user->phone,
                'passenger_gender' => rand(0, 1) ? 'M' : 'F',
                'passenger_cni' => 'CM' . rand(10000000, 99999999),
                'status' => 'confirmed',
                'expires_at' => now()->addHours(2),
            ]);
            
            $payment = Payment::create([
                'reservation_id' => $reservation->id,
                'transaction_id' => 'TXN-' . strtoupper(substr(md5(rand()), 0, 12)),
                'reference' => 'REF-' . strtoupper(substr(md5(rand()), 0, 10)),
                'amount' => $trip->price,
                'currency' => 'XAF',
                'method' => rand(0, 1) ? 'MTN' : 'Orange',
                'phone_number' => $user->phone,
                'status' => 'completed',
                'completed_at' => now()->subMinutes(30),
            ]);
            
            $ticket = Ticket::create([
                'reservation_id' => $reservation->id,
                'ticket_number' => 'TKT-' . strtoupper(substr(md5(rand()), 0, 10)),
                'qr_code' => 'QR-' . strtoupper(substr(md5(rand()), 0, 20)),
                'status' => 'valid',
                'downloaded_at' => null, // PAS téléchargé - condition pour activation
            ]);
        }

        echo "✅ " . count($reservations) . " réservations créées\n";
        echo "✅ " . count($payments) . " paiements créés\n";
        echo "✅ " . count($tickets) . " tickets créés\n\n";

        // ============================================
        // RÉSUMÉ
        // ============================================
        echo "\n";
        echo "════════════════════════════════════════════════════\n";
        echo "✅ BASE DE DONNÉES PEUPLÉE AVEC SUCCÈS !\n";
        echo "════════════════════════════════════════════════════\n\n";
        echo "📊 RÉSUMÉ:\n";
        echo "  • Utilisateurs: " . User::count() . " (dont " . User::where('status', 'active')->count() . " actifs)\n";
        echo "  • Destinations: " . Destination::count() . "\n";
        echo "  • Agences: " . Agency::count() . "\n";
        echo "  • Bus: " . Bus::count() . "\n";
        echo "  • Routes/Tarifs: " . Tarif::count() . "\n";
        echo "  • Voyages: " . Trip::count() . "\n";
        echo "  • Réservations: " . Reservation::count() . "\n";
        echo "  • Paiements: " . Payment::count() . "\n";
        echo "  • Tickets: " . Ticket::count() . "\n\n";
        
        echo "🔐 IDENTIFIANTS ADMIN:\n";
        echo "  Email: admin@jadoo.com\n";
        echo "  Password: password\n\n";
        
        echo "👤 IDENTIFIANTS VOYAGEUR ACTIF (exemple):\n";
        echo "  Email: jean.kamdem@email.cm\n";
        echo "  Password: password123\n\n";
        
        echo "📝 NOTE IMPORTANTE:\n";
        echo "  • Les utilisateurs ACTIFS ont des tickets téléchargés\n";
        echo "  • Les utilisateurs INACTIFS ont payé mais PAS téléchargé\n";
        echo "  • L'admin doit activer les comptes inactifs manuellement\n\n";
    }
}
