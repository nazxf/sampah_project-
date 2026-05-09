<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('email')->constrained('roles')->onDelete('set null');
            $table->foreignId('unit_id')->nullable()->after('role_id')->constrained('units')->onDelete('set null');
            $table->string('no_telepon')->nullable()->after('password');
            $table->text('alamat')->nullable()->after('no_telepon');
            $table->string('avatar')->nullable()->after('alamat');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['unit_id']);
            $table->dropColumn(['role_id', 'unit_id', 'no_telepon', 'alamat', 'avatar']);
        });
    }
};
