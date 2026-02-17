<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AgencyController extends Controller
{
    /**
     * Get all agencies or filter by destination
     */
    public function index(Request $request)
    {
        $query = Agency::with('destination');

        // Filter by destination if provided
        if ($request->has('destination_id')) {
            $query->where('destination_id', $request->destination_id);
        }

        // Filter by city name if provided
        if ($request->has('city_name')) {
            $query->whereHas('destination', function($q) use ($request) {
                $q->where('city_name', 'like', '%' . $request->city_name . '%');
            });
        }

        // Only main stations if requested
        if ($request->has('main_only') && $request->main_only) {
            $query->where('is_main_station', true);
        }

        $agencies = $query->orderBy('is_main_station', 'desc')
                         ->orderBy('agency_name', 'asc')
                         ->get();

        return response()->json([
            'success' => true,
            'data' => $agencies
        ]);
    }

    /**
     * Get a specific agency
     */
    public function show($id)
    {
        $agency = Agency::with('destination')->find($id);

        if (!$agency) {
            return response()->json([
                'success' => false,
                'message' => 'Agency not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $agency
        ]);
    }

    /**
     * Create a new agency (Admin only)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'destination_id' => 'required|exists:destinations,id',
            'agency_name' => 'required|string|max:255',
            'neighborhood' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_main_station' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $agency = Agency::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Agency created successfully',
            'data' => $agency->load('destination')
        ], 201);
    }

    /**
     * Update an agency (Admin only)
     */
    public function update(Request $request, $id)
    {
        $agency = Agency::find($id);

        if (!$agency) {
            return response()->json([
                'success' => false,
                'message' => 'Agency not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'destination_id' => 'sometimes|exists:destinations,id',
            'agency_name' => 'sometimes|string|max:255',
            'neighborhood' => 'sometimes|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_main_station' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $agency->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Agency updated successfully',
            'data' => $agency->load('destination')
        ]);
    }

    /**
     * Delete an agency (Admin only)
     */
    public function destroy($id)
    {
        $agency = Agency::find($id);

        if (!$agency) {
            return response()->json([
                'success' => false,
                'message' => 'Agency not found'
            ], 404);
        }

        $agency->delete();

        return response()->json([
            'success' => true,
            'message' => 'Agency deleted successfully'
        ]);
    }
}
