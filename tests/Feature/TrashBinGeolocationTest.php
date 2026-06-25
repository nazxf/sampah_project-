<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\TrashHistory;
use App\Models\TrashBin;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TrashBinGeolocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_store_coordinates_and_only_two_trash_types_are_allowed(): void
    {
        $admin = $this->makeUser('super_admin');
        $unit = Unit::create([
            'nama' => 'SMA Kampus B',
            'jenis' => 'SMA',
            'alamat' => 'Jl. Pendidikan',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.trash-bins.store'), [
                'kode' => 'TS-001',
                'nama' => 'Tong Uji',
                'unit_id' => $unit->id,
                'lokasi' => 'Depan kelas',
                'jenis_sampah' => 'b3',
            ])
            ->assertSessionHasErrors('jenis_sampah');

        $this->actingAs($admin)
            ->post(route('admin.trash-bins.store'), [
                'kode' => 'TS-001',
                'nama' => 'Tong Uji',
                'unit_id' => $unit->id,
                'lokasi' => 'Depan kelas',
                'jenis_sampah' => 'anorganik',
                'latitude' => -6.2001,
                'longitude' => 106.8167,
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('trash_bins', [
            'kode' => 'TS-001',
            'jenis_sampah' => 'anorganik',
            'latitude' => -6.2001,
            'longitude' => 106.8167,
        ]);
    }

    public function test_admin_update_validates_coordinate_ranges(): void
    {
        $admin = $this->makeUser('super_admin');
        $unit = Unit::create([
            'nama' => 'SMP Kampus B',
            'jenis' => 'SMP',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'TS-002',
            'nama' => 'Tong Lama',
            'unit_id' => $unit->id,
            'lokasi' => 'Lorong',
            'jenis_sampah' => 'organik',
            'status' => 'penuh',
        ]);

        $this->actingAs($admin)
            ->put(route('admin.trash-bins.update', $trashBin), [
                'kode' => 'TS-002',
                'nama' => 'Tong Lama',
                'unit_id' => $unit->id,
                'lokasi' => 'Lorong',
                'jenis_sampah' => 'organik',
                'latitude' => -91,
                'longitude' => 106.8167,
            ])
            ->assertSessionHasErrors('latitude');

        $this->actingAs($admin)
            ->put(route('admin.trash-bins.update', $trashBin), [
                'kode' => 'TS-002',
                'nama' => 'Tong Baru',
                'unit_id' => $unit->id,
                'lokasi' => 'Lorong',
                'jenis_sampah' => 'organik',
                'latitude' => -6.201,
                'longitude' => 106.817,
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('trash_bins', [
            'kode' => 'TS-002',
            'nama' => 'Tong Baru',
            'latitude' => -6.201,
            'longitude' => 106.817,
        ]);
    }

    public function test_petugas_collection_list_exposes_anorganic_overdue_metadata(): void
    {
        $petugas = $this->makeUser('petugas');
        $unit = Unit::create([
            'nama' => 'SD Kampus B',
            'jenis' => 'SD',
            'alamat' => 'Jl. Pendidikan',
        ]);

        TrashBin::create([
            'kode' => 'AN-001',
            'nama' => 'Anorganik Lama',
            'unit_id' => $unit->id,
            'lokasi' => 'Area A',
            'jenis_sampah' => 'anorganik',
            'status' => 'penuh',
            'terakhir_diangkut' => now()->subHours(73),
        ]);
        TrashBin::create([
            'kode' => 'OR-001',
            'nama' => 'Organik Lama',
            'unit_id' => $unit->id,
            'lokasi' => 'Area B',
            'jenis_sampah' => 'organik',
            'status' => 'penuh',
            'terakhir_diangkut' => now()->subHours(96),
        ]);

        $this->actingAs($petugas)
            ->get(route('petugas.pengangkutan.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('TrashHistories/Index')
                ->where('trashBins.0.kode', 'AN-001')
                ->where('trashBins.0.is_overdue', true)
                ->where('trashBins.1.kode', 'OR-001')
                ->where('trashBins.1.is_overdue', false)
            );
    }

    public function test_pickup_store_validates_status_and_records_confirmation_coordinates(): void
    {
        $petugas = $this->makeUser('petugas');
        $unit = Unit::create([
            'nama' => 'SMA Kampus B',
            'jenis' => 'SMA',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'PK-001',
            'nama' => 'Tong Pickup',
            'unit_id' => $unit->id,
            'lokasi' => 'Gerbang',
            'jenis_sampah' => 'organik',
            'status' => 'penuh',
            'latitude' => -6.374672,
            'longitude' => 106.924831,
        ]);

        $this->actingAs($petugas)
            ->post(route('petugas.pengangkutan.store'), [
                'trash_bin_id' => $trashBin->id,
                'status_sebelum' => 'kosong',
                'status_sesudah' => 'rusak',
                'tanggal' => now()->format('Y-m-d H:i:s'),
            ])
            ->assertSessionHasErrors('status_sesudah');

        $this->actingAs($petugas)
            ->post(route('petugas.pengangkutan.store'), [
                'trash_bin_id' => $trashBin->id,
                'status_sebelum' => 'kosong',
                'status_sesudah' => 'kosong',
                'tanggal' => now()->format('Y-m-d H:i:s'),
                'latitude_konfirmasi' => -6.3747,
                'longitude_konfirmasi' => 106.9248,
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('trash_histories', [
            'trash_bin_id' => $trashBin->id,
            'user_id' => $petugas->id,
            'status_sebelum' => 'penuh',
            'status_sesudah' => 'kosong',
            'latitude_konfirmasi' => -6.3747,
            'longitude_konfirmasi' => 106.9248,
        ]);

        $history = TrashHistory::where('trash_bin_id', $trashBin->id)->first();
        $this->assertNotNull($history->jarak_konfirmasi_meter);
        $this->assertLessThan(50, $history->jarak_konfirmasi_meter);
    }

    public function test_petugas_must_confirm_pickup_near_trash_bin_location(): void
    {
        $petugas = $this->makeUser('petugas');
        $unit = Unit::create([
            'nama' => 'SMA Kampus B',
            'jenis' => 'SMA',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'PK-002',
            'nama' => 'Tong Radius',
            'unit_id' => $unit->id,
            'lokasi' => 'Gerbang',
            'jenis_sampah' => 'organik',
            'status' => 'penuh',
            'latitude' => -6.374672,
            'longitude' => 106.924831,
        ]);

        $payload = [
            'trash_bin_id' => $trashBin->id,
            'status_sesudah' => 'kosong',
            'tanggal' => now()->format('Y-m-d H:i:s'),
        ];

        $this->actingAs($petugas)
            ->post(route('petugas.pengangkutan.store'), $payload)
            ->assertSessionHasErrors('latitude_konfirmasi');

        $this->actingAs($petugas)
            ->post(route('petugas.pengangkutan.store'), [
                ...$payload,
                'latitude_konfirmasi' => -6.3900,
                'longitude_konfirmasi' => 106.9400,
            ])
            ->assertSessionHasErrors('latitude_konfirmasi');

        $this->assertDatabaseMissing('trash_histories', [
            'trash_bin_id' => $trashBin->id,
            'status_sesudah' => 'kosong',
        ]);
    }

    public function test_petugas_confirmation_requires_both_latitude_and_longitude(): void
    {
        $petugas = $this->makeUser('petugas');
        $unit = Unit::create([
            'nama' => 'SMA Kampus Koordinat',
            'jenis' => 'SMA',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'PK-003',
            'nama' => 'Tong Koordinat Parsial',
            'unit_id' => $unit->id,
            'lokasi' => 'Gerbang',
            'jenis_sampah' => 'organik',
            'status' => 'penuh',
            'latitude' => -6.374672,
            'longitude' => 106.924831,
        ]);

        $this->actingAs($petugas)
            ->post(route('petugas.pengangkutan.store'), [
                'trash_bin_id' => $trashBin->id,
                'status_sesudah' => 'kosong',
                'tanggal' => now()->format('Y-m-d H:i:s'),
                'latitude_konfirmasi' => -6.3747,
            ])
            ->assertSessionHasErrors('longitude_konfirmasi');

        $this->assertDatabaseMissing('trash_histories', [
            'trash_bin_id' => $trashBin->id,
            'status_sesudah' => 'kosong',
        ]);
    }

    public function test_admin_unit_cannot_record_pickup_for_other_unit(): void
    {
        $role = Role::create([
            'name' => 'admin_unit',
            'label' => 'Admin Unit',
        ]);
        $ownedUnit = Unit::create([
            'nama' => 'SD Kampus B',
            'jenis' => 'SD',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $otherUnit = Unit::create([
            'nama' => 'SMP Kampus B',
            'jenis' => 'SMP',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $adminUnit = User::factory()->create([
            'role_id' => $role->id,
            'unit_id' => $ownedUnit->id,
            'email_verified_at' => now(),
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'OT-001',
            'nama' => 'Tong Unit Lain',
            'unit_id' => $otherUnit->id,
            'lokasi' => 'Halaman',
            'jenis_sampah' => 'organik',
            'status' => 'penuh',
        ]);

        $this->actingAs($adminUnit)
            ->post(route('admin.trash-histories.store'), [
                'trash_bin_id' => $trashBin->id,
                'status_sesudah' => 'kosong',
                'tanggal' => now()->format('Y-m-d H:i:s'),
            ])
            ->assertForbidden();
    }

    public function test_petugas_with_unit_cannot_record_pickup_for_other_unit(): void
    {
        $role = Role::create([
            'name' => 'petugas',
            'label' => 'Petugas',
        ]);
        $ownedUnit = Unit::create([
            'nama' => 'SD Kampus C',
            'jenis' => 'SD',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $otherUnit = Unit::create([
            'nama' => 'SMP Kampus C',
            'jenis' => 'SMP',
            'alamat' => 'Jl. Pendidikan',
        ]);
        $petugas = User::factory()->create([
            'role_id' => $role->id,
            'unit_id' => $ownedUnit->id,
            'email_verified_at' => now(),
        ]);
        $trashBin = TrashBin::create([
            'kode' => 'PT-001',
            'nama' => 'Tong Unit Lain',
            'unit_id' => $otherUnit->id,
            'lokasi' => 'Halaman',
            'jenis_sampah' => 'organik',
            'status' => 'penuh',
        ]);

        $this->actingAs($petugas)
            ->post(route('petugas.pengangkutan.store'), [
                'trash_bin_id' => $trashBin->id,
                'status_sesudah' => 'kosong',
                'tanggal' => now()->format('Y-m-d H:i:s'),
            ])
            ->assertForbidden();
    }

    private function makeUser(string $roleName): User
    {
        $role = Role::create([
            'name' => $roleName,
            'label' => $roleName,
        ]);

        return User::factory()->create([
            'role_id' => $role->id,
            'email_verified_at' => now(),
        ]);
    }
}
