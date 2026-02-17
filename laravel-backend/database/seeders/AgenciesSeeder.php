<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agency;
use App\Models\Destination;

class AgenciesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating agencies with real neighborhoods...');

        // Get destinations
        $yaounde = Destination::where('city_name', 'Yaoundé')->first();
        $douala = Destination::where('city_name', 'Douala')->first();
        $bafoussam = Destination::where('city_name', 'Bafoussam')->first();
        $bamenda = Destination::where('city_name', 'Bamenda')->first();
        $garoua = Destination::where('city_name', 'Garoua')->first();
        $kribi = Destination::where('city_name', 'Kribi')->first();
        $bertoua = Destination::where('city_name', 'Bertoua')->first();
        $limbe = Destination::where('city_name', 'Limbé')->first();

        // YAOUNDÉ - Agencies
        if ($yaounde) {
            $yaoundeAgencies = [
                [
                    'agency_name' => 'KCTrip Mvan',
                    'neighborhood' => 'Mvan',
                    'address' => 'Carrefour Mvan, face TotalEnergies',
                    'phone' => '+237 677 12 34 56',
                    'is_main_station' => true,
                ],
                [
                    'agency_name' => 'KCTrip Nlongkak',
                    'neighborhood' => 'Nlongkak',
                    'address' => 'Marché Nlongkak, ancien bâtiment SODECOTON',
                    'phone' => '+237 677 12 34 57',
                    'is_main_station' => false,
                ],
                [
                    'agency_name' => 'KCTrip Nsam',
                    'neighborhood' => 'Nsam',
                    'address' => 'Carrefour Nsam, à côté du marché',
                    'phone' => '+237 677 12 34 58',
                    'is_main_station' => false,
                ],
                [
                    'agency_name' => 'KCTrip Mokolo',
                    'neighborhood' => 'Mokolo',
                    'address' => 'Marché Mokolo, entrée principale',
                    'phone' => '+237 677 12 34 59',
                    'is_main_station' => false,
                ],
                [
                    'agency_name' => 'KCTrip Etoudi',
                    'neighborhood' => 'Etoudi',
                    'address' => 'Carrefour Etoudi, face stade Omnisport',
                    'phone' => '+237 677 12 34 60',
                    'is_main_station' => false,
                ],
            ];

            foreach ($yaoundeAgencies as $agency) {
                Agency::create(array_merge($agency, ['destination_id' => $yaounde->id]));
            }
        }

        // DOUALA - Agencies
        if ($douala) {
            $doualaAgencies = [
                [
                    'agency_name' => 'KCTrip Bonabéri',
                    'neighborhood' => 'Bonabéri',
                    'address' => 'Rond-point Bonabéri, face station Oilibya',
                    'phone' => '+237 677 22 34 56',
                    'is_main_station' => true,
                ],
                [
                    'agency_name' => 'KCTrip Akwa',
                    'neighborhood' => 'Akwa',
                    'address' => 'Boulevard de la Liberté, immeuble SCNC',
                    'phone' => '+237 677 22 34 57',
                    'is_main_station' => true,
                ],
                [
                    'agency_name' => 'KCTrip Bépanda',
                    'neighborhood' => 'Bépanda',
                    'address' => 'Carrefour Bépanda Omnisport',
                    'phone' => '+237 677 22 34 58',
                    'is_main_station' => false,
                ],
                [
                    'agency_name' => 'KCTrip New Bell',
                    'neighborhood' => 'New Bell',
                    'address' => 'Marché New Bell, entrée principale',
                    'phone' => '+237 677 22 34 59',
                    'is_main_station' => false,
                ],
                [
                    'agency_name' => 'KCTrip Ndokotti',
                    'neighborhood' => 'Ndokotti',
                    'address' => 'Carrefour Ndokotti, face marché',
                    'phone' => '+237 677 22 34 60',
                    'is_main_station' => false,
                ],
            ];

            foreach ($doualaAgencies as $agency) {
                Agency::create(array_merge($agency, ['destination_id' => $douala->id]));
            }
        }

        // BAFOUSSAM - Agencies
        if ($bafoussam) {
            $bafousssamAgencies = [
                [
                    'agency_name' => 'KCTrip Marché A',
                    'neighborhood' => 'Marché A',
                    'address' => 'Gare routière Marché A',
                    'phone' => '+237 677 32 34 56',
                    'is_main_station' => true,
                ],
                [
                    'agency_name' => 'KCTrip Tamdja',
                    'neighborhood' => 'Tamdja',
                    'address' => 'Carrefour Tamdja, face pharmacie',
                    'phone' => '+237 677 32 34 57',
                    'is_main_station' => false,
                ],
                [
                    'agency_name' => 'KCTrip Tougang',
                    'neighborhood' => 'Tougang',
                    'address' => 'Quartier Tougang, près du lycée',
                    'phone' => '+237 677 32 34 58',
                    'is_main_station' => false,
                ],
            ];

            foreach ($bafousssamAgencies as $agency) {
                Agency::create(array_merge($agency, ['destination_id' => $bafoussam->id]));
            }
        }

        // BAMENDA - Agencies
        if ($bamenda) {
            $bamendaAgencies = [
                [
                    'agency_name' => 'KCTrip Nkwen',
                    'neighborhood' => 'Nkwen',
                    'address' => 'Commercial Avenue, Nkwen Motor Park',
                    'phone' => '+237 677 42 34 56',
                    'is_main_station' => true,
                ],
                [
                    'agency_name' => 'KCTrip City Chemist',
                    'neighborhood' => 'City Chemist',
                    'address' => 'City Chemist Junction, near hospital',
                    'phone' => '+237 677 42 34 57',
                    'is_main_station' => false,
                ],
                [
                    'agency_name' => 'KCTrip Ntarikon',
                    'neighborhood' => 'Ntarikon',
                    'address' => 'Ntarikon Park, main entrance',
                    'phone' => '+237 677 42 34 58',
                    'is_main_station' => false,
                ],
            ];

            foreach ($bamendaAgencies as $agency) {
                Agency::create(array_merge($agency, ['destination_id' => $bamenda->id]));
            }
        }

        // GAROUA - Agencies
        if ($garoua) {
            $garouaAgencies = [
                [
                    'agency_name' => 'KCTrip Gare Routière',
                    'neighborhood' => 'Centre-Ville',
                    'address' => 'Gare routière principale, avenue de Douala',
                    'phone' => '+237 677 52 34 56',
                    'is_main_station' => true,
                ],
                [
                    'agency_name' => 'KCTrip Doualaré',
                    'neighborhood' => 'Doualaré',
                    'address' => 'Quartier Doualaré, carrefour principal',
                    'phone' => '+237 677 52 34 57',
                    'is_main_station' => false,
                ],
            ];

            foreach ($garouaAgencies as $agency) {
                Agency::create(array_merge($agency, ['destination_id' => $garoua->id]));
            }
        }

        // KRIBI - Agencies
        if ($kribi) {
            $kribiAgencies = [
                [
                    'agency_name' => 'KCTrip Kribi Centre',
                    'neighborhood' => 'Centre-Ville',
                    'address' => 'Avenue de la République, face au port',
                    'phone' => '+237 677 62 34 56',
                    'is_main_station' => true,
                ],
                [
                    'agency_name' => 'KCTrip Grand Batanga',
                    'neighborhood' => 'Grand Batanga',
                    'address' => 'Quartier Grand Batanga, près du marché',
                    'phone' => '+237 677 62 34 57',
                    'is_main_station' => false,
                ],
            ];

            foreach ($kribiAgencies as $agency) {
                Agency::create(array_merge($agency, ['destination_id' => $kribi->id]));
            }
        }

        // BERTOUA - Agencies
        if ($bertoua) {
            $bertouaAgencies = [
                [
                    'agency_name' => 'KCTrip Gare Routière Bertoua',
                    'neighborhood' => 'Centre-Ville',
                    'address' => 'Gare routière centrale, route nationale',
                    'phone' => '+237 677 72 34 56',
                    'is_main_station' => true,
                ],
                [
                    'agency_name' => 'KCTrip Mokolo Bertoua',
                    'neighborhood' => 'Mokolo',
                    'address' => 'Quartier Mokolo, près du marché central',
                    'phone' => '+237 677 72 34 57',
                    'is_main_station' => false,
                ],
            ];

            foreach ($bertouaAgencies as $agency) {
                Agency::create(array_merge($agency, ['destination_id' => $bertoua->id]));
            }
        }

        // LIMBÉ - Agencies
        if ($limbe) {
            $limbeAgencies = [
                [
                    'agency_name' => 'KCTrip Limbé Main Park',
                    'neighborhood' => 'Half Mile',
                    'address' => 'Half Mile Motor Park, main entrance',
                    'phone' => '+237 677 82 34 56',
                    'is_main_station' => true,
                ],
                [
                    'agency_name' => 'KCTrip Down Beach',
                    'neighborhood' => 'Down Beach',
                    'address' => 'Down Beach area, near Atlantic Beach Hotel',
                    'phone' => '+237 677 82 34 57',
                    'is_main_station' => false,
                ],
            ];

            foreach ($limbeAgencies as $agency) {
                Agency::create(array_merge($agency, ['destination_id' => $limbe->id]));
            }
        }

        $this->command->info('✅ Agencies created successfully!');
        $this->command->info('📊 Total agencies: ' . Agency::count());
    }
}

