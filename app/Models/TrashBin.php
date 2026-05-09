<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrashBin extends Model
{
    protected $table = 'trash_bins';

    protected $fillable = [
        'kode', 'nama', 'unit_id', 'lokasi', 'jenis_sampah',
        'status', 'keterangan', 'foto', 'terakhir_diangkut', 'terakhir_diangkut_oleh',
    ];

    protected $casts = [
        'terakhir_diangkut' => 'datetime',
    ];

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
