<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SIPESA — Notifikasi sistem custom (tabel `sipesa_notifications`).
 *
 * Berbeda dari Laravel Notifications default — kami pakai schema kustom
 * agar bisa link langsung ke trash_bin / public_report / pickup_schedule
 * dan punya kontrol penuh atas broadcast (Pusher di Fase 4).
 *
 * Tipe: 'penuh' | 'terlambat' | 'offline' | 'laporan_baru' | 'jadwal_baru' | 'lainnya'
 */
class SipesaNotification extends Model
{
    protected $table = 'sipesa_notifications';

    protected $fillable = [
        'judul',
        'pesan',
        'tipe',
        'trash_bin_id',
        'public_report_id',
        'pickup_schedule_id',
        'user_id',
        'is_read',
        'read_at',
        'action_url',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // =========================================================
    // RELATIONS
    // =========================================================
    public function trashBin(): BelongsTo
    {
        return $this->belongsTo(TrashBin::class);
    }

    public function publicReport(): BelongsTo
    {
        return $this->belongsTo(PublicReport::class);
    }

    public function pickupSchedule(): BelongsTo
    {
        return $this->belongsTo(PickupSchedule::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // =========================================================
    // SCOPES
    // =========================================================
    public function scopeUnread(Builder $query): Builder
    {
        return $query->where('is_read', false);
    }

    /**
     * Notifikasi untuk user tertentu (termasuk broadcast user_id NULL).
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where(function (Builder $q) use ($userId) {
            $q->where('user_id', $userId)
                ->orWhereNull('user_id');
        });
    }

    // =========================================================
    // HELPERS
    // =========================================================

    /**
     * Tandai notifikasi sebagai dibaca (idempotent).
     */
    public function markAsRead(): bool
    {
        if ($this->is_read) {
            return true;
        }

        $this->is_read = true;
        $this->read_at = now();

        return $this->save();
    }
}
