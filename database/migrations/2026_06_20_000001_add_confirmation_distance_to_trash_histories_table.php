<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trash_histories', function (Blueprint $table) {
            if (! Schema::hasColumn('trash_histories', 'jarak_konfirmasi_meter')) {
                $table->decimal('jarak_konfirmasi_meter', 8, 2)
                    ->nullable()
                    ->after('longitude_konfirmasi')
                    ->comment('Jarak petugas ke titik tong saat konfirmasi pengangkutan.');
            }
        });
    }

    public function down(): void
    {
        Schema::table('trash_histories', function (Blueprint $table) {
            if (Schema::hasColumn('trash_histories', 'jarak_konfirmasi_meter')) {
                $table->dropColumn('jarak_konfirmasi_meter');
            }
        });
    }
};
