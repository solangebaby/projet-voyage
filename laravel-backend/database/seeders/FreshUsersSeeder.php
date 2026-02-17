<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class FreshUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "🔄 Nettoyage des utilisateurs...\n";
        
        // Supprimer tous les utilisateurs sauf ceux qui ont des réservations actives
        User::whereDoesntHave('reservations', function($query) {
            $query->whereIn('status', ['confirmed', 'pending']);
        })->delete();
        
        echo "✅ Nettoyage terminé\n\n";
        echo "👥 Création des utilisateurs...\n\n";

        // ============================================
        // ADMINISTRATEUR PRINCIPAL
        // ============================================
        $admin = User::updateOrCreate(
            ['email' => 'kctrip@gmail.com'],
            [
                'name' => 'KC Trip Admin',
                'first_name' => 'KC',
                'phone' => '+237677123456',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );
        
        echo "✅ Admin créé : kctrip@gmail.com / password\n";

        // ============================================
        // VOYAGEURS ACTIFS (avec réservations)
        // ============================================
        $activeUsers = [
            [
                'name' => 'Kamdem Jean',
                'first_name' => 'Jean',
                'email' => 'jean.kamdem@email.cm',
                'phone' => '+237650111222'
            ],
            [
                'name' => 'Nguesso Marie',
                'first_name' => 'Marie',
                'email' => 'marie.nguesso@email.cm',
                'phone' => '+237651222333'
            ],
            [
                'name' => 'Biya Paul',
                'first_name' => 'Paul',
                'email' => 'paul.biya@email.cm',
                'phone' => '+237652333444'
            ],
            [
                'name' => 'Fotso Sandrine',
                'first_name' => 'Sandrine',
                'email' => 'sandrine.fotso@email.cm',
                'phone' => '+237653444555'
            ],
            [
                'name' => 'Manga David',
                'first_name' => 'David',
                'email' => 'david.manga@email.cm',
                'phone' => '+237654555666'
            ],
        ];

        foreach ($activeUsers as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'first_name' => $userData['first_name'],
                    'phone' => $userData['phone'],
                    'password' => Hash::make('password123'),
                    'role' => 'voyageur',
                    'status' => 'active',
                ]
            );
        }
        
        echo "✅ " . count($activeUsers) . " voyageurs actifs créés\n";

        // ============================================
        // VOYAGEURS INACTIFS (en attente d'activation)
        // ============================================
        $inactiveUsers = [
            [
                'name' => 'Nkomo Victor',
                'first_name' => 'Victor',
                'email' => 'victor.nkomo@email.cm',
                'phone' => '+237655666777'
            ],
            [
                'name' => 'Essomba Grace',
                'first_name' => 'Grace',
                'email' => 'grace.essomba@email.cm',
                'phone' => '+237656777888'
            ],
            [
                'name' => 'Tchoumi Pascal',
                'first_name' => 'Pascal',
                'email' => 'pascal.tchoumi@email.cm',
                'phone' => '+237690111222'
            ],
        ];

        foreach ($inactiveUsers as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'first_name' => $userData['first_name'],
                    'phone' => $userData['phone'],
                    'password' => Hash::make('password123'),
                    'role' => 'voyageur',
                    'status' => 'inactive',
                ]
            );
        }
        
        echo "✅ " . count($inactiveUsers) . " voyageurs inactifs créés\n\n";

        // ============================================
        // RÉSUMÉ
        // ============================================
        echo "════════════════════════════════════════════════════\n";
        echo "✅ UTILISATEURS CRÉÉS AVEC SUCCÈS !\n";
        echo "════════════════════════════════════════════════════\n\n";
        
        echo "📊 RÉSUMÉ:\n";
        echo "  • Total utilisateurs: " . User::count() . "\n";
        echo "  • Administrateurs: " . User::where('role', 'admin')->count() . "\n";
        echo "  • Voyageurs actifs: " . User::where('role', 'voyageur')->where('status', 'active')->count() . "\n";
        echo "  • Voyageurs inactifs: " . User::where('role', 'voyageur')->where('status', 'inactive')->count() . "\n\n";
        
        echo "🔐 IDENTIFIANTS ADMIN:\n";
        echo "  Email: kctrip@gmail.com\n";
        echo "  Password: password\n\n";
        
        echo "👤 IDENTIFIANTS VOYAGEUR ACTIF (exemple):\n";
        echo "  Email: jean.kamdem@email.cm\n";
        echo "  Password: password123\n\n";
        
        echo "👤 IDENTIFIANTS VOYAGEUR INACTIF (exemple):\n";
        echo "  Email: victor.nkomo@email.cm\n";
        echo "  Password: password123\n";
        echo "  (Doit être activé par l'admin)\n\n";
    }
}
