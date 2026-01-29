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
        $query = Trip::with(['departure', 'destination', 'bus'])
            ->whereNotNull('trip_date')
            ->whereNotNull('bus_id');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('trip_date', '>=', $request->date_from);
        }

        $voyages = $query->orderBy('trip_date', 'desc')
            ->orderBy('departure_time', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $voyages
        ]);
    }

    /**
     * Store a newly created voyage
     */
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'departure_id' => 'required|exists:destinations,id',
            'destination_id' => 'required|exists:destinations,id|different:departure_id',
            'bus_id' => 'required|exists:buses,id',
            'trip_date' => 'required|date|after_or_equal:today',
            'departure_time' => 'required|date_format:H:i',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|regex:/^([0-9]{1,2}):([0-5][0-9])$/',
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
            ->where('trip_date', $request->trip_date)
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
                'message' => "Le bus est déjà assigné à un voyage le {$request->trip_date} à {$conflictingTrip->departure_time}"
            ], 409);
        }

        // Calculate arrival time
        $arrivalTime = $this->calculateArrivalTime($request->departure_time, $request->duration);

        // Get cities for response
        $departure = Destination::find($request->departure_id);
        $destination = Destination::find($request->destination_id);

        // Parse seat configuration from bus
        $seatConfig = json_decode($bus->seat_configuration, true) ?? [];
        $occupiedSeats = []; // Empty for new voyage

        // Create voyage
        $voyage = Trip::create([
            'departure_id' => $request->departure_id,
            'destination_id' => $request->destination_id,
            'bus_id' => $request->bus_id,
            'trip_date' => $request->trip_date,
            'departure_time' => $request->departure_time,
            'arrival_time' => $arrivalTime,
            'price' => $request->price,
            'distance' => $request->distance ?? 0,
            'duration' => $request->duration,
            'available_seats' => $bus->total_seats,
            'occupied_seats' => json_encode($occupiedSeats),
            'status' => 'draft' // Start as draft
        ]);

        $formattedDate = Carbon::parse($request->trip_date)->locale('fr')->isoFormat('DD MMMM YYYY');
        
        return response()->json([
            'success' => true,
            'message' => "Voyage créé : {$departure->city_name}→{$destination->city_name}. {$formattedDate} à {$request->departure_time}. {$bus->total_seats} places disponibles",
            'data' => $voyage->load(['departure', 'destination', 'bus'])
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

        // Calculate booked seats
        $occupiedSeats = json_decode($voyage->occupied_seats, true) ?? [];
        $bookedCount = count($occupiedSeats);
        $availableCount = $voyage->available_seats - $bookedCount;

        return response()->json([
            'success' => true,
            'data' => $voyage,
            'booking_stats' => [
                'total_seats' => $voyage->available_seats,
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

        // Validation
        $validator = Validator::make($request->all(), [
            'bus_id' => 'sometimes|exists:buses,id',
            'trip_date' => 'sometimes|date',
            'departure_time' => 'sometimes|date_format:H:i',
            'price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:draft,active,cancelled,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Recalculate arrival time if needed
        if ($request->has('departure_time') || $request->has('duration')) {
            $departureTime = $request->departure_time ?? $voyage->departure_time;
            $duration = $request->duration ?? $voyage->duration;
            $request->merge(['arrival_time' => $this->calculateArrivalTime($departureTime, $duration)]);
        }

        $voyage->update($request->only([
            'bus_id', 'trip_date', 'departure_time', 'arrival_time', 
            'price', 'status', 'distance', 'duration'
        ]));

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

        // Verify voyage is complete
        $missing = [];
        if (!$voyage->departure_id) $missing[] = 'Ville de départ';
        if (!$voyage->destination_id) $missing[] = 'Ville d\'arrivée';
        if (!$voyage->bus_id) $missing[] = 'Bus assigné';
        if (!$voyage->trip_date) $missing[] = 'Date';
        if (!$voyage->departure_time) $missing[] = 'Heure de départ';
        if (!$voyage->price || $voyage->price <= 0) $missing[] = 'Tarifs';

        if (!empty($missing)) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible d\'activer. ' . implode(', ', $missing) . ' manquant(s)'
            ], 400);
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

        $voyage->status = 'suspended';
        if ($request->has('reason')) {
            // Store reason in a note field if available
        }
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
     * Calculate arrival time based on departure time and duration
     */
    private function calculateArrivalTime($departureTime, $duration)
    {
        if (!$duration) {
            return $departureTime;
        }

        try {
            $departure = Carbon::createFromFormat('H:i', $departureTime);
            list($hours, $minutes) = explode(':', $duration);
            $arrival = $departure->copy()->addHours((int)$hours)->addMinutes((int)$minutes);
            return $arrival->format('H:i');
        } catch (\Exception $e) {
            return $departureTime;
        }
    }

    /**
     * Get voyages calendar view
     */
    public function calendar(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $voyages = Trip::with(['departure', 'destination', 'bus'])
            ->whereYear('trip_date', $year)
            ->whereMonth('trip_date', $month)
            ->where('status', '!=', 'cancelled')
            ->orderBy('trip_date')
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
