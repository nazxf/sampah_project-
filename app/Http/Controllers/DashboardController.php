<?php

namespace App\Http\Controllers;

use App\Models\{Activity, Complaint, TrashBin, TrashHistory, Unit, User};
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return match (true) {
            $user->isSuperAdmin() => $this->superAdminDashboard(),
            $user->isAdminUnit() => $this->adminUnitDashboard($user),
            $user->isKepalaPusat() => $this->superAdminDashboard(),
            $user->isKepalaUnit() => $this->adminUnitDashboard($user),
            $user->isPetugas() => $this->petugasDashboard($user),
            $user->isSiswa() => $this->siswaDashboard($user),
            default => redirect()->route('login'),
        };
    }

    private function superAdminDashboard(): \Inertia\Response
    {
        return Inertia::render('Dashboard/SuperAdmin', [
            'totalUnits' => Unit::count(),
            'totalTrashBins' => TrashBin::count(),
            'totalUsers' => User::count(),
            'totalPenuh' => TrashBin::where('status', 'penuh')->count(),
            'totalDiangkutHariIni' => TrashHistory::whereDate('tanggal', today())->count(),
            'totalAduanPending' => Complaint::where('status', 'menunggu')->count(),
            'tongPerUnit' => Unit::withCount(['trashBins', 'trashBins as penuh_count' => fn($q) => $q->where('status', 'penuh')])
                ->get()
                ->map(fn($u) => [
                    'nama' => $u->nama,
                    'total' => $u->trash_bins_count,
                    'penuh' => $u->penuh_count,
                ]),
            'aktivitasTerbaru' => Activity::with('user')->latest()->take(10)->get(),
            'aduanTerbaru' => Complaint::with('user', 'trashBin')->where('status', 'menunggu')->latest()->take(5)->get(),
            'tongPenuh' => TrashBin::with('unit')->where('status', 'penuh')->latest()->take(5)->get(),
            'trenPengangkutan' => TrashHistory::selectRaw('DATE(tanggal) as date, COUNT(*) as count')
                ->whereDate('tanggal', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ]);
    }

    private function adminUnitDashboard(User $user): \Inertia\Response
    {
        $pendingComplaints = $this->unitComplaintQuery($user->unit_id)
            ->where('status', 'menunggu');

        return Inertia::render('Dashboard/AdminUnit', [
            'totalUnits' => Unit::where('id', $user->unit_id)->count(),
            'totalTrashBins' => TrashBin::where('unit_id', $user->unit_id)->count(),
            'totalUsers' => User::where('unit_id', $user->unit_id)->count(),
            'totalPenuh' => TrashBin::where('unit_id', $user->unit_id)->where('status', 'penuh')->count(),
            'totalDiangkutHariIni' => TrashHistory::whereHas('trashBin', fn($q) => $q->where('unit_id', $user->unit_id))
                ->whereDate('tanggal', today())->count(),
            'totalAduanPending' => (clone $pendingComplaints)->count(),
            'tongPerUnit' => Unit::where('id', $user->unit_id)
                ->withCount(['trashBins', 'trashBins as penuh_count' => fn($q) => $q->where('status', 'penuh')])
                ->get()
                ->map(fn($u) => [
                    'nama' => $u->nama,
                    'total' => $u->trash_bins_count,
                    'penuh' => $u->penuh_count,
                ]),
            'aktivitasTerbaru' => Activity::whereHas('user', fn($q) => $q->where('unit_id', $user->unit_id))
                ->with('user')->latest()->take(10)->get(),
            'aduanTerbaru' => $pendingComplaints
                ->with('user', 'trashBin')
                ->latest()->take(5)->get(),
            'tongPenuh' => TrashBin::with('unit')
                ->where('unit_id', $user->unit_id)
                ->where('status', 'penuh')
                ->latest()->take(5)->get(),
            'trenPengangkutan' => TrashHistory::selectRaw('DATE(tanggal) as date, COUNT(*) as count')
                ->whereHas('trashBin', fn($q) => $q->where('unit_id', $user->unit_id))
                ->whereDate('tanggal', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ]);
    }

    private function unitComplaintQuery(int $unitId)
    {
        return Complaint::query()
            ->where(function ($query) use ($unitId) {
                $query->whereHas('trashBin', fn ($trashBin) => $trashBin->where('unit_id', $unitId))
                    ->orWhere(function ($fallback) use ($unitId) {
                        $fallback->whereNull('trash_bin_id')
                            ->whereHas('user', fn ($reporter) => $reporter->where('unit_id', $unitId));
                    });
            });
    }

    private function petugasDashboard(User $user): \Inertia\Response
    {
        return Inertia::render('Dashboard/Petugas', [
            'tongPenuh' => TrashBin::with('unit')
                ->whereIn('status', ['penuh', 'setengah_penuh'])
                ->orderByRaw("CASE WHEN status = 'penuh' THEN 0 ELSE 1 END")
                ->take(10)
                ->get(),
            'riwayatHariIni' => TrashHistory::with('trashBin.unit')
                ->where('user_id', $user->id)
                ->whereDate('tanggal', today())
                ->latest()
                ->get(),
            'totalDiangkutHariIni' => TrashHistory::where('user_id', $user->id)
                ->whereDate('tanggal', today())
                ->count(),
            'jadwalHariIni' => [],
        ]);
    }

    private function siswaDashboard(User $user): \Inertia\Response
    {
        $tongSekitar = TrashBin::with('unit')
            ->when($user->unit_id !== null, fn ($q) => $q->where('unit_id', $user->unit_id))
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Dashboard/Siswa', [
            'tongSekitar' => $tongSekitar,
            'aduanSaya' => Complaint::where('user_id', $user->id)->latest()->take(5)->get(),
            'totalAduanSaya' => Complaint::where('user_id', $user->id)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray(),
            'edukasiList' => [],
        ]);
    }
}
