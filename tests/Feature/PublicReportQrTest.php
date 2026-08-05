<?php

namespace Tests\Feature;

use App\Models\{PublicReport, Role, TrashBin, Unit, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicReportQrTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_qr_report_page_is_available_without_login(): void
    {
        $trashBin = $this->makeTrashBin();

        $this->get(route('public-reports.create', ['trashBin' => $trashBin->kode]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('PublicReports/Create')
                ->where('trashBin.kode', $trashBin->kode)
            );
    }

    public function test_public_qr_report_updates_the_target_trash_bin_status(): void
    {
        $trashBin = $this->makeTrashBin(['status' => 'kosong']);

        $this->post(route('public-reports.store', ['trashBin' => $trashBin->kode]), [
            'status_tong' => 'penuh',
            'deskripsi' => 'Tong sudah meluber.',
        ])->assertRedirect(route('public-reports.create', ['trashBin' => $trashBin->kode]));

        $this->assertDatabaseHas('public_reports', [
            'trash_bin_id' => $trashBin->id,
            'jenis_masalah' => 'penuh',
            'status' => 'menunggu',
        ]);
        $this->assertSame('penuh', $trashBin->fresh()->status);
    }

    public function test_siswa_monitoring_is_closed_after_qr_flow_replaces_warga_menu(): void
    {
        $siswa = $this->makeUser('siswa');

        $this->actingAs($siswa)
            ->get(route('siswa.monitoring'))
            ->assertForbidden();
    }

    public function test_admin_can_open_barcode_print_page(): void
    {
        $unit = $this->makeUnit();
        $admin = $this->makeUser('admin_unit', $unit);
        $trashBin = $this->makeTrashBin(['unit_id' => $unit->id]);

        $this->actingAs($admin)
            ->get(route('admin.trash-bins.barcode', $trashBin))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('TrashBins/Barcode')
                ->where('trashBin.kode', $trashBin->kode)
                ->where('reportUrl', route('public-reports.create', ['trashBin' => $trashBin->kode]))
            );
    }

    private function makeUnit(array $overrides = []): Unit
    {
        return Unit::create(array_merge([
            'nama' => 'Unit QR',
            'jenis' => 'SD',
            'alamat' => 'Kampus',
        ], $overrides));
    }

    private function makeTrashBin(array $overrides = []): TrashBin
    {
        $unitId = $overrides['unit_id'] ?? $this->makeUnit()->id;

        return TrashBin::create(array_merge([
            'kode' => 'QR-' . fake()->unique()->numerify('###'),
            'nama' => 'Tong QR',
            'unit_id' => $unitId,
            'lokasi' => 'Depan kelas',
            'jenis_sampah' => 'organik',
            'status' => 'kosong',
        ], $overrides));
    }

    private function makeUser(string $roleName, ?Unit $unit = null): User
    {
        $role = Role::create([
            'name' => $roleName,
            'label' => str($roleName)->replace('_', ' ')->title(),
        ]);

        $user = User::create([
            'name' => 'User ' . $roleName,
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'role_id' => $role->id,
            'unit_id' => $unit?->id,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        return $user;
    }
}
