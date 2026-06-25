<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SIPESA — Histori data sensor ultrasonik HC-SR04.
 *
 * Setiap kali Arduino/ESP8266 kirim data ke POST /api/sensor/update,
 * sebuah baris baru ditulis di sini sebagai histori.
 *
 * Pakai untuk: chart kepenuhan harian/mingguan, audit trail, debug perangkat.
 * Tabel ini bisa tumbuh besar -> rekomendasi: jadwalkan pruning (>90 hari) di Fase 4.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sensor_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('iot_device_id')
                ->constrained('iot_devices')
                ->cascadeOnDelete();
            $table->foreignId('trash_bin_id')
                ->constrained('trash_bins')
                ->cascadeOnDelete();

            $table->decimal('jarak_cm', 6, 2)
                ->comment('Jarak terukur dari sensor HC-SR04 ke permukaan sampah (cm).');
            $table->decimal('persentase_kepenuhan', 5, 2)
                ->comment('Persentase kepenuhan saat log dicatat (0-100).');

            $table->timestamps();

            $table->index(['trash_bin_id', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_logs');
    }
};
