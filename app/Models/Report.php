<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    protected $table = 'reports';

    protected $fillable = [
        'user_id', 'unit_id', 'judul', 'isi', 'tipe',
        'periode_mulai', 'periode_selesai', 'total_tong_penuh',
        'total_pengangkutan', 'total_aduan', 'ringkasan',
    ];

    protected $casts = [
        'periode_mulai' => 'date',
        'periode_selesai' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
