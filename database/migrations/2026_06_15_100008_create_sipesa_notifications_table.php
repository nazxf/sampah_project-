<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SIPESA — Tabel notifikasi sistem (custom, bukan Laravel Notifications default).
 *
 * Diisi oleh:
 *   - laporan_baru   : sat warga submit laporan publik (broadcast ke admin)
 *   - penuh          : sat sensor IoT report tong penuh (>76%)
 *   - terlambat      : sat jadwal lewat tanggal tanpa konfirmasi (Scheduler)
 *   - offline        : sat perangkat IoT tidak ping > 15 menit (Scheduler)
 *   - jadwal_baru    : sat petugas dapat jadwal baru
 *
 * Realtime broadcast via Pusher di Fase 4.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Hindari konflik dengan tabel `notifications` bawaan Laravel Notifications.
        // SIPESA pakai nama `sipesa_notifications` untuk eksplisit.
        Schema::create('sipesa_notifications', function (Blueprint $table) {
            $table->id();

            $table->string('judul', 150);
            $table->text('pesan');

            $table->enum('tipe', [
                'penuh',
                'terlambat',
                'offline',
                'laporan_baru',
                'jadwal_baru',
                'lainnya',
            ])->default('lainnya');

            $table->foreignId('trash_bin_id')
                ->nullable()
                ->constrained('trash_bins')
                ->nullOnDelete();

            $table->foreignId('public_report_id')
                ->nullable()
                ->constrained('public_reports')
                ->nullOnDelete();

            $table->foreignId('pickup_schedule_id')
                ->nullable()
                ->constrained('pickup_schedules')
                ->nullOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete()
                ->comment('Target user. Null = broadcast (untuk semua admin).');

            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();

            $table->string('action_url', 500)->nullable()
                ->comment('URL tujuan saat notifikasi diklik (opsional).');

            $table->timestamps();

            $table->index(['user_id', 'is_read', 'created_at']);
            $table->index(['tipe', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sipesa_notifications');
    }
};
