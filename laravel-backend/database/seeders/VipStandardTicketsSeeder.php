<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Destination;
use App\Models\Agency;
use App\Models\Bus;
use App\Models\Trip;
use App\Models\Tarif;
use Carbon\Carbon;

class VipStandardTicketsSeeder extends Seeder
{
    public function run(): void
    {
        // Don't truncate, just delete old trips and tarifs
        Tarif::query()->delete();
        Trip::query()->delete();
        
        // Popular Cameroon routes with realistic prices
        $routes = [
            ['from' => 'Yaoundé', 'to' => 'Douala', 'distance' => 250, 'duration' => '4:00', 'standard' => 3500, 'vip' => 7500],
            ['from' => 'Yaoundé', 'to' => 'Bafoussam', 'distance' => 280, 'duration' => '4:30', 'standard' => 4000, 'vip' => 8500],
            ['from' => 'Yaoundé', 'to' => 'Bamenda', 'distance' => 380, 'duration' => '6:00', 'standard' => 5000, 'vip' => 10000],
            ['from' => 'Douala', 'to' => 'Limbé', 'distance' => 80, 'duration' => '1:30', 'standard' => 2000, 'vip' => 7500],
            ['from' => 'Douala', 'to' => 'Bafoussam', 'distance' => 200, 'duration' => '3:30', 'standard' => 3000, 'vip' => 7500],
            ['from' => 'Bafoussam', 'to' => 'Bamenda', 'distance' => 120, 'duration' => '2:00', 'standard' => 2500, 'vip' => 7500],
        ];

        $buses = Bus::all();
        
        if ($buses->isEmpty()) {
            $this->command->warn('No buses found. Please run BusFleetSeeder first.');
            return;
        }

        foreach ($routes as $route) {
            $departure = Destination::where('city_name', $route['from'])->first();
            $destination = Destination::where('city_name', $route['to'])->first();

            if (!$departure || !$destination) {
                $this->command->warn("Route {$route['from']} → {$route['to']} skipped (cities not found)");
                continue;
            }

            $departureAgencies = Agency::where('destination_id', $departure->id)->get();
            $arrivalAgencies = Agency::where('destination_id', $destination->id)->get();

            if ($departureAgencies->isEmpty() || $arrivalAgencies->isEmpty()) {
                $this->command->warn("Route {$route['from']} → {$route['to']} skipped (no agencies)");
                continue;
            }

            $depAgency = $departureAgencies->first();
            $arrAgency = $arrivalAgencies->first();

            // Create trips for the next 7 days
            for ($day = 0; $day < 7; $day++) {
                $date = Carbon::now()->addDays($day)->format('Y-m-d');
                
                // Morning departures
                $departureTimes = ['06:00', '09:00', '12:00', '15:00'];
                
                foreach ($departureTimes as $time) {
                    // Standard bus trip
                    $standardBuses = $buses->where('type', 'Standard');
                    if ($standardBuses->isEmpty()) {
                        $standardBus = $buses->first(); // Fallback to any bus
                    } else {
                        $standardBus = $standardBuses->random();
                    }
                    
                    $standardTrip = Trip::create([
                        'departure_id' => $departure->id,
                        'destination_id' => $destination->id,
                        'departure_agency_id' => $depAgency->id,
                        'arrival_agency_id' => $arrAgency->id,
                        'bus_id' => $standardBus->id,
                        'departure_date' => $date,
                        'departure_time' => $time,
                        'arrival_time' => Carbon::parse($time)->addHours((int)explode(':', $route['duration'])[0])
                            ->addMinutes((int)explode(':', $route['duration'])[1])->format('H:i'),
                        'price' => $route['standard'],
                        'status' => 'active',
                    ]);

                    // Create Standard tarif
                    Tarif::create([
                        'departure_id' => $departure->id,
                        'destination_id' => $destination->id,
                        'ticket_type' => 'standard',
                        'price' => $route['standard'],
                        'base_price' => $route['standard'],
                        'description' => 'Confortable standard seat with basic amenities',
                        'status' => 'actif',
                    ]);

                    // VIP bus trip (1 hour later)
                    $vipBuses = $buses->where('type', 'VIP');
                    if ($vipBuses->isEmpty()) {
                        $vipBus = $buses->last(); // Fallback to any bus
                    } else {
                        $vipBus = $vipBuses->random();
                    }
                    
                    $vipTime = Carbon::parse($time)->addHour()->format('H:i');
                    $vipTrip = Trip::create([
                        'departure_id' => $departure->id,
                        'destination_id' => $destination->id,
                        'departure_agency_id' => $depAgency->id,
                        'arrival_agency_id' => $arrAgency->id,
                        'bus_id' => $vipBus->id,
                        'departure_date' => $date,
                        'departure_time' => $vipTime,
                        'arrival_time' => Carbon::parse($vipTime)->addHours((int)explode(':', $route['duration'])[0])
                            ->addMinutes((int)explode(':', $route['duration'])[1])->format('H:i'),
                        'price' => $route['vip'],
                        'status' => 'active',
                    ]);

                    // Create VIP tarif
                    Tarif::create([
                        'departure_id' => $departure->id,
                        'destination_id' => $destination->id,
                        'ticket_type' => 'vip',
                        'price' => $route['vip'],
                        'vip_price' => $route['vip'],
                        'base_price' => $route['standard'],
                        'description' => 'Premium VIP seat with AC, entertainment, snacks and extra legroom',
                        'status' => 'actif',
                    ]);
                }
            }

            $this->command->info("✓ Created trips for {$route['from']} → {$route['to']}");
        }

        $this->command->info('✓ VIP & Standard tickets seeded successfully!');
        $this->command->info('Total trips: ' . Trip::count());
        $this->command->info('Total tarifs: ' . Tarif::count());
    }
}
