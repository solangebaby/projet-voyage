<?php

use Illuminate\Support\Facades\Route;
use App\Models\Ticket;
use App\Mail\TicketConfirmation;
use Illuminate\Support\Facades\Mail;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
Route::get('/test-mail', function () {
    $ticket = Ticket::first(); // Prends un ticket existant
    if (!$ticket) return "Aucun ticket en base de données";
    
    try {
        Mail::to("ton-email-perso@gmail.com")->send(new TicketConfirmation($ticket));
        return "Email envoyé !";
    } catch (\Exception $e) {
        return "Erreur : " . $e->getMessage();
    }
});
