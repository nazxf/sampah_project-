<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware: EnsureUserIsKepalaUnit
 *
 * Akses untuk role "kepala_unit" — read-only dan dibatasi ke unit-nya sendiri.
 * Otomatis menolak HTTP method non-GET (POST/PUT/PATCH/DELETE).
 */
class EnsureUserIsKepalaUnit
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isKepalaUnit()) {
            abort(403, 'Akses ditolak. Hanya Kepala Unit yang dapat mengakses.');
        }

        // Read-only enforcement (lapis 1: HTTP method)
        if (! $request->isMethod('GET') && ! $request->isMethod('HEAD')) {
            abort(403, 'Kepala Unit hanya memiliki akses lihat (read-only).');
        }

        // Pastikan user punya unit yang ditugaskan (scope wajib)
        if (! $user->unit_id) {
            abort(403, 'Akun Kepala Unit ini belum memiliki unit yang ditugaskan.');
        }

        return $next($request);
    }
}
