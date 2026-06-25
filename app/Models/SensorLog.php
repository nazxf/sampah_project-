<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SIPESA — Histori data sensor ultrasonik HC-SR04.
 *
 * Setiap ping IoT (POST /api/sensor/update) menulis 1 baris di sini.
 * Pakai untuk chart kepenuhan, audit trail, dan debug perangkat.
 */
class SensorLog extends Model
{
    protected $table = 'sensor_logs';

    protected $fillable = [
        'iot_device_id',
        'trash_bin_id',
        'jarak_cm',
        'persentase_kepenuhan',
    ];

    protected $casts = [
        'jarak_cm' => 'float',
        'persentase_kepenuhan' => 'float',
    ];

    // =========================================================
    // RELATIONS
    // =========================================================
    public function iotDevice(): BelongsTo
    {
        return $this->belongsTo(IotDevice::class);
    }

    public function trashBin(): BelongsTo
    {
        return $this->belongsTo(TrashBin::class);
    }

    // =========================================================
    // SCOPES
    // =========================================================

    /**
     * Hanya log dalam N jam terakhir (default 24).
     */
    public function scopeRecent(Builder $query, int $hours = 24): Builder
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }
}
