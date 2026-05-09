<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'role_label' => $user->role?->label,
                    'unit_id' => $user->unit_id,
                    'unit_name' => $user->unit?->nama,
                    'no_telepon' => $user->no_telepon,
                    'alamat' => $user->alamat,
                    'avatar' => $user->avatar,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'roles' => fn () => \App\Models\Role::all(),
            'units' => fn () => \App\Models\Unit::all(),
        ];
    }
}
