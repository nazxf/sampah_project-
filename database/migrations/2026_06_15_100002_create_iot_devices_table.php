<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SIPESA — Perangkat IoT (Arduino + ESP8266 NodeMCU + HC-SR04 + GPS Neo-6M).
 *
 * Setiap perangkat punya device_token unik (32-128 char) yang dipakai
 * untuk autentikasi REST API endpoint POST /api/sensor/update.
 *
 * Relasi 1:1 dengan trash_bins (satu tong satu perangkat).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('iot_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trash_bin_id')
                ->unique()
                ->constrained('trash_bins')
                ->cascadeOnDelete()
                ->comment('Tong yang dipasangi perangkat. Unik (1 tong 1 perangkat).');

            $table->string('device_token', 128)
                ->unique()
                ->comment('Token autentikasi REST API endpoint /api/sensor/update.');

            $table->string('nama_perangkat', 100)
                ->comment('Nama perangkat IoT, misal: NodeMCU-T001.');

            $table->enum('status_device', ['online', 'offline'])
                ->default('offline')
                ->comment('Online jika last_ping_at masih dalam threshold IOT_OFFLINE_THRESHOLD_MINUTES.');

            $table->timestamp('last_ping_at')->nullable()
                ->comment('Timestamp ping terakhir dari perangkat (POST /api/sensor/update).');

            $table->string('firmware_version', 20)->nullable()
                ->comment('Versi firmware Arduino/ESP8266 (opsional, untuk OTA tracking).');

            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index('status_device');
            $table->index('last_ping_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('iot_devices');
    }
};
