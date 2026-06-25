<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SIPESA — Jadwal pengangkutan sampah.
 *
 * Tipe:
 *   - rutin   : jadwal harian/mingguan oleh admin
 *   - darurat : auto-generated dari laporan warga (tipe "Tong Penuh") atau manual
 *
 * Status:
 *   - terjadwal : belum dieksekusi petugas
 *   - selesai   : sudah dikonfirmasi petugas (radius GPS 50m)
 *   - terlambat : melewati waktu_jadwal tanpa konfirmasi (Fase 4 Scheduler)
 *   - dibatalkan: dibatalkan admin
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pickup_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trash_bin_id')
                ->constrained('trash_bins')
                ->cascadeOnDelete();
            $table->foreignId('petugas_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->comment('Petugas yang ditugaskan. Null jika belum di-assign.');

            $table->date('tanggal');
            $table->time('waktu_jadwal');

            $table->enum('tipe', ['rutin', 'darurat'])->default('rutin');
            $table->enum('status', ['terjadwal', 'selesai', 'terlambat', 'dibatalkan'])
                ->default('terjadwal');

            $table->foreignId('public_report_id')
                ->nullable()
                ->comment('Jika jadwal darurat dibuat dari laporan warga.');

            $table->foreignId('dibuat_oleh')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['tanggal', 'status']);
            $table->index(['petugas_id', 'tanggal']);
            $table->index('status');
        });

        // Foreign key public_report_id ditambah setelah tabel public_reports dibuat
        // (lihat migrasi 2026_06_15_100007_create_public_reports_table.php)
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_schedules');
    }
};
