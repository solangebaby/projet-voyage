<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CityManagementController extends Controller
{
    /**
     * Display a listing of all cities
     */
    public function index()
    {
        $cities = Destination::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    }

    /**
     * Store a newly created city
     */
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'city_name' => 'required|string|max:255',
            'region' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'status' => 'nullable|in:actif,inactif'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate city name (only alphabetic characters)
        if (!preg_match("/^[a-zA-ZÀ-ÿ\s\-']+$/u", $request->city_name)) {
            return response()->json([
                'success' => false,
                'message' => 'Entrez un nom valide'
            ], 400);
        }

        // Validate region if provided
        if ($request->region && !preg_match("/^[a-zA-ZÀ-ÿ\s\-']+$/u", $request->region)) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez entrer un nom de région valide'
            ], 400);
        }

        // Validate country if provided
        if ($request->country && !preg_match("/^[a-zA-ZÀ-ÿ\s\-']+$/u", $request->country)) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez entrer un nom de pays valide'
            ], 400);
        }

        // Check if city already exists
        $existingCity = Destination::where('city_name', $request->city_name)->first();
        if ($existingCity) {
            return response()->json([
                'success' => false,
                'message' => 'Cette ville existe déjà'
            ], 409);
        }

        // Create city
        $city = Destination::create([
            'city_name' => $request->city_name,
            'region' => $request->region ?? null,
            'country' => $request->country ?? 'Cameroun',
            'status' => $request->status ?? 'actif'
        ]);

        return response()->json([
            'success' => true,
            'message' => "Ville {$city->city_name} a été ajoutée avec succès",
            'data' => $city
        ], 201);
    }

    /**
     * Display the specified city
     */
    public function show($id)
    {
        $city = Destination::find($id);

        if (!$city) {
            return response()->json([
                'success' => false,
                'message' => 'Ville non trouvée'
            ], 404);
        }

        // Get trips count
        $tripsCount = $city->departureTrips()->where('status', 'active')->count() +
                     $city->destinationTrips()->where('status', 'active')->count();

        return response()->json([
            'success' => true,
            'data' => $city,
            'active_trips_count' => $tripsCount
        ]);
    }

    /**
     * Update the specified city
     */
    public function update(Request $request, $id)
    {
        $city = Destination::find($id);

        if (!$city) {
            return response()->json([
                'success' => false,
                'message' => 'Ville non trouvée'
            ], 404);
        }

        // Validation
        $validator = Validator::make($request->all(), [
            'city_name' => 'sometimes|string|max:255|unique:destinations,city_name,' . $id,
            'region' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'status' => 'nullable|in:actif,inactif'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate alphabetic characters
        if ($request->city_name && !preg_match("/^[a-zA-ZÀ-ÿ\s\-']+$/u", $request->city_name)) {
            return response()->json([
                'success' => false,
                'message' => 'Entrez un nom valide'
            ], 400);
        }

        if ($request->region && !preg_match("/^[a-zA-ZÀ-ÿ\s\-']+$/u", $request->region)) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez entrer un nom de région valide'
            ], 400);
        }

        if ($request->country && !preg_match("/^[a-zA-ZÀ-ÿ\s\-']+$/u", $request->country)) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez entrer un nom de pays valide'
            ], 400);
        }

        // Check if city is used in active trips
        $activeTripsCount = $city->departureTrips()->where('status', 'active')->count() +
                           $city->destinationTrips()->where('status', 'active')->count();

        if ($activeTripsCount > 0) {
            // Return warning but allow update
            $city->update($request->only(['city_name', 'region', 'country', 'status']));
            
            return response()->json([
                'success' => true,
                'message' => __('messages.city_updated'),
                'warning' => "Cette ville est utilisée dans {$activeTripsCount} trajets actifs",
                'data' => $city
            ]);
        }

        $city->update($request->only(['city_name', 'region', 'country', 'status']));

        return response()->json([
            'success' => true,
            'message' => __('messages.city_updated'),
            'data' => $city
        ]);
    }

    /**
     * Remove the specified city
     */
    public function destroy($id)
    {
        $city = Destination::find($id);

        if (!$city) {
            return response()->json([
                'success' => false,
                'message' => 'Ville non trouvée'
            ], 404);
        }

        // Check if city is used in active trips
        $activeTripsCount = $city->departureTrips()->where('status', 'active')->count() +
                           $city->destinationTrips()->where('status', 'active')->count();

        if ($activeTripsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Impossible de supprimer ! Cette ville est utilisée dans {$activeTripsCount} trajets actifs"
            ], 400);
        }

        $cityName = $city->city_name;
        $city->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.city_deleted')
        ]);
    }
}
