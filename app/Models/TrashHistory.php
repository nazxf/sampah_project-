<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TrashHistory extends Model
{
    protected $table = 'trash_histories';

    protected $fillable = [
        'trash_bin_id', 'user_id', 'pickup_schedule_id',
        'status_sebelum', 'status_sesudah',
        'tanggal', 'catatan', 'foto',
        'latitude_konfirmasi', 'longitude_konfirmasi',
        'jarak_konfirmasi_meter',
    ];

    protected $casts = [
        'tanggal' => 'datetime',
        'latitude_konfirmasi' => 'float',
        'longitude_konfirmasi' => 'float',
        'jarak_konfirmasi_meter' => 'float',
    ];

    protected $appends = [
        'foto_url',
    ];

    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto ? Storage::url($this->foto) : null;
    }

    protected static function booted(): void
    {
        static::deleted(function (TrashHistory $trashHistory): void {
            if ($trashHistory->foto) {
                Storage::disk('public')->delete($trashHistory->foto);
            }
        });
    }

    public function trashBin(): BelongsTo
    {
        return $this->belongsTo(TrashBin::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pickupSchedule(): BelongsTo
    {
        return $this->belongsTo(PickupSchedule::class);
    }
}
