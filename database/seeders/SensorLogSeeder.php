<?php

namespace Database\Seeders;

use App\Models\GpsLog;
use App\Models\IotDevice;
use App\Models\SensorLog;
use Illuminate\Database\Seeder;

/**
 * SIPESA — Seeder histori sensor (10 log per device, 7 hari terakhir).
 * Sekaligus generate gps_logs (1:1 per sensor log) untuk konsistensi.
 */
class SensorLogSeeder extends Seeder
{
    public function run(): void
    {
        $devices = IotDevice::with('trashBin')->get();

        foreach ($devices as $device) {
            $tinggi = (float) ($device->trashBin->tinggi_tong_cm ?? 100);

            for ($k = 0; $k < 10; $k++) {
                $hoursAgo = rand(1, 24 * 7); // 1 jam s.d. 7 hari lalu
                $persen = rand(5, 95);
                $jarak = max(1, round($tinggi - ($persen / 100 * $tinggi), 2));
                $createdAt = now()->subHours($hoursAgo);

                SensorLog::create([
                    'iot_device_id' => $device->id,
                    'trash_bin_id' => $device->trash_bin_id,
                    'jarak_cm' => $jarak,
                    'persentase_kepenuhan' => $persen,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                GpsLog::create([
                    'trash_bin_id' => $device->trash_bin_id,
                    'iot_device_id' => $device->id,
                    'latitude' => $device->trashBin->latitude,
                    'longitude' => $device->trashBin->longitude,
                    'akurasi_meter' => rand(2, 8),
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }
        }
    }
}
