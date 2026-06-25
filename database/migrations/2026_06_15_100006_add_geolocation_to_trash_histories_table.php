<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SIPESA — Tambah field konfirmasi geolokasi ke trash_histories.
 *
 * Saat petugas konfirmasi pengangkutan selesai:
 *   - latitude_konfirmasi  : posisi petugas saat konfirmasi (dari browser geolocation)
 *   - longitude_konfirmasi : -- sda --
 *   - pickup_schedule_id   : link ke jadwal yang diselesaikan (opsional, jika dari jadwal)
 *
 * Verifikasi radius 50m dilakukan di controller (Fase 3).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trash_histories', function (Blueprint $table) {
            if (! Schema::hasColumn('trash_histories', 'latitude_konfirmasi')) {
                $table->decimal('latitude_konfirmasi', 10, 7)->nullable()->after('foto');
            }
            if (! Schema::hasColumn('trash_histories', 'longitude_konfirmasi')) {
                $table->decimal('longitude_konfirmasi', 10, 7)->nullable()->after('latitude_konfirmasi');
            }
            if (! Schema::hasColumn('trash_histories', 'pickup_schedule_id')) {
                $table->foreignId('pickup_schedule_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('pickup_schedules')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('trash_histories', function (Blueprint $table) {
            if (Schema::hasColumn('trash_histories', 'pickup_schedule_id')) {
                $table->dropForeign(['pickup_schedule_id']);
                $table->dropColumn('pickup_schedule_id');
            }
            $cols = array_values(array_filter([
                Schema::hasColumn('trash_histories', 'latitude_konfirmasi') ? 'latitude_konfirmasi' : null,
                Schema::hasColumn('trash_histories', 'longitude_konfirmasi') ? 'longitude_konfirmasi' : null,
            ]));
            if ($cols !== []) {
                $table->dropColumn($cols);
            }
        });
    }
};
