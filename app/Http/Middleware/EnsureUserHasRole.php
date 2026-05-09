<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! $request->user()->role) {
            abort(403, 'Akses ditolak. Anda tidak memiliki role.');
        }

        if (! in_array($request->user()->role->name, $roles)) {
            abort(403, 'Akses ditolak. Role Anda tidak diizinkan.');
        }

        return $next($request);
    }
}
