<?php

namespace Database\Seeders;

use App\Models\IotDevice;
use App\Models\TrashBin;
use Illuminate\Database\Seeder;

/**
 * SIPESA — Seeder perangkat IoT.
 *
 * Pasang perangkat hanya pada ~50% tong (realistis — sebagian masih manual).
 * 70% perangkat status online (last_ping_at < 5 menit), sisanya offline.
 */
class IotDeviceSeeder extends Seeder
{
    public function run(): void
    {
        $bins = TrashBin::all();

        $i = 0;
        foreach ($bins as $bin) {
            $i++;

            // Skip ~50% tong agar realistis
            if ($i % 2 === 0) {
                continue;
            }

            $isOnline = rand(1, 10) <= 7; // 70% online
            $lastPing = $isOnline
                ? now()->subMinutes(rand(0, 4))
                : now()->subMinutes(rand(20, 240));

            IotDevice::create([
                'trash_bin_id' => $bin->id,
                'device_token' => IotDevice::makeToken(64),
                'nama_perangkat' => 'NodeMCU-' . $bin->kode,
                'status_device' => $isOnline ? 'online' : 'offline',
                'last_ping_at' => $lastPing,
                'firmware_version' => '1.0.' . rand(0, 5),
                'catatan' => 'Dummy seeder',
            ]);
        }
    }
}
