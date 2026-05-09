<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdminOrSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || (! $request->user()->isSuperAdmin() && ! $request->user()->isAdminUnit())) {
            abort(403, 'Akses ditolak. Hanya Admin yang dapat mengakses.');
        }

        return $next($request);
    }
}
