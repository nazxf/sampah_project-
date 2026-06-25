<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SIPESA — Tambah field IoT/sensor ke tabel trash_bins.
 *
 * Field baru:
 *  - tinggi_tong_cm           : tinggi total tong dalam cm (untuk hitung % kepenuhan)
 *  - persentase_kepenuhan     : 0-100, dihitung dari (tinggi_tong - jarak_cm) / tinggi_tong * 100
 *  - last_sensor_at           : timestamp data sensor terakhir (untuk deteksi offline)
 *  - status                   : ditambah enum 'penuh_laporan_warga' (override sementara dari laporan warga "Tong Penuh")
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trash_bins', function (Blueprint $table) {
            if (! Schema::hasColumn('trash_bins', 'tinggi_tong_cm')) {
                $table->decimal('tinggi_tong_cm', 6, 2)->nullable()->after('jenis_sampah')
                    ->comment('Tinggi total tong dalam cm. Dipakai menghitung persentase kepenuhan dari sensor ultrasonik.');
            }
            if (! Schema::hasColumn('trash_bins', 'persentase_kepenuhan')) {
                $table->decimal('persentase_kepenuhan', 5, 2)->default(0)->after('tinggi_tong_cm')
                    ->comment('Persentase kepenuhan terkini (0-100). Diupdate otomatis dari data sensor IoT.');
            }
            if (! Schema::hasColumn('trash_bins', 'last_sensor_at')) {
                $table->timestamp('last_sensor_at')->nullable()->after('persentase_kepenuhan')
                    ->comment('Timestamp data sensor terakhir diterima. Untuk deteksi perangkat offline.');
            }
        });
    }

    public function down(): void
    {
        Schema::table('trash_bins', function (Blueprint $table) {
            $columns = array_values(array_filter([
                Schema::hasColumn('trash_bins', 'tinggi_tong_cm') ? 'tinggi_tong_cm' : null,
                Schema::hasColumn('trash_bins', 'persentase_kepenuhan') ? 'persentase_kepenuhan' : null,
                Schema::hasColumn('trash_bins', 'last_sensor_at') ? 'last_sensor_at' : null,
            ]));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
