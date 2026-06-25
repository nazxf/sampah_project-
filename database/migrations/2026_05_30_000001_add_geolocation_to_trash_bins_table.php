<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('trash_bins', 'latitude')) {
            Schema::table('trash_bins', function (Blueprint $table) {
                $table->decimal('latitude', 10, 7)->nullable()->after('foto');
            });
        }

        if (! Schema::hasColumn('trash_bins', 'longitude')) {
            Schema::table('trash_bins', function (Blueprint $table) {
                $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            });
        }

        DB::table('trash_bins')
            ->where('jenis_sampah', 'b3')
            ->update(['jenis_sampah' => 'anorganik']);
    }

    public function down(): void
    {
        $columns = array_values(array_filter([
            Schema::hasColumn('trash_bins', 'latitude') ? 'latitude' : null,
            Schema::hasColumn('trash_bins', 'longitude') ? 'longitude' : null,
        ]));

        if ($columns !== []) {
            Schema::table('trash_bins', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }
};
