<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
   public function setupAccount(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email'                 => 'required|email|unique:users,email',
        'password'              => 'required|min:6|confirmed',
        'reservation_id'        => 'required', // On valide juste la présence ici pour plus de souplesse
        'passenger_first_name'  => 'required|string',
        'passenger_last_name'   => 'required|string',
        'passenger_phone'       => 'nullable|string', // AJOUTÉ : pour éviter l'erreur 422
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false, 
            'errors' => $validator->errors()
        ], 422);
    }

    // 1. Créer l'utilisateur
    $user = User::create([
        'name'       => $request->passenger_last_name,
        'first_name' => $request->passenger_first_name,
        'email'      => $request->email,
        'password'   => Hash::make($request->password),
        'role'       => 'voyageur',
        'status'     => 'active',
    ]);

    // 2. Lier la réservation
    // On cherche l'ID soit dans reservation_id soit via le modèle si nécessaire
    $resId = $request->reservation_id;
    $reservation = Reservation::find($resId);
    
    if ($reservation) {
        $reservation->user_id = $user->id;
        $reservation->passenger_email = $user->email;
        $reservation->save();
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'token'   => $token,
        'user'    => $user
    ], 201);
}

    public function login(Request $request) {
        $request->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }
        return response()->json([
            'token' => $user->createToken('token')->plainTextToken,
            'user' => $user
        ]);
    }
}