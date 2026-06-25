<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Complaint extends Model
{
    protected $table = 'complaints';

    protected $fillable = [
        'user_id', 'trash_bin_id', 'judul', 'deskripsi',
        'foto', 'status', 'tanggapan', 'ditanggapi_oleh', 'ditanggapi_pada',
    ];

    protected $casts = [
        'ditanggapi_pada' => 'datetime',
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
        static::deleted(function (Complaint $complaint): void {
            if ($complaint->foto) {
                Storage::disk('public')->delete($complaint->foto);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trashBin(): BelongsTo
    {
        return $this->belongsTo(TrashBin::class);
    }

    public function ditanggapiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditanggapi_oleh');
    }

    public static function getStatusColors(): array
    {
        return [
            'menunggu' => ['bg' => 'bg-yellow-100', 'text' => 'text-yellow-800', 'dot' => 'bg-yellow-500', 'label' => 'Menunggu'],
            'diproses' => ['bg' => 'bg-blue-100', 'text' => 'text-blue-800', 'dot' => 'bg-blue-500', 'label' => 'Diproses'],
            'selesai' => ['bg' => 'bg-green-100', 'text' => 'text-green-800', 'dot' => 'bg-green-500', 'label' => 'Selesai'],
        ];
    }
}
