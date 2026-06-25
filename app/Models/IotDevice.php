<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * SIPESA — Perangkat IoT (Arduino + ESP8266 NodeMCU + HC-SR04 + GPS Neo-6M).
 *
 * 1 perangkat = 1 trash_bin (relasi 1:1).
 * device_token unik dipakai untuk autentikasi POST /api/sensor/update.
 */
class IotDevice extends Model
{
    protected $table = 'iot_devices';

    protected $fillable = [
        'trash_bin_id',
        'device_token',
        'device_token_hash',
        'nama_perangkat',
        'status_device',
        'last_ping_at',
        'firmware_version',
        'catatan',
    ];

    protected $casts = [
        'last_ping_at' => 'datetime',
    ];

    protected $hidden = [
        // Sembunyikan token dari serialisasi default — hanya tampil eksplisit.
        'device_token',
        'device_token_hash',
    ];

    // =========================================================
    // RELATIONS
    // =========================================================
    public function trashBin(): BelongsTo
    {
        return $this->belongsTo(TrashBin::class);
    }

    public function sensorLogs(): HasMany
    {
        return $this->hasMany(SensorLog::class);
    }

    public function gpsLogs(): HasMany
    {
        return $this->hasMany(GpsLog::class);
    }

    // =========================================================
    // TOKEN HANDLING
    // =========================================================
    public function setDeviceTokenAttribute(?string $value): void
    {
        $this->attributes['device_token'] = null;
        $this->attributes['device_token_hash'] = $value ? self::hashToken($value) : null;
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    public static function findByToken(string $token): ?self
    {
        $hash = self::hashToken($token);
        $device = self::with('trashBin')
            ->where('device_token_hash', $hash)
            ->first();

        if ($device) {
            return $device;
        }

        $device = self::with('trashBin')
            ->where('device_token', $token)
            ->first();

        if ($device && ! $device->device_token_hash) {
            $device->forceFill([
                'device_token' => null,
                'device_token_hash' => $hash,
            ])->save();
        }

        return $device;
    }

    // =========================================================
    // HELPERS
    // =========================================================

    /**
     * Apakah perangkat masih dianggap online?
     * Threshold (menit) dari config sipesa.iot.offline_threshold_minutes.
     */
    public function isOnline(): bool
    {
        if (! $this->last_ping_at) {
            return false;
        }

        $threshold = (int) config('sipesa.iot.offline_threshold_minutes', 15);

        return $this->last_ping_at->gt(now()->subMinutes($threshold));
    }

    /**
     * Generate device_token baru (panjang dari config sipesa.iot.device_token_length).
     * Tidak save otomatis — caller harus ->save().
     */
    public function regenerateToken(): string
    {
        $length = (int) config('sipesa.iot.device_token_length', 64);

        // Pakai random_bytes untuk entropi kuat, lalu hex agar URL-safe & cocok kolom string.
        $bytes = random_bytes(max(16, (int) ceil($length / 2)));
        $hex = bin2hex($bytes);

        $this->device_token = substr($hex, 0, max(32, min(128, $length)));

        return $this->device_token;
    }

    /**
     * Generate token statik (helper saat seeding/factory) tanpa instance.
     */
    public static function makeToken(?int $length = null): string
    {
        $length = $length ?? (int) config('sipesa.iot.device_token_length', 64);
        $hex = bin2hex(random_bytes(max(16, (int) ceil($length / 2))));

        return substr($hex, 0, max(32, min(128, $length)));
    }
}
