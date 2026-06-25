<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'unit_id',
        'no_telepon',
        'alamat',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'avatar_url',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // =========================================================
    // RELATIONS
    // =========================================================
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function trashHistories(): HasMany
    {
        return $this->hasMany(TrashHistory::class);
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? Storage::url($this->avatar) : null;
    }

    protected static function booted(): void
    {
        static::deleted(function (User $user): void {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
        });
    }

    /**
     * Jadwal pengangkutan yang ditugaskan ke user ini (sebagai petugas).
     */
    public function pickupSchedules(): HasMany
    {
        return $this->hasMany(PickupSchedule::class, 'petugas_id');
    }

    /**
     * Notifikasi SIPESA (custom — tabel `sipesa_notifications`).
     * Beda dari Notifiable trait bawaan Laravel.
     */
    public function sipesaNotifications(): HasMany
    {
        return $this->hasMany(SipesaNotification::class);
    }

    // =========================================================
    // ROLE HELPERS — baca tipe akun dengan rapi
    // =========================================================
    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->role && in_array($this->role->name, $roles, true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isAdminUnit(): bool
    {
        return $this->hasRole('admin_unit');
    }

    public function isKepalaUnit(): bool
    {
        return $this->hasRole('kepala_unit');
    }

    public function isKepalaPusat(): bool
    {
        return $this->hasRole('kepala_pusat');
    }

    public function isPetugas(): bool
    {
        return $this->hasRole('petugas');
    }

    public function isSiswa(): bool
    {
        return $this->hasRole('siswa');
    }

    // =========================================================
    // CAPABILITY HELPERS — cek izin abstrak
    // =========================================================

    /**
     * Apakah user ini termasuk role kepala (read-only)?
     */
    public function isKepala(): bool
    {
        return $this->hasAnyRole(['kepala_unit', 'kepala_pusat']);
    }

    /**
     * Apakah user ini bisa edit/create/delete data?
     * Kepala (unit & pusat) hanya read-only.
     */
    public function canEdit(): bool
    {
        if (! $this->role) {
            return false;
        }

        return $this->hasAnyRole(['super_admin', 'admin_unit', 'petugas']);
    }

    /**
     * Apakah user bisa melihat (read) semua data unit?
     * Termasuk admin & kepala.
     */
    public function canView(): bool
    {
        return $this->hasAnyRole([
            'super_admin',
            'admin_unit',
            'kepala_unit',
            'kepala_pusat',
        ]);
    }

    /**
     * Apakah scope user dibatasi ke unit-nya saja?
     * (admin_unit & kepala_unit hanya unit sendiri.)
     */
    public function isScopedToUnit(): bool
    {
        return $this->hasAnyRole(['admin_unit', 'kepala_unit']);
    }

    /**
     * Apakah user bisa melihat semua unit (lintas-unit)?
     * (super_admin & kepala_pusat.)
     */
    public function canViewAllUnits(): bool
    {
        return $this->hasAnyRole(['super_admin', 'kepala_pusat']);
    }
}
