<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * SIPESA — Jadwal pengangkutan sampah.
 *
 * Tipe: 'rutin' (admin) | 'darurat' (auto dari laporan warga "Tong Penuh")
 * Status: 'terjadwal' | 'selesai' | 'terlambat' | 'dibatalkan'
 */
class PickupSchedule extends Model
{
    protected $table = 'pickup_schedules';

    protected $fillable = [
        'trash_bin_id',
        'petugas_id',
        'tanggal',
        'waktu_jadwal',
        'tipe',
        'status',
        'public_report_id',
        'dibuat_oleh',
        'catatan',
    ];

    protected $casts = [
        'tanggal' => 'date',
        // waktu_jadwal sebagai time string ("HH:MM:SS"); biar tidak diubah ke datetime
    ];

    protected $appends = [
        'is_overdue',
    ];

    // =========================================================
    // RELATIONS
    // =========================================================
    public function trashBin(): BelongsTo
    {
        return $this->belongsTo(TrashBin::class);
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }

    public function publicReport(): BelongsTo
    {
        return $this->belongsTo(PublicReport::class);
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    /**
     * Pencatatan (TrashHistory) yang dihasilkan dari jadwal ini.
     * Petugas konfirmasi 1x → 1 record TrashHistory.
     */
    public function pencatatan(): HasOne
    {
        return $this->hasOne(TrashHistory::class, 'pickup_schedule_id');
    }

    // =========================================================
    // SCOPES
    // =========================================================
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('tanggal', today());
    }

    public function scopeTerlambat(Builder $query): Builder
    {
        return $query->where('status', 'terlambat')
            ->orWhere(function (Builder $q) {
                $q->where('status', 'terjadwal')
                    ->whereDate('tanggal', '<', today());
            });
    }

    public function scopeForPetugas(Builder $query, int $petugasId): Builder
    {
        return $query->where('petugas_id', $petugasId);
    }

    // =========================================================
    // ACCESSORS
    // =========================================================

    /**
     * Apakah jadwal terlambat? (status terjadwal & tanggal sudah lewat)
     */
    public function getIsOverdueAttribute(): bool
    {
        if ($this->status !== 'terjadwal') {
            return false;
        }

        if (! $this->tanggal) {
            return false;
        }

        return $this->tanggal->lt(today());
    }

    // =========================================================
    // HELPERS
    // =========================================================
    public static function getStatusColors(): array
    {
        return [
            'terjadwal' => ['bg' => 'bg-blue-100', 'text' => 'text-blue-800', 'dot' => 'bg-blue-500', 'label' => 'Terjadwal'],
            'selesai' => ['bg' => 'bg-green-100', 'text' => 'text-green-800', 'dot' => 'bg-green-500', 'label' => 'Selesai'],
            'terlambat' => ['bg' => 'bg-red-100', 'text' => 'text-red-800', 'dot' => 'bg-red-500', 'label' => 'Terlambat'],
            'dibatalkan' => ['bg' => 'bg-gray-100', 'text' => 'text-gray-800', 'dot' => 'bg-gray-500', 'label' => 'Dibatalkan'],
        ];
    }

    public static function getTipeLabels(): array
    {
        return [
            'rutin' => 'Rutin',
            'darurat' => 'Darurat',
        ];
    }
}
