<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('iot_devices', function (Blueprint $table) {
            $table->string('device_token_hash', 64)
                ->nullable()
                ->unique()
                ->after('device_token')
                ->comment('SHA-256 hash token perangkat untuk lookup autentikasi API.');
        });

        DB::table('iot_devices')
            ->whereNotNull('device_token')
            ->orderBy('id')
            ->eachById(function ($device): void {
                DB::table('iot_devices')
                    ->where('id', $device->id)
                    ->update([
                        'device_token_hash' => hash('sha256', $device->device_token),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('iot_devices', function (Blueprint $table) {
            $table->dropUnique(['device_token_hash']);
            $table->dropColumn('device_token_hash');
        });
    }
};
