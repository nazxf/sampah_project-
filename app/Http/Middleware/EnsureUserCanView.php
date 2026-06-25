<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware: EnsureUserCanView
 *
 * Gerbang umum untuk semua role yang boleh melihat data SIPESA:
 * super_admin, admin_unit, kepala_unit, kepala_pusat.
 *
 * Khusus kepala_* otomatis di-block jika method non-GET (read-only enforcement).
 * Berguna untuk route GET (index/show) yang dipakai bersama oleh admin & kepala.
 */
class EnsureUserCanView
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->canView()) {
            abort(403, 'Akses ditolak. Anda tidak memiliki izin melihat data ini.');
        }

        // Lapis tambahan: kepala_* tidak boleh non-GET via gerbang ini
        if ($user->isKepala() && ! $request->isMethod('GET') && ! $request->isMethod('HEAD')) {
            abort(403, 'Akun Kepala hanya memiliki akses lihat (read-only).');
        }

        return $next($request);
    }
}
