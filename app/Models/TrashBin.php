<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TrashBin extends Model
{
    protected $table = 'trash_bins';

    protected $fillable = [
        'kode', 'nama', 'unit_id', 'lokasi', 'jenis_sampah',
        'tinggi_tong_cm', 'persentase_kepenuhan', 'last_sensor_at',
        'status', 'keterangan', 'foto', 'latitude', 'longitude',
        'terakhir_diangkut', 'terakhir_diangkut_oleh',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'tinggi_tong_cm' => 'float',
        'persentase_kepenuhan' => 'float',
        'terakhir_diangkut' => 'datetime',
        'last_sensor_at' => 'datetime',
    ];

    protected $appends = [
        'days_since_collected',
        'is_overdue',
        'status_by_persentase',
    ];

    // =========================================================
    // RELATIONS
    // =========================================================
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function terakhirDiangkutOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'terakhir_diangkut_oleh');
    }

    public function trashHistories(): HasMany
    {
        return $this->hasMany(TrashHistory::class);
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }

    public function iotDevice(): HasOne
    {
        return $this->hasOne(IotDevice::class);
    }

    public function sensorLogs(): HasMany
    {
        return $this->hasMany(SensorLog::class);
    }

    public function gpsLogs(): HasMany
    {
        return $this->hasMany(GpsLog::class);
    }

    public function pickupSchedules(): HasMany
    {
        return $this->hasMany(PickupSchedule::class);
    }

    public function publicReports(): HasMany
    {
        return $this->hasMany(PublicReport::class);
    }

    // =========================================================
    // SCOPES
    // =========================================================

    /**
     * Hanya tong yang punya laporan publik aktif
     * (status laporan != selesai/ditolak).
     */
    public function scopeWithActiveReports(Builder $query): Builder
    {
        return $query->whereHas('publicReports', function (Builder $q) {
            $q->whereNotIn('status', ['selesai', 'ditolak']);
        });
    }

    // =========================================================
    // ACCESSORS
    // =========================================================
    public function getDaysSinceCollectedAttribute(): ?int
    {
        if (! $this->terakhir_diangkut) {
            return null;
        }

        return (int) floor($this->terakhir_diangkut->diffInHours(now()) / 24);
    }

    public function getIsOverdueAttribute(): bool
    {
        if ($this->jenis_sampah !== 'anorganik') {
            return false;
        }

        if (! $this->terakhir_diangkut) {
            return true;
        }

        return $this->terakhir_diangkut->diffInHours(now()) > 72;
    }

    /**
     * Status tong berdasarkan persentase kepenuhan dari sensor IoT.
     * Threshold env: TONG_STATUS_EMPTY_MAX (40) & TONG_STATUS_MEDIUM_MAX (75).
     *
     * Return: 'kosong' | 'setengah_penuh' | 'penuh'
     */
    public function getStatusByPersentaseAttribute(): string
    {
        $persen = (float) ($this->persentase_kepenuhan ?? 0);
        $emptyMax = (float) config('sipesa.trash_bin.status_empty_max', 40);
        $mediumMax = (float) config('sipesa.trash_bin.status_medium_max', 75);

        if ($persen <= $emptyMax) {
            return 'kosong';
        }

        if ($persen <= $mediumMax) {
            return 'setengah_penuh';
        }

        return 'penuh';
    }

    public static function getStatusColors(): array
    {
        return [
            'kosong' => ['bg' => 'bg-green-100', 'text' => 'text-green-800', 'dot' => 'bg-green-500', 'label' => 'Kosong'],
            'setengah_penuh' => ['bg' => 'bg-yellow-100', 'text' => 'text-yellow-800', 'dot' => 'bg-yellow-500', 'label' => 'Setengah Penuh'],
            'penuh' => ['bg' => 'bg-red-100', 'text' => 'text-red-800', 'dot' => 'bg-red-500', 'label' => 'Penuh'],
            'sudah_diangkut' => ['bg' => 'bg-blue-100', 'text' => 'text-blue-800', 'dot' => 'bg-blue-500', 'label' => 'Sudah Diangkut'],
        ];
    }
}
