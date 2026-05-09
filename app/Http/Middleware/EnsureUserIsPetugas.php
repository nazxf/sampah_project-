<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsPetugas
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isPetugas()) {
            abort(403, 'Akses ditolak. Hanya Petugas yang dapat mengakses.');
        }

        return $next($request);
    }
}
