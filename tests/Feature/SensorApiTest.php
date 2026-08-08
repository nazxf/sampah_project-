<?php

namespace Tests\Feature;

use App\Models\IotDevice;
use App\Models\TrashBin;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SensorApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_sensor_update_requires_valid_device_token(): void
    {
        $this->postJson(route('api.sensor.update'), [
            'jarak_cm' => 25,
        ])
            ->assertUnauthorized()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');

        $this->postJson(route('api.sensor.update'), [
            'device_token' => str_repeat('x', 32),
            'jarak_cm' => 25,
        ])->assertUnauthorized();

        $this->withHeader('Authorization', 'Bearer short-token')
            ->postJson(route('api.sensor.update'), [
                'jarak_cm' => 25,
            ])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Token perangkat tidak valid.');
    }

    public function test_sensor_update_records_sensor_and_gps_logs(): void
    {
        $unit = Unit::create([
            'nama' => 'SMA Kampus B',
            'jenis' => 'SMA',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'IOT-001',
            'nama' => 'Tong IoT',
            'unit_id' => $unit->id,
            'lokasi' => 'Gerbang',
            'jenis_sampah' => 'organik',
            'tinggi_tong_cm' => 100,
            'status' => 'kosong',
        ]);
        $token = str_repeat('a', 64);
        $device = IotDevice::create([
            'trash_bin_id' => $trashBin->id,
            'device_token' => $token,
            'nama_perangkat' => 'NodeMCU-IOT-001',
            'status_device' => 'offline',
        ]);

        $this->assertNull($device->fresh()->device_token);
        $this->assertSame(hash('sha256', $token), $device->fresh()->device_token_hash);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('api.sensor.update'), [
                'jarak_cm' => 10,
                'latitude' => -6.3747,
                'longitude' => 106.9248,
                'akurasi_meter' => 5,
                'firmware_version' => '1.0.7',
            ])
            ->assertOk()
            ->assertJsonPath('trash_bin.status', 'penuh')
            ->assertJsonPath('trash_bin.persentase_kepenuhan', 90);

        $this->assertDatabaseHas('sensor_logs', [
            'iot_device_id' => $device->id,
            'trash_bin_id' => $trashBin->id,
            'persentase_kepenuhan' => 90,
        ]);
        $this->assertDatabaseHas('gps_logs', [
            'iot_device_id' => $device->id,
            'trash_bin_id' => $trashBin->id,
            'latitude' => -6.3747,
            'longitude' => 106.9248,
        ]);
        $this->assertDatabaseHas('trash_bins', [
            'id' => $trashBin->id,
            'status' => 'penuh',
            'persentase_kepenuhan' => 90,
            'latitude' => -6.3747,
            'longitude' => 106.9248,
        ]);
        $this->assertDatabaseHas('iot_devices', [
            'id' => $device->id,
            'status_device' => 'online',
            'firmware_version' => '1.0.7',
        ]);
    }

    public function test_sensor_update_rejects_partial_gps_coordinates(): void
    {
        $unit = Unit::create([
            'nama' => 'SMA Kampus GPS Parsial',
            'jenis' => 'SMA',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'IOT-003',
            'nama' => 'Tong IoT GPS Parsial',
            'unit_id' => $unit->id,
            'lokasi' => 'Gerbang',
            'jenis_sampah' => 'organik',
            'tinggi_tong_cm' => 100,
            'status' => 'kosong',
        ]);
        $token = str_repeat('c', 64);
        $device = IotDevice::create([
            'trash_bin_id' => $trashBin->id,
            'device_token' => $token,
            'nama_perangkat' => 'NodeMCU-IOT-003',
            'status_device' => 'offline',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('api.sensor.update'), [
                'jarak_cm' => 10,
                'latitude' => -6.3747,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('longitude');

        $this->assertDatabaseMissing('sensor_logs', [
            'iot_device_id' => $device->id,
            'trash_bin_id' => $trashBin->id,
        ]);
        $this->assertDatabaseMissing('gps_logs', [
            'iot_device_id' => $device->id,
            'trash_bin_id' => $trashBin->id,
        ]);
    }

    public function test_sensor_update_can_authenticate_with_hashed_token_lookup(): void
    {
        $unit = Unit::create([
            'nama' => 'SMP Kampus B',
            'jenis' => 'SMP',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'IOT-002',
            'nama' => 'Tong IoT Body Token',
            'unit_id' => $unit->id,
            'lokasi' => 'Kantin',
            'jenis_sampah' => 'anorganik',
            'tinggi_tong_cm' => 100,
            'status' => 'kosong',
        ]);
        $token = str_repeat('b', 64);
        $device = IotDevice::create([
            'trash_bin_id' => $trashBin->id,
            'device_token' => $token,
            'nama_perangkat' => 'NodeMCU-IOT-002',
            'status_device' => 'offline',
        ]);

        $this->postJson(route('api.sensor.update'), [
            'device_token' => $token,
            'jarak_cm' => 80,
        ])
            ->assertOk()
            ->assertJsonMissing(['device_token' => $token])
            ->assertJsonPath('trash_bin.status', 'kosong');

        $this->assertDatabaseHas('iot_devices', [
            'id' => $device->id,
            'device_token' => null,
            'device_token_hash' => hash('sha256', $token),
            'status_device' => 'online',
        ]);
    }

    public function test_iot_device_tokens_are_stored_hash_only(): void
    {
        $unit = Unit::create([
            'nama' => 'SD Kampus Token',
            'jenis' => 'SD',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'IOT-004',
            'nama' => 'Tong IoT Hash Only',
            'unit_id' => $unit->id,
            'lokasi' => 'Gudang',
            'jenis_sampah' => 'organik',
            'status' => 'kosong',
        ]);
        $token = IotDevice::makeToken();

        $device = IotDevice::create([
            'trash_bin_id' => $trashBin->id,
            'device_token' => $token,
            'nama_perangkat' => 'NodeMCU-IOT-004',
            'status_device' => 'offline',
        ]);

        $this->assertNull($device->fresh()->device_token);
        $this->assertSame(hash('sha256', $token), $device->fresh()->device_token_hash);
        $this->assertTrue($device->is(IotDevice::findByToken($token)));
    }
}
