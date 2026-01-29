<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DestinationController extends Controller
{
    /**
     * Display a listing of all destinations
     */
    public function index()
    {
        $destinations = Destination::all();

        return response()->json([
            'success' => true,
            'data' => $destinations
        ]);
    }

    /**
     * Store a newly created destination
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city_name' => 'required|string|max:255|unique:destinations,city_name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $destination = Destination::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Destination created successfully',
            'data' => $destination
        ], 201);
    }

    /**
     * Display the specified destination
     */
    public function show(string $id)
    {
        $destination = Destination::find($id);

        if (!$destination) {
            return response()->json([
                'success' => false,
                'message' => 'Destination not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $destination
        ]);
    }

    /**
     * Update the specified destination
     */
    public function update(Request $request, string $id)
    {
        $destination = Destination::find($id);

        if (!$destination) {
            return response()->json([
                'success' => false,
                'message' => 'Destination not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'city_name' => 'sometimes|string|max:255|unique:destinations,city_name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $destination->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Destination updated successfully',
            'data' => $destination
        ]);
    }

    /**
     * Remove the specified destination
     */
    public function destroy(string $id)
    {
        $destination = Destination::find($id);

        if (!$destination) {
            return response()->json([
                'success' => false,
                'message' => 'Destination not found'
            ], 404);
        }

        // Check if destination is used in trips
        $tripsCount = $destination->departureTrips()->count() + $destination->destinationTrips()->count();
        
        if ($tripsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete destination with existing trips'
            ], 400);
        }

        $destination->delete();

        return response()->json([
            'success' => true,
            'message' => 'Destination deleted successfully'
        ]);
    }
}
