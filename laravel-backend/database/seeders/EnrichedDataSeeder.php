<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Destination;
use App\Models\Bus;
use App\Models\Trip;
use App\Models\Tarif;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\Ticket;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class EnrichedDataSeeder extends Seeder
{
    /**
     * Seed the database with enriched data for statistics
     */
    public function run(): void
    {
        $this->command->info('📊 Enrichissement de la base de données pour statistiques...');

        // 1. Créer plus de voyageurs
        $this->command->info('👥 Création de voyageurs supplémentaires...');
        
        $voyageurs = [
            ['email' => 'pierre@example.com', 'first_name' => 'Pierre', 'name' => 'Kamga'],
            ['email' => 'alice@example.com', 'first_name' => 'Alice', 'name' => 'Mbarga'],
            ['email' => 'david@example.com', 'first_name' => 'David', 'name' => 'Fouda'],
            ['email' => 'sophie@example.com', 'first_name' => 'Sophie', 'name' => 'Nkolo'],
            ['email' => 'michel@example.com', 'first_name' => 'Michel', 'name' => 'Essomba'],
        ];

        foreach ($voyageurs as $v) {
            User::updateOrCreate(
                ['email' => $v['email']],
                [
                    'name' => $v['name'],
                    'first_name' => $v['first_name'],
                    'password' => Hash::make('password123'),
                    'phone' => '+237' . rand(600000000, 699999999),
                    'cni_number' => rand(100000000, 999999999),
                    'civility' => 'Mr',
                    'gender' => 'Male',
                    'role' => 'voyageur',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command->info('✅ 5 voyageurs supplémentaires créés');

        // 2. Créer des réservations et paiements pour les 3 derniers mois
        $this->command->info('💳 Création de réservations historiques...');

        $users = User::where('role', 'voyageur')->get();
        // Récupérer TOUS les trips (pas seulement futurs)
        $trips = Trip::all();
        
        if ($trips->count() == 0) {
            $this->command->error('❌ Aucun voyage disponible. Créez des voyages d\'abord !');
            return;
        }
        
        if ($users->count() == 0) {
            $this->command->error('❌ Aucun voyageur disponible.');
            return;
        }

        $reservationsCount = 0;
        $paymentsCount = 0;

        // Créer 50 réservations réparties sur les 3 derniers mois
        $this->command->info("   Tentative de création de 50 réservations...");
        
        for ($i = 0; $i < 50; $i++) {
            // Date aléatoire dans les 30 derniers jours
            $daysAgo = rand(1, 30);
            $createdAt = Carbon::now()->subDays($daysAgo);
            
            // Sélectionner un voyage futur aléatoire
            $trip = $trips->random();
            $user = $users->random();
            
            // Sièges disponibles
            $seats = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2'];
            $occupiedSeats = json_decode($trip->occupied_seats, true) ?? [];
            $availableSeats = array_diff($seats, $occupiedSeats);
            
            if (empty($availableSeats)) continue;
            
            $selectedSeat = $availableSeats[array_rand($availableSeats)];
            
            // Statut aléatoire: 70% confirmées, 20% en attente, 10% annulées
            $rand = rand(1, 100);
            $status = $rand <= 70 ? 'confirmed' : ($rand <= 90 ? 'pending' : 'cancelled');
            
            // Prix selon le tarif ou prix fixe
            $price = rand(2000, 5000);
            
            // Créer la réservation (sans total_price qui n'existe pas)
            $reservation = Reservation::create([
                'user_id' => $user->id,
                'trip_id' => $trip->id,
                'selected_seat' => $selectedSeat,
                'status' => $status,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
            
            $reservationsCount++;

            // Marquer le siège comme occupé si confirmée
            if ($status === 'confirmed') {
                $occupiedSeats[] = $selectedSeat;
                $trip->occupied_seats = json_encode(array_unique($occupiedSeats));
                $trip->save();
            }

            // Créer le paiement (structure simplifiée selon modèle)
            $paymentStatus = $status === 'confirmed' ? 'completed' : 
                           ($status === 'pending' ? 'pending' : 'failed');
            
            $payment = Payment::create([
                'reservation_id' => $reservation->id,
                'amount' => $price,
                'status' => $paymentStatus,
                'transaction_id' => 'TXN' . strtoupper(substr(md5(uniqid()), 0, 10)),
                'method' => ['mobile_money', 'orange_money', 'mtn_momo'][rand(0, 2)],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
            
            $paymentsCount++;

            // Créer le ticket si confirmée
            if ($status === 'confirmed') {
                Ticket::create([
                    'reservation_id' => $reservation->id,
                    'ticket_number' => 'TKT-' . date('Ymd', strtotime($createdAt)) . '-' . strtoupper(substr(uniqid(), -6)),
                    'qr_code' => json_encode([
                        'reservation_id' => $reservation->id,
                        'seat' => $selectedSeat,
                        'trip_id' => $trip->id,
                    ]),
                    'status' => 'valid',
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }
        }

        $this->command->info("✅ {$reservationsCount} réservations créées");
        $this->command->info("✅ {$paymentsCount} paiements créés");

        $this->command->info('');
        $this->command->info('🎉 Base de données enrichie avec succès !');
        $this->command->info('');
        $this->command->info('📊 Statistiques disponibles:');
        $this->command->info('   👥 Utilisateurs: ' . User::count());
        $this->command->info('   🎫 Voyages: ' . Trip::count());
        $this->command->info('   📝 Réservations: ' . Reservation::count());
        $this->command->info('   💳 Paiements: ' . Payment::count());
        $this->command->info('   🎟️ Tickets: ' . Ticket::count());
        $this->command->info('   💰 Revenus totaux: ' . Payment::where('status', 'completed')->sum('amount') . ' FCFA');
    }
}
