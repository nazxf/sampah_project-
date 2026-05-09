<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $fillable = ['nama', 'jenis', 'alamat', 'no_telepon', 'deskripsi'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function trashBins(): HasMany
    {
        return $this->hasMany(TrashBin::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
