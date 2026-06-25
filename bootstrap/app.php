<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\AddSecurityHeaders::class,
        ]);

        $middleware->api(append: [
            \App\Http\Middleware\AddSecurityHeaders::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'super_admin' => \App\Http\Middleware\EnsureUserIsSuperAdmin::class,
            'admin' => \App\Http\Middleware\EnsureUserIsAdminOrSuperAdmin::class,
            'petugas' => \App\Http\Middleware\EnsureUserIsPetugas::class,
            // SIPESA — role read-only baru
            'kepala_unit' => \App\Http\Middleware\EnsureUserIsKepalaUnit::class,
            'kepala_pusat' => \App\Http\Middleware\EnsureUserIsKepalaPusat::class,
            'viewer' => \App\Http\Middleware\EnsureUserCanView::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
