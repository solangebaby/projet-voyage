<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\Agency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PromotionController extends Controller
{
    /** Agence: lister ses promotions */
    public function index(Request $request)
    {
        $user   = Auth::user();
        $agency = Agency::where('user_id', $user->id)->firstOrFail();

        $promotions = Promotion::where('agency_id', $agency->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $promotions]);
    }

    /** Agence: créer une promotion */
    public function store(Request $request)
    {
        $user   = Auth::user();
        $agency = Agency::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'code'           => 'required|string|max:50|unique:promotions,code',
            'description'    => 'required|string|max:255',
            'discount_type'  => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_amount'     => 'nullable|numeric|min:0',
            'max_discount'   => 'nullable|numeric|min:0',
            'max_uses'       => 'nullable|integer|min:1',
            'valid_from'     => 'nullable|date',
            'valid_until'    => 'nullable|date|after_or_equal:valid_from',
            'is_active'      => 'boolean',
        ]);

        $promotion = Promotion::create([
            ...$validated,
            'agency_id'  => $agency->id,
            'uses_count' => 0,
        ]);

        return response()->json([
            'message' => 'Promotion créée avec succès.',
            'data'    => $promotion,
        ], 201);
    }

    /** Agence: modifier une promotion */
    public function update(Request $request, int $id)
    {
        $user      = Auth::user();
        $agency    = Agency::where('user_id', $user->id)->firstOrFail();
        $promotion = Promotion::where('agency_id', $agency->id)->findOrFail($id);

        $validated = $request->validate([
            'code'           => 'sometimes|string|max:50|unique:promotions,code,' . $id,
            'description'    => 'sometimes|string|max:255',
            'discount_type'  => 'sometimes|in:percent,fixed',
            'discount_value' => 'sometimes|numeric|min:0',
            'min_amount'     => 'nullable|numeric|min:0',
            'max_discount'   => 'nullable|numeric|min:0',
            'max_uses'       => 'nullable|integer|min:1',
            'valid_from'     => 'nullable|date',
            'valid_until'    => 'nullable|date',
            'is_active'      => 'boolean',
        ]);

        $promotion->update($validated);

        return response()->json([
            'message' => 'Promotion mise à jour.',
            'data'    => $promotion->fresh(),
        ]);
    }

    /** Agence: supprimer une promotion */
    public function destroy(int $id)
    {
        $user      = Auth::user();
        $agency    = Agency::where('user_id', $user->id)->firstOrFail();
        $promotion = Promotion::where('agency_id', $agency->id)->findOrFail($id);

        $promotion->delete();

        return response()->json(['message' => 'Promotion supprimée.']);
    }

    /** Agence: activer/désactiver */
    public function toggle(int $id)
    {
        $user      = Auth::user();
        $agency    = Agency::where('user_id', $user->id)->firstOrFail();
        $promotion = Promotion::where('agency_id', $agency->id)->findOrFail($id);

        $promotion->update(['is_active' => !$promotion->is_active]);

        return response()->json([
            'message' => $promotion->is_active ? 'Promotion activée.' : 'Promotion désactivée.',
            'data'    => $promotion,
        ]);
    }

    /** Public: vérifier et appliquer un code promo */
    public function apply(Request $request)
    {
        $validated = $request->validate([
            'code'      => 'required|string',
            'amount'    => 'required|numeric|min:0',
            'agency_id' => 'nullable|exists:agencies,id',
        ]);

        $query = Promotion::where('code', strtoupper($validated['code']));
        if (!empty($validated['agency_id'])) {
            $query->where(function ($q) use ($validated) {
                $q->where('agency_id', $validated['agency_id'])
                  ->orWhereNull('agency_id');
            });
        }

        $promotion = $query->first();

        if (!$promotion || !$promotion->isValid()) {
            return response()->json([
                'message' => 'Code promo invalide ou expiré.',
                'valid'   => false,
            ], 422);
        }

        $originalAmount  = $validated['amount'];
        $discountedAmount = $promotion->applyTo($originalAmount);
        $discount         = $originalAmount - $discountedAmount;

        return response()->json([
            'valid'            => true,
            'promotion'        => $promotion,
            'original_amount'  => $originalAmount,
            'discount'         => round($discount, 2),
            'final_amount'     => round($discountedAmount, 2),
        ]);
    }

    /** Admin: toutes les promotions */
    public function adminIndex(Request $request)
    {
        $promotions = Promotion::with('agency:id,agency_name')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['data' => $promotions]);
    }
}
