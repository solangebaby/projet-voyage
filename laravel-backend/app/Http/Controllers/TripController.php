<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TripController extends Controller
{
    /**
     * Display a listing of all trips
     */
    public function index()
    {
        $trips = Trip::with(['bus', 'departure', 'destination', 'departureAgency', 'arrivalAgency'])
            ->where('status', 'active')
            ->orderBy('departure_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trips
        ]);
    }

    /**
     * Search trips by criteria with reserved seats info
     */
    public function search(Request $request)
    {
        $query = Trip::with(['bus', 'departure', 'destination', 'departureAgency', 'arrivalAgency'])
            ->where('status', 'active');

        if ($request->has('departure')) {
            $query->whereHas('departure', function($q) use ($request) {
                $q->where('city_name', 'like', '%' . $request->departure . '%');
            });
        }

        if ($request->has('destination')) {
            $query->whereHas('destination', function($q) use ($request) {
                $q->where('city_name', 'like', '%' . $request->destination . '%');
            });
        }

        if ($request->has('date')) {
            $query->whereDate('departure_date', $request->date);
        }

        $trips = $query->orderBy('departure_date', 'asc')->get();

        // Add reserved seats count for each trip
        $trips->each(function($trip) {
            $trip->reserved_seats_count = $trip->reservations()
                ->whereNotIn('status', ['cancelled'])
                ->count();
            $trip->available_seats_count = $trip->bus->total_seats - $trip->reserved_seats_count;
        });

        return response()->json([
            'success' => true,
            'data' => $trips
        ]);
    }

    /**
     * Store a newly created trip
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bus_id' => 'required|exists:buses,id',
            'departure_id' => 'required|exists:destinations,id',
            'destination_id' => 'required|exists:destinations,id|different:departure_id',
            'departure_date' => 'required|date|after_or_equal:today',
            'departure_time' => 'required',
            'arrival_date' => 'required|date|after_or_equal:departure_date',
            'arrival_time' => 'required',
            'distance_km' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get bus total seats
        $bus = \App\Models\Bus::find($request->bus_id);

        $trip = Trip::create([
            'bus_id' => $request->bus_id,
            'departure_id' => $request->departure_id,
            'destination_id' => $request->destination_id,
            'departure_date' => $request->departure_date,
            'departure_time' => $request->departure_time,
            'arrival_date' => $request->arrival_date,
            'arrival_time' => $request->arrival_time,
            // available_seats is calculated dynamically
            'occupied_seats' => [],
            'distance_km' => $request->distance_km,
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trip created successfully',
            'data' => $trip->load(['bus', 'departure', 'destination'])
        ], 201);
    }

    /**
     * Display the specified trip with reserved seats
     */
    public function show(string $id)
    {
        $trip = Trip::with(['bus', 'departure', 'destination', 'departureAgency', 'arrivalAgency'])->find($id);

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'Trip not found'
            ], 404);
        }

        // Get all reserved seats for this trip (excluding cancelled reservations)
        $reservedSeats = $trip->reservations()
            ->whereNotIn('status', ['cancelled'])
            ->pluck('selected_seat')
            ->toArray();

        $tripData = $trip->toArray();
        $tripData['reserved_seats'] = $reservedSeats;

        return response()->json([
            'success' => true,
            'data' => $tripData
        ]);
    }

    /**
     * Update the specified trip
     */
    public function update(Request $request, string $id)
    {
        $trip = Trip::find($id);

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'Trip not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'bus_id' => 'sometimes|exists:buses,id',
            'departure_id' => 'sometimes|exists:destinations,id',
            'destination_id' => 'sometimes|exists:destinations,id',
            'departure_date' => 'sometimes|date',
            'departure_time' => 'sometimes',
            'arrival_date' => 'sometimes|date',
            'arrival_time' => 'sometimes',
            'distance_km' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:active,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $trip->update($request->only([
            'bus_id', 'departure_id', 'destination_id', 
            'departure_date', 'departure_time', 'arrival_date', 
            'arrival_time', 'distance_km', 'status'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Trip updated successfully',
            'data' => $trip->load(['bus', 'departure', 'destination'])
        ]);
    }

    /**
     * Remove the specified trip
     */
    public function destroy(string $id)
    {
        $trip = Trip::find($id);

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'Trip not found'
            ], 404);
        }

        // Check if trip has reservations
        if ($trip->reservations()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete trip with existing reservations'
            ], 400);
        }

        $trip->delete();

        return response()->json([
            'success' => true,
            'message' => 'Trip deleted successfully'
        ]);
    }
}
