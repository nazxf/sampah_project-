<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrashHistory extends Model
{
    protected $table = 'trash_histories';

    protected $fillable = [
        'trash_bin_id', 'user_id', 'status_sebelum', 'status_sesudah',
        'tanggal', 'catatan', 'foto',
    ];

    protected $casts = [
        'tanggal' => 'datetime',
    ];

    public function trashBin(): BelongsTo
    {
        return $this->belongsTo(TrashBin::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
