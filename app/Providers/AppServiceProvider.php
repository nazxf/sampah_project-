<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        RateLimiter::for('sensor-updates', function (Request $request) {
            $token = $request->bearerToken() ?: (string) $request->input('device_token');
            $key = $token !== '' ? hash('sha256', $token) : $request->ip();

            return Limit::perMinute(60)->by($key);
        });

        RateLimiter::for('registration', function (Request $request) {
            $email = strtolower((string) $request->input('email'));
            $key = $email !== '' ? $request->ip() . '|' . hash('sha256', $email) : $request->ip();

            return Limit::perMinute(5)->by($key);
        });

        // =========================================================
        // GATE::before — Lapis ke-2 enforcement role read-only
        // =========================================================
        // Filosofi:
        //   Kepala (unit & pusat) hanya boleh melihat data, tidak boleh
        //   create/update/delete. Lapis ini bertindak sebagai jaring
        //   pengaman bila ada controller yang lupa pasang middleware.
        //
        //   Konvensi nama ability:
        //     - "view*"   -> diizinkan untuk kepala
        //     - "create*", "update*", "delete*", "manage*" -> ditolak
        //
        //   Super Admin tetap by-pass semua gate (akses penuh).
        // =========================================================
        Gate::before(function ($user, string $ability) {
            // Super Admin selalu bypass
            if ($user->isSuperAdmin()) {
                return true;
            }

            // Kepala (unit & pusat) -> read-only
            if ($user->isKepala()) {
                $readOnlyPrefixes = ['view', 'see', 'list', 'show', 'export'];

                foreach ($readOnlyPrefixes as $prefix) {
                    if (str_starts_with($ability, $prefix)) {
                        return true; // izinkan ability lihat
                    }
                }

                // Semua ability mutasi (create/update/delete/manage/etc.) ditolak
                return false;
            }

            // Role lain -> kembalikan null agar policy normal yang menentukan
            return null;
        });
    }
}
