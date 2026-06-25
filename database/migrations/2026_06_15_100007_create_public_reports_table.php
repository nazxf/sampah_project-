<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SIPESA — Laporan warga kampus (ANONIM, tanpa login).
 *
 * Tabel terpisah dari `complaints` (yang wajib login). Tabel ini menerima
 * laporan dari halaman publik /laporan dan memberikan nomor tiket
 * format LP-YYYYMMDD-XXXX untuk pelacakan status.
 *
 * Duplicate detection: laporan dengan ip_address + tong + jenis_masalah
 * yang sama dalam 1 jam dianggap duplikat (tidak insert baru).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_reports', function (Blueprint $table) {
            $table->id();

            $table->string('nomor_tiket', 30)->unique()
                ->comment('Format: LP-YYYYMMDD-XXXX. Counter XXXX direset per hari.');

            $table->foreignId('trash_bin_id')
                ->constrained('trash_bins')
                ->cascadeOnDelete();

            $table->enum('jenis_masalah', [
                'penuh',       // Tong Penuh (auto-trigger jadwal darurat)
                'rusak',       // Tong Rusak
                'bau',         // Bau Menyengat
                'hama',        // Hama/Serangga
                'pemilahan',   // Salah Pemilahan
                'lainnya',     // Lainnya (deskripsi bebas)
            ]);

            $table->string('nama_pelapor', 100)->nullable()
                ->comment('Opsional. Boleh dikosongkan untuk anonim sepenuhnya.');

            $table->text('deskripsi')->nullable()
                ->comment('Deskripsi tambahan, max 300 char (validasi di FormRequest).');

            $table->enum('status', ['menunggu', 'diproses', 'selesai', 'ditolak'])
                ->default('menunggu');

            $table->text('catatan_admin')->nullable()
                ->comment('Catatan dari admin saat menindaklanjuti laporan.');

            $table->foreignId('petugas_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->comment('Petugas yang ditugaskan menangani laporan ini.');

            $table->foreignId('ditangani_oleh')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->comment('Admin yang terakhir mengubah status.');

            $table->timestamp('ditangani_pada')->nullable();

            $table->string('ip_address', 45)
                ->comment('IPv4/IPv6 pelapor. Untuk duplicate detection & rate-limit.');

            $table->string('user_agent', 500)->nullable();

            $table->boolean('is_duplikat')->default(false)
                ->comment('Tandai laporan duplikat (dari admin atau auto-merge).');

            $table->foreignId('duplikat_dari_id')
                ->nullable()
                ->constrained('public_reports')
                ->nullOnDelete()
                ->comment('Jika is_duplikat=true, link ke laporan asli.');

            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['trash_bin_id', 'jenis_masalah', 'created_at']);
            $table->index('ip_address');
            $table->index('jenis_masalah');
        });

        // Tambah FK pickup_schedules.public_report_id sekarang
        Schema::table('pickup_schedules', function (Blueprint $table) {
            $table->foreign('public_report_id')
                ->references('id')->on('public_reports')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pickup_schedules', function (Blueprint $table) {
            $table->dropForeign(['public_report_id']);
        });

        Schema::dropIfExists('public_reports');
    }
};
