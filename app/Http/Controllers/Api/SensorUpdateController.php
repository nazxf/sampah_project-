<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GpsLog;
use App\Models\IotDevice;
use App\Models\SensorLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SensorUpdateController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_token' => 'nullable|string|min:32|max:128',
            'jarak_cm' => 'required|numeric|min:0|max:999.99',
            'persentase_kepenuhan' => 'nullable|numeric|min:0|max:100',
            'latitude' => 'nullable|required_with:longitude|numeric|between:-90,90',
            'longitude' => 'nullable|required_with:latitude|numeric|between:-180,180',
            'akurasi_meter' => 'nullable|numeric|min:0|max:999.99',
            'firmware_version' => 'nullable|string|max:20',
        ], [
            'latitude.required_with' => 'Latitude dan longitude wajib dikirim bersama.',
            'longitude.required_with' => 'Latitude dan longitude wajib dikirim bersama.',
        ]);

        $token = $request->bearerToken() ?: ($validated['device_token'] ?? null);

        if (! $token) {
            return response()->json([
                'message' => 'Token perangkat wajib dikirim.',
            ], 401);
        }

        if (strlen($token) < 32 || strlen($token) > 128) {
            return response()->json([
                'message' => 'Token perangkat tidak valid.',
            ], 401);
        }

        $device = IotDevice::findByToken($token);

        if (! $device) {
            return response()->json([
                'message' => 'Token perangkat tidak valid.',
            ], 401);
        }

        $trashBin = $device->trashBin;
        $persentase = $validated['persentase_kepenuhan'] ?? $this->calculateFillPercentage(
            (float) $validated['jarak_cm'],
            (float) ($trashBin->tinggi_tong_cm ?: 100)
        );

        $status = $this->statusFromPercentage($persentase);

        DB::transaction(function () use ($validated, $device, $trashBin, $persentase, $status): void {
            SensorLog::create([
                'iot_device_id' => $device->id,
                'trash_bin_id' => $trashBin->id,
                'jarak_cm' => $validated['jarak_cm'],
                'persentase_kepenuhan' => $persentase,
            ]);

            $hasGps = array_key_exists('latitude', $validated)
                && array_key_exists('longitude', $validated)
                && $validated['latitude'] !== null
                && $validated['longitude'] !== null;

            if ($hasGps) {
                GpsLog::create([
                    'trash_bin_id' => $trashBin->id,
                    'iot_device_id' => $device->id,
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'akurasi_meter' => $validated['akurasi_meter'] ?? null,
                ]);
            }

            $trashBin->update(array_filter([
                'persentase_kepenuhan' => $persentase,
                'status' => $status,
                'last_sensor_at' => now(),
                'latitude' => $hasGps ? $validated['latitude'] : null,
                'longitude' => $hasGps ? $validated['longitude'] : null,
            ], fn ($value) => $value !== null));

            $device->update([
                'status_device' => 'online',
                'last_ping_at' => now(),
                'firmware_version' => $validated['firmware_version'] ?? $device->firmware_version,
            ]);
        });

        return response()->json([
            'message' => 'Data sensor berhasil diterima.',
            'trash_bin' => [
                'id' => $trashBin->id,
                'kode' => $trashBin->kode,
                'status' => $status,
                'persentase_kepenuhan' => round($persentase, 2),
            ],
        ]);
    }

    private function calculateFillPercentage(float $distanceCm, float $heightCm): float
    {
        $height = max(1, $heightCm);
        $filled = max(0, min($height, $height - $distanceCm));

        return round(($filled / $height) * 100, 2);
    }

    private function statusFromPercentage(float $percentage): string
    {
        if ($percentage <= (float) config('sipesa.trash_bin.status_empty_max', 40)) {
            return 'kosong';
        }

        if ($percentage <= (float) config('sipesa.trash_bin.status_medium_max', 75)) {
            return 'setengah_penuh';
        }

        return 'penuh';
    }
}
