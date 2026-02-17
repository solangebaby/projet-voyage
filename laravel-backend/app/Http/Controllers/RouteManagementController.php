<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RouteManagementController extends Controller
{
    /**
     * Display a listing of all routes (trajets)
     */
    public function index()
    {
        $routes = Trip::with(['departure', 'destination', 'bus'])
            ->select('trips.*')
            ->selectRaw('CONCAT(departure.city_name, " → ", destination.city_name) as route_name')
            ->join('destinations as departure', 'trips.departure_id', '=', 'departure.id')
            ->join('destinations as destination', 'trips.destination_id', '=', 'destination.id')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $routes
        ]);
    }

    /**
     * Store a newly created route
     */
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'departure_id' => 'required|exists:destinations,id',
            'destination_id' => 'required|exists:destinations,id|different:departure_id',
            'distance' => 'required|numeric|min:0',
            'duration' => 'required|regex:/^([0-9]{1,2}):([0-5][0-9])$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if departure and destination are the same
        if ($request->departure_id == $request->destination_id) {
            return response()->json([
                'success' => false,
                'message' => 'La ville de départ et d\'arrivée ne peuvent pas être identiques'
            ], 400);
        }

        // Validate distance format
        if (!is_numeric($request->distance) || $request->distance <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez entrer une distance valide'
            ], 400);
        }

        // Validate duration format HH:MM
        if (!preg_match('/^([0-9]{1,2}):([0-5][0-9])$/', $request->duration)) {
            return response()->json([
                'success' => false,
                'message' => 'Durée estimée non valide (format: HH:MM)'
            ], 400);
        }

        // Check if route already exists
        $existingRoute = Trip::where('departure_id', $request->departure_id)
            ->where('destination_id', $request->destination_id)
            ->first();

        if ($existingRoute) {
            return response()->json([
                'success' => false,
                'message' => 'Ce trajet existe déjà !'
            ], 409);
        }

        // Get city names for response
        $departure = Destination::find($request->departure_id);
        $destination = Destination::find($request->destination_id);
        $routeName = "{$departure->city_name} → {$destination->city_name}";

        // Create route (as a trip template)
        $route = Trip::create([
            'departure_id' => $request->departure_id,
            'destination_id' => $request->destination_id,
            'distance' => $request->distance,
            'duration' => $request->duration,
            'bus_id' => null, // Will be assigned when creating actual voyage
            'trip_date' => null,
            'departure_time' => null,
            'arrival_time' => null,
            'price' => 0,
            // available_seats is calculated dynamically
            'occupied_seats' => '[]',
            'status' => 'template' // Special status for route templates
        ]);

        return response()->json([
            'success' => true,
            'message' => "Le trajet {$routeName} a été créé avec succès",
            'data' => $route->load(['departure', 'destination'])
        ], 201);
    }

    /**
     * Display the specified route
     */
    public function show($id)
    {
        $route = Trip::with(['departure', 'destination'])->find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Trajet non trouvé'
            ], 404);
        }

        // Count active voyages using this route
        $activeVoyagesCount = Trip::where('departure_id', $route->departure_id)
            ->where('destination_id', $route->destination_id)
            ->where('status', 'active')
            ->where('trip_date', '>=', now())
            ->count();

        return response()->json([
            'success' => true,
            'data' => $route,
            'active_voyages_count' => $activeVoyagesCount
        ]);
    }

    /**
     * Update the specified route
     */
    public function update(Request $request, $id)
    {
        $route = Trip::find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Trajet non trouvé'
            ], 404);
        }

        // Validation
        $validator = Validator::make($request->all(), [
            'departure_id' => 'sometimes|exists:destinations,id',
            'destination_id' => 'sometimes|exists:destinations,id',
            'distance' => 'sometimes|numeric|min:0',
            'duration' => 'sometimes|regex:/^([0-9]{1,2}):([0-5][0-9])$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate duration if provided
        if ($request->duration && !preg_match('/^([0-9]{1,2}):([0-5][0-9])$/', $request->duration)) {
            return response()->json([
                'success' => false,
                'message' => 'Durée estimée non valide (format: HH:MM)'
            ], 400);
        }

        // Check for future voyages using this route
        $futureVoyagesCount = Trip::where('departure_id', $route->departure_id)
            ->where('destination_id', $route->destination_id)
            ->where('status', 'active')
            ->where('trip_date', '>', now())
            ->count();

        // Update route
        $route->update($request->only(['departure_id', 'destination_id', 'distance', 'duration']));

        $message = 'Le trajet a été mis à jour';
        $warning = null;

        if ($futureVoyagesCount > 0) {
            $warning = "Cette modification affectera {$futureVoyagesCount} voyages futurs";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'warning' => $warning,
            'data' => $route->load(['departure', 'destination']),
            'future_voyages_count' => $futureVoyagesCount
        ]);
    }

    /**
     * Remove the specified route
     */
    public function destroy($id)
    {
        $route = Trip::find($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Trajet non trouvé'
            ], 404);
        }

        // Check if route is used in future voyages
        $futureVoyagesCount = Trip::where('departure_id', $route->departure_id)
            ->where('destination_id', $route->destination_id)
            ->where('status', 'active')
            ->where('trip_date', '>', now())
            ->count();

        if ($futureVoyagesCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Impossible de supprimer. {$futureVoyagesCount} voyages futurs utilisent ce trajet"
            ], 400);
        }

        // Check if route has historical voyages (past trips)
        $pastVoyagesCount = Trip::where('departure_id', $route->departure_id)
            ->where('destination_id', $route->destination_id)
            ->where('trip_date', '<=', now())
            ->count();

        if ($pastVoyagesCount > 0) {
            // Hide route but keep history
            $route->status = 'archived';
            $route->save();

            return response()->json([
                'success' => true,
                'message' => 'Le trajet sera masqué mais conservé dans l\'historique'
            ]);
        }

        $route->delete();

        return response()->json([
            'success' => true,
            'message' => 'Le trajet a été supprimé'
        ]);
    }

    /**
     * Calculate arrival time based on departure time and duration
     */
    public function calculateArrivalTime(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'departure_time' => 'required|date_format:H:i',
            'duration' => 'required|regex:/^([0-9]{1,2}):([0-5][0-9])$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $departure = \Carbon\Carbon::createFromFormat('H:i', $request->departure_time);
            list($hours, $minutes) = explode(':', $request->duration);
            $arrival = $departure->copy()->addHours((int)$hours)->addMinutes((int)$minutes);

            return response()->json([
                'success' => true,
                'arrival_time' => $arrival->format('H:i')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('messages.calculation_error')
            ], 400);
        }
    }
}
