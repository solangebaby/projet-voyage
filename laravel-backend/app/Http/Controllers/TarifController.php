<?php

namespace App\Http\Controllers;

use App\Models\Tarif;
use App\Models\Destination;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TarifController extends Controller
{
    /**
     * Récupérer tous les tarifs
     */
    public function index(Request $request)
    {
        $query = Tarif::with(['departure', 'destination']);
        
        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('departure_id')) {
            $query->where('departure_id', $request->departure_id);
        }
        
        if ($request->has('destination_id')) {
            $query->where('destination_id', $request->destination_id);
        }
        
        $tarifs = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $tarifs
        ]);
    }

    /**
     * Récupérer un tarif spécifique
     */
    public function show($id)
    {
        $tarif = Tarif::with(['departure', 'destination', 'trips'])->find($id);
        
        if (!$tarif) {
            return response()->json([
                'success' => false,
                'message' => 'Tarif non trouvé'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $tarif
        ]);
    }

    /**
     * Créer un nouveau tarif
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'departure_id' => 'required|exists:destinations,id',
            'destination_id' => 'required|exists:destinations,id|different:departure_id',
            'price_adult' => 'required|numeric|min:0',
            'price_student' => 'nullable|numeric|min:0',
            'price_child' => 'nullable|numeric|min:0',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'valid_days' => 'nullable|array',
            'time_period' => 'nullable|in:all,day,night',
            'group_discount_percentage' => 'nullable|numeric|min:0|max:100',
            'group_discount_min_passengers' => 'nullable|integer|min:1',
            'status' => 'nullable|in:actif,inactif',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier si un tarif similaire existe déjà
        $existingTarif = Tarif::where('departure_id', $request->departure_id)
            ->where('destination_id', $request->destination_id)
            ->where('status', 'actif')
            ->first();

        if ($existingTarif) {
            return response()->json([
                'success' => false,
                'message' => 'Un tarif actif existe déjà pour ce trajet. Désactivez-le ou modifiez-le.'
            ], 422);
        }

        $tarif = Tarif::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tarif créé avec succès',
            'data' => $tarif->load(['departure', 'destination'])
        ], 201);
    }

    /**
     * Mettre à jour un tarif
     */
    public function update(Request $request, $id)
    {
        $tarif = Tarif::find($id);
        
        if (!$tarif) {
            return response()->json([
                'success' => false,
                'message' => 'Tarif non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'departure_id' => 'sometimes|exists:destinations,id',
            'destination_id' => 'sometimes|exists:destinations,id|different:departure_id',
            'price_adult' => 'sometimes|numeric|min:0',
            'price_student' => 'nullable|numeric|min:0',
            'price_child' => 'nullable|numeric|min:0',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'valid_days' => 'nullable|array',
            'time_period' => 'nullable|in:all,day,night',
            'group_discount_percentage' => 'nullable|numeric|min:0|max:100',
            'group_discount_min_passengers' => 'nullable|integer|min:1',
            'status' => 'nullable|in:actif,inactif',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier impact sur voyages existants
        $affectedTrips = Trip::where('tarif_id', $id)
            ->where('departure_date', '>=', now())
            ->count();

        $tarif->update($request->all());

        $message = 'Tarif mis à jour avec succès';
        if ($affectedTrips > 0) {
            $message .= ". Attention: {$affectedTrips} voyage(s) futur(s) utilisent ce tarif.";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $tarif->load(['departure', 'destination']),
            'affected_trips' => $affectedTrips
        ]);
    }

    /**
     * Supprimer un tarif
     */
    public function destroy($id)
    {
        $tarif = Tarif::find($id);
        
        if (!$tarif) {
            return response()->json([
                'success' => false,
                'message' => 'Tarif non trouvé'
            ], 404);
        }

        // Vérifier si le tarif est utilisé par des voyages futurs
        $futureTrips = Trip::where('tarif_id', $id)
            ->where('departure_date', '>=', now())
            ->count();

        if ($futureTrips > 0) {
            return response()->json([
                'success' => false,
                'message' => "Impossible de supprimer ce tarif. Il est utilisé par {$futureTrips} voyage(s) futur(s). Veuillez d'abord modifier ou supprimer ces voyages."
            ], 422);
        }

        $tarif->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tarif supprimé avec succès'
        ]);
    }

    /**
     * Récupérer les tarifs disponibles pour un trajet
     */
    public function getTarifsForRoute(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'departure_id' => 'required|exists:destinations,id',
            'destination_id' => 'required|exists:destinations,id',
            'date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $date = $request->date ?? now();
        $dayName = \Carbon\Carbon::parse($date)->locale('fr')->dayName;

        $tarifs = Tarif::forRoute($request->departure_id, $request->destination_id)
            ->active()
            ->get()
            ->filter(function ($tarif) use ($date, $dayName) {
                return $tarif->isValidForDate($date) && $tarif->isValidForDay($dayName);
            });

        return response()->json([
            'success' => true,
            'data' => $tarifs
        ]);
    }

    /**
     * Calculer le prix pour un groupe de passagers
     */
    public function calculatePrice(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'category' => 'required|in:adult,student,child',
            'number_of_passengers' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $tarif = Tarif::find($id);
        
        if (!$tarif) {
            return response()->json([
                'success' => false,
                'message' => 'Tarif non trouvé'
            ], 404);
        }

        $pricePerPerson = $tarif->calculatePrice(
            $request->category,
            $request->number_of_passengers
        );

        $totalPrice = $pricePerPerson * $request->number_of_passengers;

        return response()->json([
            'success' => true,
            'data' => [
                'price_per_person' => $pricePerPerson,
                'total_price' => $totalPrice,
                'discount_applied' => $tarif->group_discount_percentage && 
                                     $request->number_of_passengers >= $tarif->group_discount_min_passengers
            ]
        ]);
    }
}
