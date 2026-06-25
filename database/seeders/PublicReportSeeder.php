<?php

namespace Database\Seeders;

use App\Models\PublicReport;
use App\Models\TrashBin;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * SIPESA — Seeder laporan warga (publik, anonim).
 *
 * 8 laporan contoh berbagai jenis & status, termasuk 1 duplikat untuk test UI.
 */
class PublicReportSeeder extends Seeder
{
    public function run(): void
    {
        $bins = TrashBin::inRandomOrder()->take(8)->get();
        if ($bins->isEmpty()) {
            return;
        }

        $admin = User::whereHas('role', fn ($q) => $q->whereIn('name', ['super_admin', 'admin_unit']))
            ->first();
        $petugas = User::whereHas('role', fn ($q) => $q->where('name', 'petugas'))->first();

        $jenisOpts = ['penuh', 'rusak', 'bau', 'hama', 'pemilahan', 'lainnya'];
        $statusOpts = ['menunggu', 'diproses', 'selesai', 'ditolak'];
        $namaPelapor = [null, null, 'Andi', 'Siti', 'Budi', 'Rina', null];

        $createdReports = [];

        foreach ($bins as $i => $bin) {
            $jenis = $jenisOpts[$i % count($jenisOpts)];
            $status = $statusOpts[$i % count($statusOpts)];

            $report = PublicReport::create([
                'nomor_tiket' => PublicReport::generateNomorTiket(),
                'trash_bin_id' => $bin->id,
                'jenis_masalah' => $jenis,
                'nama_pelapor' => $namaPelapor[$i % count($namaPelapor)],
                'deskripsi' => 'Laporan contoh: ' . PublicReport::getJenisMasalahLabels()[$jenis],
                'status' => $status,
                'catatan_admin' => in_array($status, ['diproses', 'selesai', 'ditolak'])
                    ? 'Catatan admin contoh untuk laporan ini.'
                    : null,
                'petugas_id' => in_array($status, ['diproses', 'selesai']) ? optional($petugas)->id : null,
                'ditangani_oleh' => $status !== 'menunggu' ? optional($admin)->id : null,
                'ditangani_pada' => $status !== 'menunggu' ? now()->subHours(rand(1, 48)) : null,
                'ip_address' => '127.0.0.' . (10 + $i),
                'user_agent' => 'Mozilla/5.0 (Test Seeder)',
                'is_duplikat' => false,
            ]);

            $createdReports[] = $report;
        }

        // === 1 laporan duplikat ===
        if (! empty($createdReports)) {
            $original = $createdReports[0];

            PublicReport::create([
                'nomor_tiket' => PublicReport::generateNomorTiket(),
                'trash_bin_id' => $original->trash_bin_id,
                'jenis_masalah' => $original->jenis_masalah,
                'nama_pelapor' => 'Pelapor Lain',
                'deskripsi' => 'Laporan duplikat dari ' . $original->nomor_tiket,
                'status' => 'ditolak',
                'catatan_admin' => 'Duplikat laporan ' . $original->nomor_tiket,
                'ip_address' => $original->ip_address,
                'user_agent' => 'Mozilla/5.0 (Test Seeder)',
                'is_duplikat' => true,
                'duplikat_dari_id' => $original->id,
            ]);
        }
    }
}
