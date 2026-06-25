<?php

namespace Database\Seeders;

use App\Models\PickupSchedule;
use App\Models\TrashBin;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * SIPESA — Seeder jadwal pengangkutan.
 *
 * Membuat:
 *  - 5 jadwal RUTIN hari ini (status terjadwal)
 *  - 2 jadwal DARURAT hari ini
 *  - 3 jadwal SELESAI kemarin
 */
class PickupScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $petugasIds = User::whereHas('role', fn ($q) => $q->where('name', 'petugas'))
            ->pluck('id')
            ->all();

        $superAdmin = User::whereHas('role', fn ($q) => $q->where('name', 'super_admin'))
            ->first();

        if (empty($petugasIds) || ! $superAdmin) {
            return;
        }

        $bins = TrashBin::inRandomOrder()->take(10)->get();
        if ($bins->count() < 10) {
            // Cukup pakai bins yang ada
            $bins = TrashBin::all()->take(10);
        }

        $jamRutin = ['07:00:00', '08:00:00', '10:00:00', '13:00:00', '15:00:00'];

        // === 5 jadwal rutin hari ini (terjadwal) ===
        for ($i = 0; $i < 5; $i++) {
            $bin = $bins[$i] ?? $bins->random();

            PickupSchedule::create([
                'trash_bin_id' => $bin->id,
                'petugas_id' => $petugasIds[array_rand($petugasIds)],
                'tanggal' => now()->toDateString(),
                'waktu_jadwal' => $jamRutin[$i],
                'tipe' => 'rutin',
                'status' => 'terjadwal',
                'dibuat_oleh' => $superAdmin->id,
                'catatan' => 'Jadwal rutin harian',
            ]);
        }

        // === 2 jadwal darurat hari ini ===
        for ($i = 0; $i < 2; $i++) {
            $bin = $bins[5 + $i] ?? $bins->random();

            PickupSchedule::create([
                'trash_bin_id' => $bin->id,
                'petugas_id' => $petugasIds[array_rand($petugasIds)],
                'tanggal' => now()->toDateString(),
                'waktu_jadwal' => '11:30:00',
                'tipe' => 'darurat',
                'status' => 'terjadwal',
                'dibuat_oleh' => $superAdmin->id,
                'catatan' => 'Darurat — laporan warga tong penuh',
            ]);
        }

        // === 3 jadwal selesai kemarin ===
        for ($i = 0; $i < 3; $i++) {
            $bin = $bins[7 + $i] ?? $bins->random();

            PickupSchedule::create([
                'trash_bin_id' => $bin->id,
                'petugas_id' => $petugasIds[array_rand($petugasIds)],
                'tanggal' => now()->subDay()->toDateString(),
                'waktu_jadwal' => '09:00:00',
                'tipe' => 'rutin',
                'status' => 'selesai',
                'dibuat_oleh' => $superAdmin->id,
                'catatan' => 'Selesai — sudah dikonfirmasi petugas',
            ]);
        }
    }
}
