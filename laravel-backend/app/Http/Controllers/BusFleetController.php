<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BusFleetController extends Controller
{
    /**
     * Display a listing of all buses
     */
    public function index()
    {
        $buses = Bus::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $buses
        ]);
    }

    /**
     * Store a newly created bus with seat configuration
     */
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'bus_name' => 'required|string|max:255',
            'internal_number' => 'nullable|string|max:255',
            'registration' => 'required|string|max:255|unique:buses,registration',
            'brand' => 'nullable|string|max:255',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'type' => 'required|in:standard,vip',
            'total_seats' => 'required|integer|min:1|max:100',
            'state' => 'nullable|in:actif,en_maintenance,hors_service',
            'seat_configuration' => 'nullable|json'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if registration already exists
        if (Bus::where('registration', $request->registration)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cette immatriculation est déjà enregistrée'
            ], 409);
        }

        // Generate default seat configuration if not provided
        $seatConfig = $request->seat_configuration 
            ? json_decode($request->seat_configuration, true)
            : $this->generateDefaultSeatConfiguration($request->total_seats);

        // Create bus
        $bus = Bus::create([
            'bus_name' => $request->bus_name,
            'internal_number' => $request->internal_number,
            'registration' => $request->registration,
            'brand' => $request->brand,
            'year' => $request->year,
            'matricule' => $request->registration, // For compatibility
            'type' => $request->type,
            'state' => $request->state ?? 'actif',
            'total_seats' => $request->total_seats,
            'seat_configuration' => json_encode($seatConfig),
            'price' => 0, // Default price
            'features' => json_encode([])
        ]);

        return response()->json([
            'success' => true,
            'message' => "Le bus {$bus->bus_name} a été ajouté avec succès",
            'data' => $bus
        ], 201);
    }

    /**
     * Display the specified bus
     */
    public function show($id)
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'success' => false,
                'message' => 'Bus non trouvé'
            ], 404);
        }

        // Count active trips using this bus
        $activeTripsCount = $bus->trips()->where('status', 'active')
            ->where('departure_date', '>=', now()->toDateString())
            ->count();

        return response()->json([
            'success' => true,
            'data' => $bus,
            'active_trips_count' => $activeTripsCount
        ]);
    }

    /**
     * Update the specified bus
     */
    public function update(Request $request, $id)
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'success' => false,
                'message' => 'Bus non trouvé'
            ], 404);
        }

        // Validation
        $validator = Validator::make($request->all(), [
            'bus_name' => 'sometimes|string|max:255',
            'internal_number' => 'nullable|string|max:255',
            'registration' => 'sometimes|string|max:255|unique:buses,registration,' . $id,
            'brand' => 'nullable|string|max:255',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'type' => 'sometimes|in:standard,vip',
            'total_seats' => 'sometimes|integer|min:1|max:100',
            'state' => 'nullable|in:actif,en_maintenance,hors_service',
            'maintenance_note' => 'nullable|string',
            'seat_configuration' => 'nullable|json'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // If changing to maintenance, check for assigned trips
        if ($request->state === 'en_maintenance' && $bus->state !== 'en_maintenance') {
            $assignedTrips = $bus->trips()
                ->where('status', 'active')
                ->where('departure_date', '>=', now()->toDateString())
                ->count();

            if ($assignedTrips > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Le bus est assigné à {$assignedTrips} voyages durant cette période",
                    'assigned_trips' => $assignedTrips,
                    'warning' => true
                ], 200);
            }
        }

        // Update bus
        $updateData = $request->only([
            'bus_name', 'internal_number', 'registration', 'brand', 
            'year', 'type', 'total_seats', 'state', 'maintenance_note'
        ]);

        if ($request->has('seat_configuration')) {
            $updateData['seat_configuration'] = $request->seat_configuration;
        }

        // Update matricule for compatibility
        if ($request->has('registration')) {
            $updateData['matricule'] = $request->registration;
        }

        $bus->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Bus mis à jour avec succès',
            'data' => $bus->fresh()
        ]);
    }

    /**
     * Remove the specified bus
     */
    public function destroy($id)
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'success' => false,
                'message' => 'Bus non trouvé'
            ], 404);
        }

        // Check if bus is assigned to future trips
        $futureTripsCount = $bus->trips()
            ->where('status', 'active')
            ->where('departure_date', '>', now()->toDateString())
            ->count();

        if ($futureTripsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Impossible. Ce bus est assigné à {$futureTripsCount} voyages futurs"
            ], 400);
        }

        // Check if bus has historical trips
        $pastTripsCount = $bus->trips()->count();

        if ($pastTripsCount > 0) {
            // Archive instead of delete
            $bus->state = 'hors_service';
            $bus->save();

            return response()->json([
                'success' => true,
                'message' => 'Le bus a été archivé mais les données historiques sont conservées'
            ]);
        }

        $bus->delete();

        return response()->json([
            'success' => true,
            'message' => 'Le bus a été supprimé de la flotte'
        ]);
    }

    /**
     * Generate default seat configuration (2+2 layout)
     */
    private function generateDefaultSeatConfiguration($totalSeats)
    {
        $seats = [];
        $rows = ceil($totalSeats / 4);
        $seatIndex = 0;

        for ($row = 1; $row <= $rows; $row++) {
            // Left side: A, B
            foreach (['A', 'B'] as $letter) {
                if ($seatIndex < $totalSeats) {
                    $seats[] = [
                        'id' => $letter . $row,
                        'row' => $row,
                        'column' => $letter,
                        'position' => $letter === 'A' ? 'fenêtre' : 'couloir',
                        'type' => 'standard',
                        'status' => 'disponible',
                        'equipment' => []
                    ];
                    $seatIndex++;
                }
            }

            // Right side: C, D
            foreach (['C', 'D'] as $letter) {
                if ($seatIndex < $totalSeats) {
                    $seats[] = [
                        'id' => $letter . $row,
                        'row' => $row,
                        'column' => $letter,
                        'position' => $letter === 'C' ? 'couloir' : 'fenêtre',
                        'type' => 'standard',
                        'status' => 'disponible',
                        'equipment' => []
                    ];
                    $seatIndex++;
                }
            }
        }

        return $seats;
    }

    /**
     * Update seat configuration
     */
    public function updateSeatConfiguration(Request $request, $id)
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'success' => false,
                'message' => 'Bus non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'seat_configuration' => 'required|json'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $seatConfig = json_decode($request->seat_configuration, true);
        $availableSeats = count(array_filter($seatConfig, function($seat) {
            return $seat['status'] !== 'hors_service';
        }));

        $bus->update([
            'seat_configuration' => $request->seat_configuration,
            'total_seats' => count($seatConfig)
        ]);

        return response()->json([
            'success' => true,
            'message' => __('messages.seat_configuration_updated', ['available_seats' => $availableSeats]),
            'data' => $bus->fresh()
        ]);
    }
}
