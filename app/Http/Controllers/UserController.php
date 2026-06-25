<?php

namespace App\Http\Controllers;

use App\Models\{User, Role, Unit, Activity};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    private const ADMIN_UNIT_ASSIGNABLE_ROLES = ['kepala_unit', 'petugas', 'siswa'];

    public function index(Request $request)
    {
        $currentUser = $request->user();

        if (!$currentUser->isSuperAdmin() && !$currentUser->isAdminUnit()) {
            abort(403);
        }

        $query = User::with(['role', 'unit']);

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->integer('role_id'));
        }

        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->integer('unit_id'));
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

        $stats = [
            'total' => (clone $query)->count(),
        ];

        $users = $query->latest()->paginate(15)->withQueryString()
            ->through(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role_id' => $u->role_id,
                'role' => $u->role?->name,
                'role_label' => $u->role?->label ?? $u->role?->name,
                'unit_id' => $u->unit_id,
                'unit' => $u->unit ? [
                    'id' => $u->unit->id,
                    'nama' => $u->unit->nama,
                ] : null,
                'no_telepon' => $u->no_telepon,
                'alamat' => $u->alamat,
                'created_at' => $u->created_at->format('d M Y'),
            ]);

        foreach ($this->roleStatsQuery($currentUser)->get() as $role) {
            $stats[$role->name] = $role->users_count;
        }

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role_id', 'unit_id', 'search']),
            'roleList' => $currentUser->isAdminUnit()
                ? Role::whereIn('name', self::ADMIN_UNIT_ASSIGNABLE_ROLES)->get()
                : Role::all(),
            'unitList' => $currentUser->isAdminUnit()
                ? Unit::where('id', $currentUser->unit_id)->get()
                : Unit::all(),
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();

        if ($currentUser->isAdminUnit()) {
            $request->merge(['unit_id' => $currentUser->unit_id]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => ['required', 'string', 'max:255', Password::defaults()],
            'role_id' => 'required|exists:roles,id',
            'unit_id' => 'nullable|exists:units,id',
            'no_telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string|max:1000',
        ]);

        $this->authorizeAssignableRole($currentUser, (int) $validated['role_id']);

        $validated['password'] = Hash::make($validated['password']);
        $validated['email_verified_at'] = now();

        $user = User::create($validated);

        $this->logActivity('create', 'Menambahkan pengguna: ' . $user->name, $this->safeUserActivityData($user->toArray()));

        return redirect()->back()->with('success', 'Pengguna berhasil ditambahkan');
    }

    public function update(Request $request, User $user)
    {
        $currentUser = $request->user();
        $this->authorizeUserManagement($currentUser, $user);

        if ($currentUser->isAdminUnit()) {
            $request->merge(['unit_id' => $currentUser->unit_id]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'max:255', Password::defaults()],
            'role_id' => 'required|exists:roles,id',
            'unit_id' => 'nullable|exists:units,id',
            'no_telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string|max:1000',
        ]);

        if ($request->user()->id === $user->id) {
            unset($validated['role_id']);
        } else {
            $this->authorizeAssignableRole($currentUser, (int) $validated['role_id']);
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        $this->logActivity('update', 'Memperbarui pengguna: ' . $user->name, $this->safeUserActivityData($user->getChanges()));

        return redirect()->back()->with('success', 'Pengguna berhasil diperbarui');
    }

    public function destroy(User $user)
    {
        $this->authorizeUserManagement(auth()->user(), $user);

        if ($user->id === auth()->id()) {
            abort(403, 'Tidak dapat menghapus akun sendiri');
        }

        $this->logActivity('delete', 'Menghapus pengguna: ' . $user->name, $this->safeUserActivityData($user->toArray()));

        $user->delete();

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus');
    }

    private function logActivity(string $tipe, string $deskripsi, array $data = []): void
    {
        Activity::create([
            'user_id' => auth()->id(),
            'tipe' => $tipe,
            'deskripsi' => $deskripsi,
            'data' => $data,
        ]);
    }

    private function roleStatsQuery(User $currentUser)
    {
        return Role::withCount([
            'users' => function ($query) use ($currentUser) {
                if ($currentUser->isAdminUnit()) {
                    $query->where('unit_id', $currentUser->unit_id);
                }
            },
        ]);
    }

    private function safeUserActivityData(array $data): array
    {
        unset($data['password'], $data['remember_token'], $data['avatar_url']);

        return $data;
    }

    private function authorizeUserManagement(User $currentUser, User $targetUser): void
    {
        if ($currentUser->isSuperAdmin()) {
            return;
        }

        if ($currentUser->isAdminUnit() && $targetUser->unit_id === $currentUser->unit_id) {
            if ($targetUser->hasRole('super_admin') || $targetUser->hasRole('kepala_pusat')) {
                abort(403, 'Admin unit tidak dapat mengelola role tingkat pusat.');
            }

            return;
        }

        abort(403, 'Anda tidak memiliki akses mengelola pengguna ini.');
    }

    private function authorizeAssignableRole(User $currentUser, int $roleId): void
    {
        if ($currentUser->isSuperAdmin()) {
            return;
        }

        $role = Role::findOrFail($roleId);

        if ($currentUser->isAdminUnit() && in_array($role->name, self::ADMIN_UNIT_ASSIGNABLE_ROLES, true)) {
            return;
        }

        abort(403, 'Admin unit tidak dapat memberikan role ini.');
    }
}
