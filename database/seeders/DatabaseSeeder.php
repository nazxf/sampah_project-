<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Models\TrashBin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
        $superAdmin = Role::create(['name' => 'super_admin', 'label' => 'Super Admin', 'description' => 'Akses penuh ke seluruh sistem']);
        $adminUnit = Role::create(['name' => 'admin_unit', 'label' => 'Admin Unit', 'description' => 'Mengelola unit masing-masing']);
        $petugas = Role::create(['name' => 'petugas', 'label' => 'Petugas', 'description' => 'Petugas pengangkut sampah']);
        $siswa = Role::create(['name' => 'siswa', 'label' => 'Siswa', 'description' => 'Siswa/masyarakat pelapor']);

        // Units
        $sd = Unit::create(['nama' => 'SD Kampus B', 'jenis' => 'SD', 'alamat' => 'Jl. Pendidikan No. 1, Kampus B', 'deskripsi' => 'Sekolah Dasar']);
        $smp = Unit::create(['nama' => 'SMP Kampus B', 'jenis' => 'SMP', 'alamat' => 'Jl. Pendidikan No. 2, Kampus B', 'deskripsi' => 'Sekolah Menengah Pertama']);
        $sma = Unit::create(['nama' => 'SMA Kampus B', 'jenis' => 'SMA', 'alamat' => 'Jl. Pendidikan No. 3, Kampus B', 'deskripsi' => 'Sekolah Menengah Atas']);
        $tk = Unit::create(['nama' => 'TK Kampus B', 'jenis' => 'TK', 'alamat' => 'Jl. Pendidikan No. 4, Kampus B', 'deskripsi' => 'Taman Kanak-Kanak']);
        $btm = Unit::create(['nama' => 'BTM Kampus B', 'jenis' => 'BTM', 'alamat' => 'Jl. Pendidikan No. 5, Kampus B', 'deskripsi' => 'Balai Teknologi dan Manajemen']);
        $sumart = Unit::create(['nama' => 'Sumart Kampus B', 'jenis' => 'Sumart', 'alamat' => 'Jl. Pendidikan No. 6, Kampus B', 'deskripsi' => 'Mini Market / Kantin']);
        $umci = Unit::create(['nama' => 'UMCI Kampus B', 'jenis' => 'Umci', 'alamat' => 'Jl. Pendidikan No. 7, Kampus B', 'deskripsi' => 'Unit MCI']);

        // Users
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@sipesa.test',
            'password' => Hash::make('password'),
            'role_id' => $superAdmin->id,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Admin SD',
            'email' => 'adminsd@sipesa.test',
            'password' => Hash::make('password'),
            'role_id' => $adminUnit->id,
            'unit_id' => $sd->id,
            'email_verified_at' => now(),
        ]);

        $petugasUser = User::create([
            'name' => 'Petugas 1',
            'email' => 'petugas@sipesa.test',
            'password' => Hash::make('password'),
            'role_id' => $petugas->id,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Siswa Contoh',
            'email' => 'siswa@sipesa.test',
            'password' => Hash::make('password'),
            'role_id' => $siswa->id,
            'email_verified_at' => now(),
        ]);

        // Trash Bins for each unit
        $units = [$sd, $smp, $sma, $tk, $btm, $sumart, $umci];
        $statuses = ['kosong', 'setengah_penuh', 'penuh', 'sudah_diangkut'];
        $jenisList = ['organik', 'anorganik', 'b3'];

        foreach ($units as $i => $unit) {
            $numBins = rand(3, 6);
            for ($j = 1; $j <= $numBins; $j++) {
                TrashBin::create([
                    'kode' => strtoupper(substr($unit->jenis, 0, 2)) . '-' . str_pad($i + 1, 2, '0', STR_PAD_LEFT) . str_pad($j, 2, '0', STR_PAD_LEFT),
                    'nama' => 'Tong ' . $unit->nama . ' #' . $j,
                    'unit_id' => $unit->id,
                    'lokasi' => $unit->nama . ' - Area ' . chr(64 + $j),
                    'jenis_sampah' => $jenisList[array_rand($jenisList)],
                    'status' => $statuses[array_rand($statuses)],
                    'keterangan' => 'Tong sampah otomatis terdata',
                ]);
            }
        }
    }
}
