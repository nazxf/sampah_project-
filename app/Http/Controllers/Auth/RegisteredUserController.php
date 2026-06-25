<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'units' => Unit::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'no_telepon' => 'nullable|string|max:20',
            'unit_id' => 'required|exists:units,id',
        ]);

        $roleSiswa = Role::where('name', 'siswa')->first();

        if (! $roleSiswa) {
            throw ValidationException::withMessages([
                'email' => 'Registrasi belum dapat diproses karena role siswa belum tersedia. Jalankan seeder atau hubungi admin.',
            ]);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $roleSiswa?->id,
            'unit_id' => $request->unit_id,
            'no_telepon' => $request->no_telepon,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
