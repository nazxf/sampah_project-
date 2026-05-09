<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trash_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trash_bin_id')->constrained('trash_bins')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status_sebelum', ['kosong', 'setengah_penuh', 'penuh', 'sudah_diangkut']);
            $table->enum('status_sesudah', ['kosong', 'setengah_penuh', 'penuh', 'sudah_diangkut']);
            $table->dateTime('tanggal');
            $table->text('catatan')->nullable();
            $table->string('foto')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trash_histories');
    }
};
