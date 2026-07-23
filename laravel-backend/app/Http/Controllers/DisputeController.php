<?php

namespace App\Http\Controllers;

use App\Models\Dispute;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DisputeController extends Controller
{
    /** Voyageur: lister ses propres litiges */
    public function userDisputes(Request $request)
    {
        $disputes = Dispute::where('user_id', Auth::id())
            ->with(['agency:id,agency_name', 'reservation:id,trip_id,selected_seat'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $disputes]);
    }

    /** Voyageur: créer un litige */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservation_id' => 'nullable|exists:reservations,id',
            'agency_id'      => 'nullable|exists:agencies,id',
            'type'           => 'required|in:cancellation,delay,overcharge,quality,lost_luggage,other',
            'subject'        => 'required|string|max:255',
            'description'    => 'required|string|min:20',
        ]);

        // Auto-link agency from reservation if not provided
        if (!empty($validated['reservation_id']) && empty($validated['agency_id'])) {
            $reservation = Reservation::with('trip.departureAgency')->find($validated['reservation_id']);
            if ($reservation && $reservation->trip && $reservation->trip->departureAgency) {
                $validated['agency_id'] = $reservation->trip->departureAgency->id;
            }
        }

        $dispute = Dispute::create([
            ...$validated,
            'user_id' => Auth::id(),
            'status'  => 'open',
        ]);

        return response()->json([
            'message' => 'Réclamation soumise avec succès.',
            'data'    => $dispute->load(['agency:id,agency_name', 'reservation:id,trip_id,selected_seat']),
        ], 201);
    }

    /** Admin: lister tous les litiges */
    public function index(Request $request)
    {
        $query = Dispute::with([
            'user:id,name,first_name,email',
            'agency:id,agency_name',
            'reservation:id,trip_id,selected_seat',
            'resolver:id,name,first_name',
        ])->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('agency_id')) {
            $query->where('agency_id', $request->agency_id);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('subject', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json(['data' => $query->paginate(20)]);
    }

    /** Admin: voir un litige */
    public function show(int $id)
    {
        $dispute = Dispute::with([
            'user:id,name,first_name,email,phone',
            'agency:id,agency_name,phone,address',
            'reservation.trip',
            'resolver:id,name,first_name',
        ])->findOrFail($id);

        return response()->json(['data' => $dispute]);
    }

    /** Admin: mettre à jour le statut / résoudre */
    public function update(Request $request, int $id)
    {
        $dispute = Dispute::findOrFail($id);

        $validated = $request->validate([
            'status'     => 'required|in:open,in_review,resolved,closed,rejected',
            'resolution' => 'nullable|string',
        ]);

        $dispute->update([
            'status'      => $validated['status'],
            'resolution'  => $validated['resolution'] ?? $dispute->resolution,
            'resolved_by' => in_array($validated['status'], ['resolved', 'closed', 'rejected']) ? Auth::id() : $dispute->resolved_by,
            'resolved_at' => in_array($validated['status'], ['resolved', 'closed', 'rejected']) ? now() : $dispute->resolved_at,
        ]);

        return response()->json([
            'message' => 'Litige mis à jour.',
            'data'    => $dispute->fresh(['user:id,name,first_name,email', 'agency:id,agency_name', 'resolver:id,name,first_name']),
        ]);
    }

    /** Admin: statistiques litiges */
    public function stats()
    {
        return response()->json([
            'data' => [
                'total'     => Dispute::count(),
                'open'      => Dispute::where('status', 'open')->count(),
                'in_review' => Dispute::where('status', 'in_review')->count(),
                'resolved'  => Dispute::where('status', 'resolved')->count(),
                'by_type'   => Dispute::selectRaw('type, count(*) as count')->groupBy('type')->get(),
            ]
        ]);
    }
}
