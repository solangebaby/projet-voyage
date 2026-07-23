<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AgencyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'agence') {
            return response()->json(['message' => 'Accès refusé. Espace réservé aux agences.'], 403);
        }

        return $next($request);
    }
}
