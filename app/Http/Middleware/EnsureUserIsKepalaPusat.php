<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware: EnsureUserIsKepalaPusat
 *
 * Akses untuk role "kepala_pusat" — read-only lintas-unit (semua unit terlihat).
 * Otomatis menolak HTTP method non-GET.
 */
class EnsureUserIsKepalaPusat
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isKepalaPusat()) {
            abort(403, 'Akses ditolak. Hanya Kepala Pusat yang dapat mengakses.');
        }

        // Read-only enforcement (lapis 1: HTTP method)
        if (! $request->isMethod('GET') && ! $request->isMethod('HEAD')) {
            abort(403, 'Kepala Pusat hanya memiliki akses lihat (read-only).');
        }

        return $next($request);
    }
}
