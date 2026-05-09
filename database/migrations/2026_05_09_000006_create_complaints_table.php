<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('trash_bin_id')->nullable()->constrained('trash_bins')->onDelete('set null');
            $table->string('judul');
            $table->text('deskripsi');
            $table->string('foto')->nullable();
            $table->enum('status', ['menunggu', 'diproses', 'selesai'])->default('menunggu');
            $table->text('tanggapan')->nullable();
            $table->foreignId('ditanggapi_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('ditanggapi_pada')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
