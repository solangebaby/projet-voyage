<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TripValidationController extends Controller
{
    /**
     * List all trips pending validation (admin)
     */
    public function pending(Request $request)
    {
        $query = Trip::with(['bus', 'departure', 'destination', 'departureAgency', 'agency'])
            ->where('validation_status', 'pending_validation');

        $trips = $query->orderBy('submitted_at', 'asc')->paginate(20);

        return response()->json(['success' => true, 'data' => $trips]);
    }

    /**
     * Approve a trip (admin)
     */
    public function approve(string $id)
    {
        $trip = Trip::find($id);
        if (!$trip) return response()->json(['message' => 'Voyage introuvable'], 404);

        if ($trip->validation_status !== 'pending_validation') {
            return response()->json(['message' => 'Ce voyage n\'est pas en attente de validation.'], 400);
        }

        $trip->update([
            'validation_status' => 'active',
            'status'            => 'active',
            'validated_at'      => now(),
            'validated_by'      => Auth::id(),
            'rejection_reason'  => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Voyage approuvé et visible sur la plateforme.',
            'data'    => $trip
        ]);
    }

    /**
     * Reject a trip (admin)
     */
    public function reject(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $trip = Trip::find($id);
        if (!$trip) return response()->json(['message' => 'Voyage introuvable'], 404);

        $trip->update([
            'validation_status' => 'rejected',
            'status'            => 'cancelled',
            'rejection_reason'  => $request->reason,
            'validated_at'      => now(),
            'validated_by'      => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Voyage rejeté.',
            'data'    => $trip
        ]);
    }

    /**
     * All trips with any validation status (admin overview)
     */
    public function allTrips(Request $request)
    {
        $query = Trip::with(['bus', 'departure', 'destination', 'departureAgency', 'agency']);

        if ($request->filled('validation_status')) $query->where('validation_status', $request->validation_status);
        if ($request->filled('agency_id')) $query->where('agency_id', $request->agency_id);
        if ($request->filled('date')) $query->whereDate('departure_date', $request->date);

        $trips = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json(['success' => true, 'data' => $trips]);
    }
}
