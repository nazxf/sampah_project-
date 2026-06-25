<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SIPESA — Histori koordinat GPS Neo-6M.
 *
 * Dicatat tiap ping perangkat. Berguna untuk:
 *  - audit posisi tong
 *  - deteksi tong dipindah
 *  - peta historis pergerakan (jika tong mobile)
 */
class GpsLog extends Model
{
    protected $table = 'gps_logs';

    protected $fillable = [
        'trash_bin_id',
        'iot_device_id',
        'latitude',
        'longitude',
        'akurasi_meter',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'akurasi_meter' => 'float',
    ];

    // =========================================================
    // RELATIONS
    // =========================================================
    public function trashBin(): BelongsTo
    {
        return $this->belongsTo(TrashBin::class);
    }

    public function iotDevice(): BelongsTo
    {
        return $this->belongsTo(IotDevice::class);
    }
}
