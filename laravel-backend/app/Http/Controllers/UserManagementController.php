<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Reservation;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Mail\UserCredentialsActivated;

class UserManagementController extends Controller
{
    /**
     * Get all users (Admin only)
     */
    public function index(Request $request)
    {
        $query = User::withCount(['reservations']);

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get a specific user
     */
    public function show($id)
    {
        $user = User::with(['reservations.trip', 'reservations.payment', 'reservations.ticket'])
                    ->withCount(['reservations'])
                    ->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Activate a user account (Admin only)
     * This is triggered when:
     * 1. User has made a payment
     * 2. User has downloaded their ticket
     */
    public function activate($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Check if user has at least one confirmed reservation with payment and downloaded ticket
        $hasValidReservation = Reservation::where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->whereHas('payment', function($query) {
                $query->where('status', 'completed');
            })
            ->whereHas('ticket', function($query) {
                $query->whereNotNull('downloaded_at');
            })
            ->exists();

        if (!$hasValidReservation) {
            return response()->json([
                'success' => false,
                'message' => 'L\'utilisateur doit avoir au moins une réservation confirmée avec paiement effectué et ticket téléchargé'
            ], 400);
        }

        if ($user->status === 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Le compte est déjà activé'
            ], 400);
        }

        // Activate user
        $user->status = 'active';
        $user->save();

        // Send credentials email
        try {
            Mail::to($user->email)->send(new UserCredentialsActivated($user));
            
            return response()->json([
                'success' => true,
                'message' => 'Compte activé avec succès. Email d\'activation envoyé.',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send activation email: ' . $e->getMessage());
            
            return response()->json([
                'success' => true,
                'message' => 'Compte activé mais échec d\'envoi de l\'email',
                'data' => $user
            ]);
        }
    }

    /**
     * Deactivate a user account (Admin only)
     */
    public function deactivate($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de désactiver un compte administrateur'
            ], 400);
        }

        $user->status = 'inactive';
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Compte désactivé avec succès',
            'data' => $user
        ]);
    }

    /**
     * Update user information
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'first_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'sometimes|string|max:20',
            'role' => 'sometimes|in:admin,voyageur',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only([
            'name', 'first_name', 'email', 'phone', 'role', 'status'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => $user
        ]);
    }

    /**
     * Delete a user (Admin only)
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un compte administrateur'
            ], 400);
        }

        // Check if user has active reservations
        $hasActiveReservations = Reservation::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($hasActiveReservations) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un utilisateur avec des réservations actives'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    /**
     * Get user statistics
     */
    public function statistics()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'inactive_users' => User::where('status', 'inactive')->count(),
            'voyageurs' => User::where('role', 'voyageur')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'recent_registrations' => User::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
