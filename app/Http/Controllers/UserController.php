<?php

namespace App\Http\Controllers;

use App\Models\{User, Role, Unit, Activity};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = $request->user();

        if (!$currentUser->isSuperAdmin() && !$currentUser->isAdminUnit()) {
            abort(403);
        }

        $query = User::with(['role', 'unit']);

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($currentUser->isAdminUnit()) {
            $query->where('unit_id', $currentUser->unit_id);
        }

        $users = $query->latest()->paginate(15)->withQueryString()
            ->through(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role_id' => $u->role_id,
                'role' => $u->role?->label ?? $u->role?->name,
                'unit_id' => $u->unit_id,
                'unit' => $u->unit?->nama,
                'no_telepon' => $u->no_telepon,
                'alamat' => $u->alamat,
                'created_at' => $u->created_at->format('d M Y'),
            ]);

        $stats = [];
        foreach (Role::withCount('users')->get() as $role) {
            $stats[$role->name] = $role->users_count;
        }

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role_id', 'unit_id', 'search']),
            'roleList' => Role::all(),
            'unitList' => Unit::all(),
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
            'unit_id' => 'nullable|exists:units,id',
            'no_telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['email_verified_at'] = now();

        $user = User::create($validated);

        $this->logActivity('create', 'Menambahkan pengguna: ' . $user->name, $user->toArray());

        return redirect()->back()->with('success', 'Pengguna berhasil ditambahkan');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role_id' => 'required|exists:roles,id',
            'unit_id' => 'nullable|exists:units,id',
            'no_telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
        ]);

        if ($request->user()->id === $user->id) {
            unset($validated['role_id']);
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        $this->logActivity('update', 'Memperbarui pengguna: ' . $user->name, $user->getChanges());

        return redirect()->back()->with('success', 'Pengguna berhasil diperbarui');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            abort(403, 'Tidak dapat menghapus akun sendiri');
        }

        $this->logActivity('delete', 'Menghapus pengguna: ' . $user->name, $user->toArray());

        $user->delete();

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus');
    }

    private function logActivity(string $tipe, string $deskripsi, array $data = []): void
    {
        Activity::create([
            'user_id' => auth()->id(),
            'tipe' => $tipe,
            'deskripsi' => $deskripsi,
            'data' => json_encode($data),
        ]);
    }
}
