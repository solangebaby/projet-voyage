<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AgencyManagementController extends Controller
{
    /** Admin: lister toutes les agences avec leur statut */
    public function index(Request $request)
    {
        $query = Agency::with(['destination:id,city_name,region', 'user:id,name,first_name,email,status'])
            ->withCount(['trips'])
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $query->where('agency_name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('status')) {
            $query->whereHas('user', fn($q) => $q->where('status', $request->status));
        }

        return response()->json(['data' => $query->paginate(20)]);
    }

    /** Admin: détail d'une agence */
    public function show(int $id)
    {
        $agency = Agency::with([
            'destination:id,city_name,region,country',
            'user:id,name,first_name,email,phone,status,created_at',
        ])
        ->withCount(['trips'])
        ->findOrFail($id);

        return response()->json(['data' => $agency]);
    }

    /** Admin: approuver une agence (activer son compte user) */
    public function approve(int $id)
    {
        $agency = Agency::with('user')->findOrFail($id);

        if (!$agency->user) {
            return response()->json(['message' => 'Aucun compte utilisateur lié à cette agence.'], 422);
        }

        $agency->user->update(['status' => 'active']);

        return response()->json([
            'message' => "Agence « {$agency->agency_name} » approuvée.",
            'data'    => $agency->fresh(['user:id,name,first_name,email,status']),
        ]);
    }

    /** Admin: suspendre une agence */
    public function suspend(int $id)
    {
        $agency = Agency::with('user')->findOrFail($id);

        if (!$agency->user) {
            return response()->json(['message' => 'Aucun compte utilisateur lié à cette agence.'], 422);
        }

        $agency->user->update(['status' => 'suspended']);

        return response()->json([
            'message' => "Agence « {$agency->agency_name} » suspendue.",
            'data'    => $agency->fresh(['user:id,name,first_name,email,status']),
        ]);
    }

    /** Admin: rejeter / supprimer une agence */
    public function reject(int $id)
    {
        $agency = Agency::with('user')->findOrFail($id);
        $name   = $agency->agency_name;

        if ($agency->user) {
            $agency->user->update(['status' => 'rejected']);
        }

        return response()->json(['message' => "Agence « {$name} » rejetée."]);
    }

    /** Admin: statistiques agences */
    public function stats()
    {
        return response()->json([
            'data' => [
                'total'     => Agency::count(),
                'active'    => Agency::whereHas('user', fn($q) => $q->where('status', 'active'))->count(),
                'pending'   => Agency::whereHas('user', fn($q) => $q->where('status', 'pending'))->count(),
                'suspended' => Agency::whereHas('user', fn($q) => $q->where('status', 'suspended'))->count(),
            ]
        ]);
    }
}
