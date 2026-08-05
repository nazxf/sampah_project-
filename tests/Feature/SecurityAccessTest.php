<?php

namespace Tests\Feature;

use App\Models\Complaint;
use App\Models\Report;
use App\Models\Role;
use App\Models\TrashBin;
use App\Models\TrashHistory;
use App\Models\Unit;
use App\Models\User;
use App\Models\Activity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SecurityAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_web_responses_include_security_headers(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    }

    public function test_private_local_storage_upload_route_is_disabled(): void
    {
        $this->assertFalse(Route::has('storage.local.upload'));
    }

    public function test_dashboard_does_not_share_global_role_and_unit_lists(): void
    {
        $superAdmin = $this->makeUser('super_admin');

        $this->actingAs($superAdmin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/SuperAdmin')
                ->missing('roles')
                ->missing('units')
            );
    }

    public function test_siswa_cannot_view_another_users_complaint(): void
    {
        $siswaA = $this->makeUser('siswa');
        $siswaB = $this->makeUser('siswa');
        $complaint = Complaint::create([
            'user_id' => $siswaA->id,
            'judul' => 'Aduan privat',
            'deskripsi' => 'Tidak boleh dibaca siswa lain.',
            'status' => 'menunggu',
        ]);

        $this->actingAs($siswaB)
            ->get(route('siswa.aduan.show', $complaint))
            ->assertForbidden();
    }

    public function test_non_siswa_cannot_access_siswa_routes(): void
    {
        $unit = $this->makeUnit('SD Kampus Siswa');
        $adminUnit = $this->makeUser('admin_unit', $unit);
        $trashBin = $this->makeTrashBin($unit);

        $this->actingAs($adminUnit)
            ->get(route('siswa.monitoring'))
            ->assertForbidden();

        $this->actingAs($adminUnit)
            ->post(route('siswa.aduan.store'), [
                'trash_bin_id' => $trashBin->id,
                'judul' => 'Aduan dari admin',
                'deskripsi' => 'Admin tidak boleh memakai endpoint siswa.',
            ])
            ->assertForbidden();
    }

    public function test_siswa_cannot_create_login_based_complaint_after_qr_flow_is_enabled(): void
    {
        $unit = $this->makeUnit('SD Kampus Aduan');
        $siswa = $this->makeUser('siswa', $unit);
        $trashBin = $this->makeTrashBin($unit);

        $this->actingAs($siswa)
            ->post(route('siswa.aduan.store'), [
                'trash_bin_id' => $trashBin->id,
                'judul' => 'Tong penuh',
                'deskripsi' => 'Tong di depan kelas penuh.',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('complaints', [
            'user_id' => $siswa->id,
            'trash_bin_id' => $trashBin->id,
            'judul' => 'Tong penuh',
        ]);
    }

    public function test_siswa_cannot_create_general_complaint_without_qr_trash_bin(): void
    {
        $unit = $this->makeUnit('SD Kampus Aduan Umum Siswa');
        $siswa = $this->makeUser('siswa', $unit);

        $this->actingAs($siswa)
            ->post(route('siswa.aduan.store'), [
                'judul' => 'Aduan umum',
                'deskripsi' => 'Aduan ini tidak terkait tong tertentu.',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('complaints', [
            'user_id' => $siswa->id,
            'trash_bin_id' => null,
            'judul' => 'Aduan umum',
        ]);
    }

    public function test_siswa_with_unit_cannot_create_complaint_for_other_unit_trash_bin(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus Aduan A');
        $otherUnit = $this->makeUnit('SMP Kampus Aduan B');
        $siswa = $this->makeUser('siswa', $ownedUnit);
        $ownedTrashBin = $this->makeTrashBin($ownedUnit);
        $otherTrashBin = $this->makeTrashBin($otherUnit);

        $this->actingAs($siswa)
            ->get(route('siswa.aduan.index'))
            ->assertRedirect(route('dashboard'));

        $this->actingAs($siswa)
            ->post(route('siswa.aduan.store'), [
                'trash_bin_id' => $otherTrashBin->id,
                'judul' => 'Tong unit lain',
                'deskripsi' => 'Tidak boleh membuat aduan lintas unit.',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('complaints', [
            'user_id' => $siswa->id,
            'trash_bin_id' => $otherTrashBin->id,
        ]);
    }

    public function test_siswa_dashboard_is_scoped_and_monitoring_is_closed(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus Scope');
        $otherUnit = $this->makeUnit('SMP Kampus Scope');
        $siswa = $this->makeUser('siswa', $ownedUnit);
        $ownedTrashBin = $this->makeTrashBin($ownedUnit);
        $this->makeTrashBin($otherUnit);

        $this->actingAs($siswa)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Siswa')
                ->has('tongSekitar', 1)
                ->where('tongSekitar.0.id', $ownedTrashBin->id)
            );

        $this->actingAs($siswa)
            ->get(route('siswa.monitoring'))
            ->assertForbidden();
    }

    public function test_authorized_users_can_view_complaint_and_trash_history_detail_pages(): void
    {
        $unit = $this->makeUnit('SD Kampus Detail');
        $adminUnit = $this->makeUser('admin_unit', $unit);
        $student = $this->makeUser('siswa', $unit);
        $trashBin = $this->makeTrashBin($unit);
        $complaint = Complaint::create([
            'user_id' => $student->id,
            'trash_bin_id' => $trashBin->id,
            'judul' => 'Aduan detail',
            'deskripsi' => 'Halaman detail harus bisa dibuka.',
            'status' => 'menunggu',
        ]);
        $history = TrashHistory::create([
            'trash_bin_id' => $trashBin->id,
            'user_id' => $adminUnit->id,
            'status_sebelum' => 'penuh',
            'status_sesudah' => 'kosong',
            'tanggal' => now(),
        ]);

        $this->actingAs($adminUnit)
            ->get(route('admin.complaints.show', $complaint))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Complaints/Show'));

        $this->actingAs($adminUnit)
            ->get(route('admin.trash-histories.show', $history))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('TrashHistories/Show'));
    }

    public function test_admin_unit_cannot_respond_to_complaint_from_other_unit(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus B');
        $otherUnit = $this->makeUnit('SMP Kampus B');
        $adminUnit = $this->makeUser('admin_unit', $ownedUnit);
        $student = $this->makeUser('siswa', $otherUnit);
        $trashBin = $this->makeTrashBin($otherUnit);
        $complaint = Complaint::create([
            'user_id' => $student->id,
            'trash_bin_id' => $trashBin->id,
            'judul' => 'Aduan unit lain',
            'deskripsi' => 'Tidak boleh ditangani admin unit lain.',
            'status' => 'menunggu',
        ]);

        $this->actingAs($adminUnit)
            ->put(route('admin.complaints.tanggapi', $complaint), [
                'status' => 'selesai',
                'tanggapan' => 'Ditutup',
            ])
            ->assertForbidden();
    }

    public function test_admin_unit_can_handle_general_complaint_from_own_unit_without_trash_bin(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus Aduan Umum');
        $otherUnit = $this->makeUnit('SMP Kampus Aduan Umum');
        $adminUnit = $this->makeUser('admin_unit', $ownedUnit);
        $otherAdminUnit = $this->makeUser('admin_unit', $otherUnit);
        $student = $this->makeUser('siswa', $ownedUnit);

        $complaint = Complaint::create([
            'user_id' => $student->id,
            'trash_bin_id' => null,
            'judul' => 'Aduan umum unit sendiri',
            'deskripsi' => 'Tidak terkait tong tertentu.',
            'status' => 'menunggu',
        ]);

        $this->actingAs($adminUnit)
            ->get(route('admin.complaints.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Complaints/Index')
                ->has('complaints.data', 1)
                ->where('complaints.data.0.id', $complaint->id)
                ->where('complaints.data.0.trash_bin_id', null)
            );

        $this->actingAs($adminUnit)
            ->put(route('admin.complaints.tanggapi', $complaint), [
                'status' => 'diproses',
                'tanggapan' => 'Aduan umum sedang ditindaklanjuti.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'status' => 'diproses',
            'ditanggapi_oleh' => $adminUnit->id,
        ]);

        $this->actingAs($otherAdminUnit)
            ->put(route('admin.complaints.tanggapi', $complaint), [
                'status' => 'selesai',
                'tanggapan' => 'Tidak boleh dari unit lain.',
            ])
            ->assertForbidden();
    }

    public function test_admin_unit_dashboard_counts_general_complaints_from_own_unit(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus Dashboard Aduan');
        $otherUnit = $this->makeUnit('SMP Kampus Dashboard Aduan');
        $adminUnit = $this->makeUser('admin_unit', $ownedUnit);
        $student = $this->makeUser('siswa', $ownedUnit);
        $otherStudent = $this->makeUser('siswa', $otherUnit);

        Complaint::create([
            'user_id' => $student->id,
            'trash_bin_id' => null,
            'judul' => 'Aduan umum dashboard',
            'deskripsi' => 'Masuk hitungan dashboard unit.',
            'status' => 'menunggu',
        ]);
        Complaint::create([
            'user_id' => $otherStudent->id,
            'trash_bin_id' => null,
            'judul' => 'Aduan umum unit lain',
            'deskripsi' => 'Tidak masuk hitungan dashboard unit ini.',
            'status' => 'menunggu',
        ]);

        $this->actingAs($adminUnit)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/AdminUnit')
                ->where('totalAduanPending', 1)
                ->has('aduanTerbaru', 1)
                ->where('aduanTerbaru.0.user_id', $student->id)
            );
    }

    public function test_complaint_photo_is_deleted_when_complaint_is_deleted(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('complaints/aduan.jpg', 'foto');
        $unit = $this->makeUnit('SD Kampus File Aduan');
        $adminUnit = $this->makeUser('admin_unit', $unit);
        $student = $this->makeUser('siswa', $unit);
        $trashBin = $this->makeTrashBin($unit);
        $complaint = Complaint::create([
            'user_id' => $student->id,
            'trash_bin_id' => $trashBin->id,
            'judul' => 'Aduan dengan foto',
            'deskripsi' => 'File harus ikut hilang saat aduan dihapus.',
            'foto' => 'complaints/aduan.jpg',
            'status' => 'menunggu',
        ]);

        $this->actingAs($adminUnit)
            ->delete(route('admin.complaints.destroy', $complaint))
            ->assertRedirect();

        Storage::disk('public')->assertMissing('complaints/aduan.jpg');
    }

    public function test_admin_unit_cannot_view_trash_history_from_other_unit(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus E');
        $otherUnit = $this->makeUnit('SMP Kampus E');
        $adminUnit = $this->makeUser('admin_unit', $ownedUnit);
        $trashBin = $this->makeTrashBin($otherUnit);
        $history = TrashHistory::create([
            'trash_bin_id' => $trashBin->id,
            'user_id' => $adminUnit->id,
            'status_sebelum' => 'penuh',
            'status_sesudah' => 'kosong',
            'tanggal' => now(),
        ]);

        $this->actingAs($adminUnit)
            ->get(route('admin.trash-histories.show', $history))
            ->assertForbidden();
    }

    public function test_trash_history_photo_is_deleted_when_history_is_deleted(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('trash-histories/angkut.jpg', 'foto');
        $unit = $this->makeUnit('SD Kampus File Riwayat');
        $superAdmin = $this->makeUser('super_admin');
        $trashBin = $this->makeTrashBin($unit);
        $history = TrashHistory::create([
            'trash_bin_id' => $trashBin->id,
            'user_id' => $superAdmin->id,
            'status_sebelum' => 'penuh',
            'status_sesudah' => 'kosong',
            'tanggal' => now(),
            'foto' => 'trash-histories/angkut.jpg',
        ]);

        $this->actingAs($superAdmin)
            ->delete(route('admin.trash-histories.destroy', $history))
            ->assertRedirect();

        Storage::disk('public')->assertMissing('trash-histories/angkut.jpg');
    }

    public function test_admin_unit_cannot_export_report_from_other_unit(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus B');
        $otherUnit = $this->makeUnit('SMP Kampus B');
        $adminUnit = $this->makeUser('admin_unit', $ownedUnit);
        $report = Report::create([
            'user_id' => $adminUnit->id,
            'unit_id' => $otherUnit->id,
            'judul' => 'Laporan unit lain',
            'tipe' => 'harian',
            'periode_mulai' => now()->toDateString(),
            'periode_selesai' => now()->toDateString(),
        ]);

        $this->actingAs($adminUnit)
            ->get(route('admin.reports.pdf', $report))
            ->assertForbidden();
    }

    public function test_admin_unit_cannot_update_other_unit_trash_bin_status(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus C');
        $otherUnit = $this->makeUnit('SMP Kampus C');
        $adminUnit = $this->makeUser('admin_unit', $ownedUnit);
        $trashBin = $this->makeTrashBin($otherUnit);

        $this->actingAs($adminUnit)
            ->put(route('admin.trash-bins.status', $trashBin), [
                'status' => 'kosong',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('trash_bins', [
            'id' => $trashBin->id,
            'status' => 'penuh',
        ]);
    }

    public function test_admin_unit_trash_bin_create_is_forced_to_own_unit(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus D');
        $otherUnit = $this->makeUnit('SMP Kampus D');
        $adminUnit = $this->makeUser('admin_unit', $ownedUnit);

        $this->actingAs($adminUnit)
            ->post(route('admin.trash-bins.store'), [
                'kode' => 'OWN-001',
                'nama' => 'Tong Own Unit',
                'unit_id' => $otherUnit->id,
                'lokasi' => 'Halaman',
                'jenis_sampah' => 'organik',
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('trash_bins', [
            'kode' => 'OWN-001',
            'unit_id' => $ownedUnit->id,
        ]);

        $this->assertDatabaseMissing('trash_bins', [
            'kode' => 'OWN-001',
            'unit_id' => $otherUnit->id,
        ]);
    }

    public function test_admin_unit_cannot_assign_super_admin_role_or_manage_other_unit_user(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus B');
        $otherUnit = $this->makeUnit('SMP Kampus B');
        $adminUnit = $this->makeUser('admin_unit', $ownedUnit);
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'super_admin'],
            ['label' => 'Super Admin']
        );
        $siswaRole = Role::firstOrCreate(
            ['name' => 'siswa'],
            ['label' => 'Siswa']
        );
        $otherUser = $this->makeUser('siswa', $otherUnit);

        $this->actingAs($adminUnit)
            ->post(route('admin.users.store'), [
                'name' => 'Escalated User',
                'email' => 'escalated@sipesa.test',
                'password' => 'password1',
                'role_id' => $superAdminRole->id,
                'unit_id' => $ownedUnit->id,
            ])
            ->assertForbidden();

        $this->actingAs($adminUnit)
            ->put(route('admin.users.update', $otherUser), [
                'name' => 'Other Unit Updated',
                'email' => $otherUser->email,
                'password' => '',
                'role_id' => $siswaRole->id,
                'unit_id' => $ownedUnit->id,
            ])
            ->assertForbidden();
    }

    public function test_admin_unit_user_stats_are_scoped_to_own_unit(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus Statistik');
        $otherUnit = $this->makeUnit('SMP Kampus Statistik');
        $adminUnit = $this->makeUser('admin_unit', $ownedUnit);
        $ownedStudent = $this->makeUser('siswa', $ownedUnit);
        $this->makeUser('siswa', $otherUnit);

        $this->actingAs($adminUnit)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Users/Index')
                ->has('users.data', 2)
                ->where('stats.total', 2)
                ->where('stats.siswa', 1)
                ->where('users.data.0.unit_id', $ownedUnit->id)
            );

        $this->assertDatabaseHas('users', [
            'id' => $ownedStudent->id,
            'unit_id' => $ownedUnit->id,
        ]);
    }

    public function test_user_password_hash_is_not_written_to_activity_log(): void
    {
        $superAdmin = $this->makeUser('super_admin');
        $unit = $this->makeUnit('SD Kampus Audit');
        $target = $this->makeUser('siswa', $unit);
        $siswaRole = Role::where('name', 'siswa')->firstOrFail();

        $this->actingAs($superAdmin)
            ->put(route('admin.users.update', $target), [
                'name' => $target->name,
                'email' => $target->email,
                'password' => 'password-baru-aman',
                'role_id' => $siswaRole->id,
                'unit_id' => $unit->id,
            ])
            ->assertRedirect();

        $activity = Activity::where('tipe', 'update')->latest()->firstOrFail();

        $this->assertArrayNotHasKey('password', $activity->data);
        $this->assertStringNotContainsString('password-baru-aman', json_encode($activity->data));
        $this->assertStringNotContainsString('$2y$', json_encode($activity->data));
    }

    public function test_kepala_unit_has_read_only_access_scoped_to_own_unit(): void
    {
        $ownedUnit = $this->makeUnit('SD Kampus Kepala');
        $otherUnit = $this->makeUnit('SMP Kampus Kepala');
        $kepalaUnit = $this->makeUser('kepala_unit', $ownedUnit);
        $ownedTrashBin = $this->makeTrashBin($ownedUnit);
        $this->makeTrashBin($otherUnit);
        $ownedReport = Report::create([
            'user_id' => $kepalaUnit->id,
            'unit_id' => $ownedUnit->id,
            'judul' => 'Laporan unit sendiri',
            'tipe' => 'harian',
            'periode_mulai' => now()->toDateString(),
            'periode_selesai' => now()->toDateString(),
        ]);
        $otherReport = Report::create([
            'user_id' => $kepalaUnit->id,
            'unit_id' => $otherUnit->id,
            'judul' => 'Laporan unit lain',
            'tipe' => 'harian',
            'periode_mulai' => now()->toDateString(),
            'periode_selesai' => now()->toDateString(),
        ]);

        $this->actingAs($kepalaUnit)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Dashboard/AdminUnit'));

        $this->actingAs($kepalaUnit)
            ->get(route('admin.trash-bins.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('TrashBins/Index')
                ->has('trashBins.data', 1)
                ->where('trashBins.data.0.id', $ownedTrashBin->id)
            );

        $this->actingAs($kepalaUnit)
            ->get(route('admin.reports.show', $ownedReport))
            ->assertOk();

        $this->actingAs($kepalaUnit)
            ->get(route('admin.reports.show', $otherReport))
            ->assertForbidden();

        $this->actingAs($kepalaUnit)
            ->post(route('admin.trash-bins.store'), [
                'kode' => 'READ-ONLY',
                'nama' => 'Tidak Boleh',
                'unit_id' => $ownedUnit->id,
                'lokasi' => 'Halaman',
                'jenis_sampah' => 'organik',
            ])
            ->assertForbidden();
    }

    private function makeRole(string $name): Role
    {
        return Role::firstOrCreate(
            ['name' => $name],
            ['label' => str_replace('_', ' ', $name)]
        );
    }

    private function makeUser(string $roleName, ?Unit $unit = null): User
    {
        return User::factory()->create([
            'role_id' => $this->makeRole($roleName)->id,
            'unit_id' => $unit?->id,
            'email_verified_at' => now(),
        ]);
    }

    private function makeUnit(string $name): Unit
    {
        return Unit::create([
            'nama' => $name,
            'jenis' => str($name)->before(' ')->toString(),
            'alamat' => 'Jl. Pendidikan',
        ]);
    }

    private function makeTrashBin(Unit $unit): TrashBin
    {
        return TrashBin::create([
            'kode' => 'SEC-' . $unit->id,
            'nama' => 'Tong ' . $unit->nama,
            'unit_id' => $unit->id,
            'lokasi' => 'Halaman',
            'jenis_sampah' => 'organik',
            'status' => 'penuh',
        ]);
    }
}
