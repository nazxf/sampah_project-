<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('iot_devices', function (Blueprint $table) {
            $table->string('device_token', 128)
                ->nullable()
                ->change();
        });

        DB::table('iot_devices')
            ->whereNotNull('device_token_hash')
            ->update(['device_token' => null]);
    }

    public function down(): void
    {
        // Migrasi ini destruktif: plaintext token sudah dihapus di up() dan tidak
        // bisa dipulihkan. Sengaja TIDAK menyalin device_token_hash ke device_token
        // (itu hash, bukan token — akan merusak kredensial) dan TIDAK memaksa NOT NULL
        // (kolom kini sah berisi NULL untuk device hash-only -> rollback akan gagal).
        // Kolom dibiarkan nullable; perangkat harus di-regenerate token-nya.
    }
};
