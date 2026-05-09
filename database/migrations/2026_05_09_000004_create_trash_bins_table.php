<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trash_bins', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->string('lokasi');
            $table->enum('jenis_sampah', ['organik', 'anorganik', 'b3']);
            $table->enum('status', ['kosong', 'setengah_penuh', 'penuh', 'sudah_diangkut'])->default('kosong');
            $table->text('keterangan')->nullable();
            $table->string('foto')->nullable();
            $table->timestamp('terakhir_diangkut')->nullable();
            $table->foreignId('terakhir_diangkut_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trash_bins');
    }
};
