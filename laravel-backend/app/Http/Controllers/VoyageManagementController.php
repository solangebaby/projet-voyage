<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Bus;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VoyageManagementController extends Controller
{
    /**
     * Display a listing of all voyages
     */
    public function index(Request $request)
    {
        $query = Trip::with(['departure', 'destination', 'bus', 'departureAgency', 'arrivalAgency']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('departure_date', '>=', $request->date_from);
        }

        $voyages = $query->orderBy('departure_date', 'desc')
            ->orderBy('departure_time', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $voyages
        ]);
    }

    /**
     * Store a newly created voyage with automatic arrival time calculation
     */
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'departure_id' => 'required|exists:destinations,id',
            'destination_id' => 'required|exists:destinations,id|different:departure_id',
            'departure_agency_id' => 'nullable|exists:agencies,id',
            'arrival_agency_id' => 'nullable|exists:agencies,id',
            'bus_id' => 'required|exists:buses,id',
            'tarif_id' => 'nullable|exists:tarifs,id',
            'departure_date' => 'required|date|after_or_equal:today',
            'departure_time' => 'required|date_format:H:i',
            'duration' => 'required|regex:/^([0-9]{1,2}):([0-5][0-9])$/',
            'distance_km' => 'nullable|numeric|min:0',
            'price' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get bus
        $bus = Bus::find($request->bus_id);
        
        if (!$bus) {
            return response()->json([
                'success' => false,
                'message' => 'Bus non trouvé'
            ], 404);
        }

        // Check if bus is available
        if ($bus->state !== 'actif') {
            return response()->json([
                'success' => false,
                'message' => "Ce bus est {$bus->state}"
            ], 400);
        }

        // Check if bus is already assigned at this date/time
        $conflictingTrip = Trip::where('bus_id', $request->bus_id)
            ->where('departure_date', $request->departure_date)
            ->where('status', 'active')
            ->where(function($q) use ($request) {
                $q->where('departure_time', '=', $request->departure_time)
                  ->orWhereBetween('departure_time', [
                      Carbon::parse($request->departure_time)->subHours(4)->format('H:i'),
                      Carbon::parse($request->departure_time)->addHours(4)->format('H:i')
                  ]);
            })
            ->first();

        if ($conflictingTrip) {
            return response()->json([
                'success' => false,
                'message' => "Le bus est déjà assigné à un voyage le {$request->departure_date} à {$conflictingTrip->departure_time}"
            ], 409);
        }

        // ✅ CALCUL AUTOMATIQUE DE L'HEURE D'ARRIVÉE
        $arrivalData = $this->calculateArrivalTime(
            $request->departure_date,
            $request->departure_time, 
            $request->duration
        );

        // Get cities for response
        $departure = Destination::find($request->departure_id);
        $destination = Destination::find($request->destination_id);

        $occupiedSeats = []; // Empty for new voyage

        // Create voyage
        $voyage = Trip::create([
            'departure_id' => $request->departure_id,
            'destination_id' => $request->destination_id,
            'departure_agency_id' => $request->departure_agency_id,
            'arrival_agency_id' => $request->arrival_agency_id,
            'bus_id' => $request->bus_id,
            'tarif_id' => $request->tarif_id,
            'departure_date' => $request->departure_date,
            'departure_time' => $request->departure_time,
            'arrival_date' => $arrivalData['date'],
            'arrival_time' => $arrivalData['time'],
            'occupied_seats' => json_encode($occupiedSeats),
            'distance_km' => $request->distance_km ?? 0,
            'price' => $request->price ?? 0,
            'status' => 'active'
        ]);

        $formattedDate = Carbon::parse($request->departure_date)->locale('fr')->isoFormat('DD MMMM YYYY');
        
        return response()->json([
            'success' => true,
            'message' => "Voyage créé : {$departure->city_name}→{$destination->city_name}. {$formattedDate} à {$request->departure_time}. Arrivée: {$arrivalData['date']} à {$arrivalData['time']}. {$bus->total_seats} places disponibles",
            'data' => $voyage->load(['departure', 'destination', 'bus'])
        ], 201);
    }

    /**
     * Store multiple voyages in bulk (recurring trips)
     */
    public function storeBulk(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'departure_id' => 'required|exists:destinations,id',
            'destination_id' => 'required|exists:destinations,id|different:departure_id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'schedules' => 'required|array|min:1',
            'schedules.*.time' => 'required|date_format:H:i',
            'schedules.*.bus_id' => 'required|exists:buses,id',
            'duration' => 'required|regex:/^([0-9]{1,2}):([0-5][0-9])$/',
            'tarif_id' => 'nullable|exists:tarifs,id',
            'frequency' => 'required|in:daily,weekdays,weekends,custom',
            'days' => 'required_if:frequency,custom|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $createdVoyages = [];
        $errors = [];

        // Generate dates based on frequency
        $dates = $this->generateDates($startDate, $endDate, $request->frequency, $request->days ?? []);

        foreach ($dates as $date) {
            foreach ($request->schedules as $schedule) {
                try {
                    $bus = Bus::find($schedule['bus_id']);
                    
                    if (!$bus || $bus->state !== 'actif') {
                        continue;
                    }

                    // Check conflicts
                    $hasConflict = Trip::where('bus_id', $schedule['bus_id'])
                        ->where('departure_date', $date->format('Y-m-d'))
                        ->where('status', 'active')
                        ->where('departure_time', $schedule['time'])
                        ->exists();

                    if ($hasConflict) {
                        $errors[] = "Conflit: Bus {$bus->bus_name} déjà assigné le {$date->format('d/m/Y')} à {$schedule['time']}";
                        continue;
                    }

                    // Calculate arrival
                    $arrivalData = $this->calculateArrivalTime(
                        $date->format('Y-m-d'),
                        $schedule['time'],
                        $request->duration
                    );

                    // Create voyage
                    $voyage = Trip::create([
                        'departure_id' => $request->departure_id,
                        'destination_id' => $request->destination_id,
                        'departure_agency_id' => $request->departure_agency_id,
                        'arrival_agency_id' => $request->arrival_agency_id,
                        'bus_id' => $schedule['bus_id'],
                        'tarif_id' => $request->tarif_id,
                        'departure_date' => $date->format('Y-m-d'),
                        'departure_time' => $schedule['time'],
                        'arrival_date' => $arrivalData['date'],
                        'arrival_time' => $arrivalData['time'],
                        'occupied_seats' => json_encode([]),
                        'distance_km' => $request->distance_km ?? 0,
                        'price' => $request->price ?? 0,
                        'status' => 'active'
                    ]);

                    $createdVoyages[] = $voyage;
                } catch (\Exception $e) {
                    $errors[] = __('messages.voyage_error_on', ['date' => $date->format('m/d/Y'), 'time' => $schedule['time'], 'message' => $e->getMessage()]);
                }
            }
        }

        $departure = Destination::find($request->departure_id);
        $destination = Destination::find($request->destination_id);
        $count = count($createdVoyages);

        return response()->json([
            'success' => true,
            'message' => "{$count} voyage(s) créé(s) avec succès pour {$departure->city_name}→{$destination->city_name}",
            'data' => [
                'created_count' => $count,
                'errors' => $errors,
                'voyages' => $createdVoyages
            ]
        ], 201);
    }

    /**
     * Display the specified voyage
     */
    public function show($id)
    {
        $voyage = Trip::with(['departure', 'destination', 'bus'])->find($id);

        if (!$voyage) {
            return response()->json([
                'success' => false,
                'message' => 'Voyage non trouvé'
            ], 404);
        }

        $occupiedSeats = json_decode($voyage->occupied_seats, true) ?? [];
        $bookedCount = count($occupiedSeats);
        $totalSeats = $voyage->bus->total_seats ?? 0;
        $availableCount = $totalSeats - $bookedCount;

        return response()->json([
            'success' => true,
            'data' => $voyage,
            'booking_stats' => [
                'total_seats' => $totalSeats,
                'booked_seats' => $bookedCount,
                'available_seats' => $availableCount
            ]
        ]);
    }

    /**
     * Update the specified voyage
     */
    public function update(Request $request, $id)
    {
        $voyage = Trip::find($id);

        if (!$voyage) {
            return response()->json([
                'success' => false,
                'message' => 'Voyage non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'bus_id' => 'sometimes|exists:buses,id',
            'departure_date' => 'sometimes|date',
            'departure_time' => 'sometimes|date_format:H:i',
            'duration' => 'sometimes|regex:/^([0-9]{1,2}):([0-5][0-9])$/',
            'status' => 'sometimes|in:active,cancelled,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Recalculate arrival time if departure or duration changed
        if ($request->has('departure_time') || $request->has('duration') || $request->has('departure_date')) {
            $departureDate = $request->departure_date ?? $voyage->departure_date;
            $departureTime = $request->departure_time ?? $voyage->departure_time;
            $duration = $request->duration ?? '04:00'; // Default duration
            
            $arrivalData = $this->calculateArrivalTime($departureDate, $departureTime, $duration);
            $voyage->arrival_date = $arrivalData['date'];
            $voyage->arrival_time = $arrivalData['time'];
        }

        $voyage->fill($request->only([
            'bus_id', 'departure_date', 'departure_time', 'status', 'distance_km'
        ]));
        $voyage->save();

        return response()->json([
            'success' => true,
            'message' => 'Voyage mis à jour avec succès',
            'data' => $voyage->fresh()->load(['departure', 'destination', 'bus'])
        ]);
    }

    /**
     * Activate voyage for sale
     */
    public function activate($id)
    {
        $voyage = Trip::with(['departure', 'destination', 'bus'])->find($id);

        if (!$voyage) {
            return response()->json([
                'success' => false,
                'message' => 'Voyage non trouvé'
            ], 404);
        }

        $voyage->status = 'active';
        $voyage->save();

        return response()->json([
            'success' => true,
            'message' => 'Le voyage est maintenant visible par les utilisateurs',
            'data' => $voyage
        ]);
    }

    /**
     * Deactivate voyage (suspend sales)
     */
    public function deactivate(Request $request, $id)
    {
        $voyage = Trip::find($id);

        if (!$voyage) {
            return response()->json([
                'success' => false,
                'message' => 'Voyage non trouvé'
            ], 404);
        }

        $voyage->status = 'cancelled';
        $voyage->save();

        return response()->json([
            'success' => true,
            'message' => 'Voyage suspendu. Les réservations existantes sont conservées'
        ]);
    }

    /**
     * Delete voyage
     */
    public function destroy($id)
    {
        $voyage = Trip::find($id);

        if (!$voyage) {
            return response()->json([
                'success' => false,
                'message' => 'Voyage non trouvé'
            ], 404);
        }

        // Check if voyage has reservations
        $reservationsCount = $voyage->reservations()->count();

        if ($reservationsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Impossible de supprimer. {$reservationsCount} réservations existent pour ce voyage"
            ], 400);
        }

        $voyage->delete();

        return response()->json([
            'success' => true,
            'message' => 'Voyage supprimé avec succès'
        ]);
    }

    /**
     * Calculate arrival date and time based on departure and duration
     * ✅ FORMULE: Heure arrivée = Heure départ + Durée trajet
     */
    private function calculateArrivalTime($departureDate, $departureTime, $duration)
    {
        try {
            // Parse departure datetime
            $departureDateTime = Carbon::createFromFormat('Y-m-d H:i', "{$departureDate} {$departureTime}");
            
            // Parse duration (format: HH:MM)
            list($hours, $minutes) = explode(':', $duration);
            
            // Calculate arrival
            $arrivalDateTime = $departureDateTime->copy()
                ->addHours((int)$hours)
                ->addMinutes((int)$minutes);
            
            return [
                'date' => $arrivalDateTime->format('Y-m-d'),
                'time' => $arrivalDateTime->format('H:i')
            ];
        } catch (\Exception $e) {
            // Fallback: same day, same time + 4 hours
            $fallback = Carbon::createFromFormat('Y-m-d H:i', "{$departureDate} {$departureTime}")->addHours(4);
            return [
                'date' => $fallback->format('Y-m-d'),
                'time' => $fallback->format('H:i')
            ];
        }
    }

    /**
     * Generate dates based on frequency
     */
    private function generateDates($startDate, $endDate, $frequency, $customDays = [])
    {
        $dates = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $shouldInclude = false;

            switch ($frequency) {
                case 'daily':
                    $shouldInclude = true;
                    break;
                case 'weekdays':
                    $shouldInclude = $current->isWeekday();
                    break;
                case 'weekends':
                    $shouldInclude = $current->isWeekend();
                    break;
                case 'custom':
                    $dayName = strtolower($current->locale('fr')->dayName);
                    $shouldInclude = in_array($dayName, array_map('strtolower', $customDays));
                    break;
            }

            if ($shouldInclude) {
                $dates[] = $current->copy();
            }

            $current->addDay();
        }

        return $dates;
    }

    /**
     * Get voyages calendar view
     */
    public function calendar(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $voyages = Trip::with(['departure', 'destination', 'bus'])
            ->whereYear('departure_date', $year)
            ->whereMonth('departure_date', $month)
            ->where('status', '!=', 'cancelled')
            ->orderBy('departure_date')
            ->orderBy('departure_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $voyages,
            'month' => $month,
            'year' => $year
        ]);
    }
}
