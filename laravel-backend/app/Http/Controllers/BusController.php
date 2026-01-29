<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BusController extends Controller
{
    /**
     * Display a listing of all buses
     */
    public function index()
    {
        $buses = Bus::all();

        return response()->json([
            'success' => true,
            'data' => $buses
        ]);
    }

    /**
     * Store a newly created bus
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bus_name' => 'required|string|max:255',
            'matricule' => 'required|string|max:50|unique:buses,matricule',
            'type' => 'required|in:standard,vip',
            'total_seats' => 'required|integer|min:1|max:100',
            'price' => 'required|numeric|min:0',
            'features' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $bus = Bus::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Bus created successfully',
            'data' => $bus
        ], 201);
    }

    /**
     * Display the specified bus
     */
    public function show(string $id)
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'success' => false,
                'message' => 'Bus not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $bus
        ]);
    }

    /**
     * Update the specified bus
     */
    public function update(Request $request, string $id)
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'success' => false,
                'message' => 'Bus not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'bus_name' => 'sometimes|string|max:255',
            'matricule' => 'sometimes|string|max:50|unique:buses,matricule,' . $id,
            'type' => 'sometimes|in:standard,vip',
            'total_seats' => 'sometimes|integer|min:1|max:100',
            'price' => 'sometimes|numeric|min:0',
            'features' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $bus->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Bus updated successfully',
            'data' => $bus
        ]);
    }

    /**
     * Remove the specified bus
     */
    public function destroy(string $id)
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'success' => false,
                'message' => 'Bus not found'
            ], 404);
        }

        // Check if bus has trips
        if ($bus->trips()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete bus with existing trips'
            ], 400);
        }

        $bus->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bus deleted successfully'
        ]);
    }
}
