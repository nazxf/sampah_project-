<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SIPESA — Histori koordinat GPS dari Neo-6M.
 *
 * Untuk tong yang dipindah-pindah lokasi (atau verifikasi posisi tetap),
 * koordinat dari modul GPS dicatat di sini setiap kali sensor kirim data.
 *
 * Berguna untuk: audit posisi, deteksi tong dipindah, peta historis.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gps_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trash_bin_id')
                ->constrained('trash_bins')
                ->cascadeOnDelete();
            $table->foreignId('iot_device_id')
                ->nullable()
                ->constrained('iot_devices')
                ->nullOnDelete();

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->decimal('akurasi_meter', 6, 2)->nullable()
                ->comment('Estimasi akurasi GPS dalam meter (jika dikirim oleh perangkat).');

            $table->timestamps();

            $table->index(['trash_bin_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gps_logs');
    }
};
