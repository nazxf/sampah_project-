<?php

namespace App\Http\Controllers;

use App\Models\{Report, Activity, TrashHistory, Complaint};
use Illuminate\Http\Request;
use Illuminate\Contracts\View\View;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with('user', 'unit')->latest();

        if ($request->filled('tipe') && in_array($request->tipe, ['harian', 'mingguan', 'bulanan'])) {
            $query->where('tipe', $request->tipe);
        }

        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        $reports = $query->paginate(15)->appends($request->only(['tipe', 'unit_id']));

        return Inertia::render('Reports/Index', [
            'reports' => $reports,
            'filters' => $request->only(['tipe', 'unit_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'tipe' => 'required|string',
            'unit_id' => 'nullable|exists:units,id',
            'periode_mulai' => 'required|date',
            'periode_selesai' => 'required|date|after_or_equal:periode_mulai',
            'isi' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $periodeMulai = $validated['periode_mulai'];
        $periodeSelesai = $validated['periode_selesai'];

        $validated['total_tong_penuh'] = TrashHistory::whereBetween('tanggal', [$periodeMulai, $periodeSelesai])
            ->where('status_sebelum', 'penuh')
            ->count();

        $validated['total_pengangkutan'] = TrashHistory::whereBetween('tanggal', [$periodeMulai, $periodeSelesai])
            ->count();

        $validated['total_aduan'] = Complaint::whereBetween('created_at', [$periodeMulai, $periodeSelesai])
            ->count();

        $report = Report::create($validated);

        Activity::create([
            'user_id' => $request->user()->id,
            'tipe' => 'laporan',
            'deskripsi' => 'Membuat laporan: ' . $report->judul,
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil dibuat.');
    }

    public function show(Report $report)
    {
        return Inertia::render('Reports/Show', [
            'report' => $report->load('user', 'unit'),
        ]);
    }

    public function update(Request $request, Report $report)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'tipe' => 'required|string',
            'unit_id' => 'nullable|exists:units,id',
            'periode_mulai' => 'required|date',
            'periode_selesai' => 'required|date|after_or_equal:periode_mulai',
            'isi' => 'nullable|string',
        ]);

        $report->update($validated);

        Activity::create([
            'user_id' => $request->user()->id,
            'tipe' => 'laporan',
            'deskripsi' => 'Memperbarui laporan: ' . $report->judul,
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil diperbarui.');
    }

    public function destroy(Report $report)
    {
        $judul = $report->judul;

        $report->delete();

        Activity::create([
            'user_id' => request()->user()->id,
            'tipe' => 'laporan',
            'deskripsi' => 'Menghapus laporan: ' . $judul,
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil dihapus.');
    }

    public function exportPdf(Report $report)
    {
        $report->load('user', 'unit');

        $pdf = Pdf::loadView('reports.pdf', [
            'report' => $report,
        ]);

        return $pdf->download('laporan-' . $report->id . '.pdf');
    }

    public function exportExcel(Report $report)
    {
        $report->load('user', 'unit');

        return Excel::download(
            new class($report) implements FromView
            {
                public function __construct(protected Report $report) {}

                public function view(): View
                {
                    return view('reports.excel', ['report' => $this->report]);
                }
            },
            'laporan-' . $report->id . '.xlsx'
        );
    }
}
