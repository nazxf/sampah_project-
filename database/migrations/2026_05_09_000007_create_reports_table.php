<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->string('judul');
            $table->text('isi')->nullable();
            $table->enum('tipe', ['harian', 'mingguan', 'bulanan']);
            $table->date('periode_mulai');
            $table->date('periode_selesai');
            $table->integer('total_tong_penuh')->default(0);
            $table->integer('total_pengangkutan')->default(0);
            $table->integer('total_aduan')->default(0);
            $table->text('ringkasan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
