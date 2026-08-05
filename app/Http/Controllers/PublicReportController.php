<?php

namespace App\Http\Controllers;

use App\Models\{Activity, PublicReport, SipesaNotification, TrashBin};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PublicReportController extends Controller
{
    public function create(TrashBin $trashBin)
    {
        return Inertia::render('PublicReports/Create', [
            'trashBin' => $trashBin->load('unit'),
            'jenisMasalahLabels' => PublicReport::getJenisMasalahLabels(),
            'statusOptions' => [
                ['value' => 'penuh', 'label' => 'Penuh'],
                ['value' => 'setengah_penuh', 'label' => 'Setengah penuh'],
                ['value' => 'kosong', 'label' => 'Belum penuh / kosong'],
            ],
        ]);
    }

    public function store(Request $request, TrashBin $trashBin)
    {
        $validated = $request->validate([
            'status_tong' => ['required', Rule::in(['kosong', 'setengah_penuh', 'penuh'])],
            'jenis_masalah' => ['nullable', Rule::in(array_keys(PublicReport::getJenisMasalahLabels()))],
            'nama_pelapor' => ['nullable', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string', 'max:300'],
        ]);

        $statusTong = $validated['status_tong'];
        $jenisMasalah = $statusTong === 'penuh'
            ? 'penuh'
            : ($validated['jenis_masalah'] ?: 'lainnya');

        $ipAddress = $request->ip() ?: '0.0.0.0';
        $duplicate = $jenisMasalah === 'penuh'
            ? PublicReport::findDuplicate($ipAddress, $trashBin->id, $jenisMasalah)
            : null;

        if ($duplicate) {
            return redirect()
                ->route('public-reports.create', ['trashBin' => $trashBin->kode])
                ->with('success', 'Laporan serupa sudah diterima. Nomor tiket: ' . $duplicate->nomor_tiket);
        }

        $report = DB::transaction(function () use ($request, $trashBin, $validated, $statusTong, $jenisMasalah, $ipAddress) {
            $description = trim((string) ($validated['deskripsi'] ?? ''));
            $statusLabel = match ($statusTong) {
                'penuh' => 'Penuh',
                'setengah_penuh' => 'Setengah penuh',
                default => 'Belum penuh / kosong',
            };

            $report = PublicReport::create([
                'nomor_tiket' => PublicReport::generateNomorTiket(),
                'trash_bin_id' => $trashBin->id,
                'jenis_masalah' => $jenisMasalah,
                'nama_pelapor' => $validated['nama_pelapor'] ?? null,
                'deskripsi' => trim("Kondisi tong: {$statusLabel}. {$description}"),
                'status' => 'menunggu',
                'ip_address' => $ipAddress,
                'user_agent' => (string) $request->userAgent(),
            ]);

            $trashBin->update(['status' => $statusTong]);

            Activity::create([
                'user_id' => null,
                'tipe' => 'laporan_warga',
                'deskripsi' => 'Laporan QR ' . $report->nomor_tiket . ' untuk tong ' . $trashBin->kode,
                'data' => [
                    'trash_bin_id' => $trashBin->id,
                    'public_report_id' => $report->id,
                    'status_tong' => $statusTong,
                ],
            ]);

            SipesaNotification::create([
                'judul' => 'Laporan warga baru',
                'pesan' => 'Tong ' . $trashBin->kode . ' dilaporkan ' . strtolower($statusLabel) . ' melalui QR.',
                'tipe' => 'laporan_baru',
                'trash_bin_id' => $trashBin->id,
                'public_report_id' => $report->id,
                'action_url' => route('admin.trash-bins.index', ['search' => $trashBin->kode]),
            ]);

            return $report;
        });

        return redirect()
            ->route('public-reports.create', ['trashBin' => $trashBin->kode])
            ->with('success', 'Laporan berhasil dikirim. Nomor tiket: ' . $report->nomor_tiket);
    }
}
