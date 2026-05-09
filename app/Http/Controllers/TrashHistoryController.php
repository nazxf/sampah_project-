<?php

namespace App\Http\Controllers;

use App\Models\{TrashHistory, TrashBin, Activity};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TrashHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = TrashHistory::with('trashBin.unit', 'user')->latest('tanggal');

        if ($request->filled('trash_bin_id')) {
            $query->where('trash_bin_id', $request->trash_bin_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('tanggal', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('tanggal', '<=', $request->end_date);
        }

        $histories = $query->paginate(15)->appends($request->only([
            'trash_bin_id', 'start_date', 'end_date',
        ]));

        $trashBins = TrashBin::whereIn('status', ['penuh', 'setengah_penuh'])->get();

        return Inertia::render('TrashHistories/Index', [
            'histories' => $histories,
            'trashBins' => $trashBins,
            'filters' => $request->only(['trash_bin_id', 'start_date', 'end_date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'trash_bin_id' => 'required|exists:trash_bins,id',
            'status_sebelum' => 'required|string',
            'status_sesudah' => 'required|string',
            'tanggal' => 'required|date',
            'catatan' => 'nullable|string',
            'foto' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('trash-histories', 'public');
        }

        $validated['user_id'] = $request->user()->id;

        $history = TrashHistory::create($validated);

        $trashBin = TrashBin::findOrFail($validated['trash_bin_id']);
        $trashBin->update([
            'status' => $validated['status_sesudah'],
            'terakhir_diangkut' => now(),
            'terakhir_diangkut_oleh' => $request->user()->id,
        ]);

        Activity::create([
            'user_id' => $request->user()->id,
            'tipe' => 'pengangkutan',
            'deskripsi' => 'Mencatat riwayat pengangkutan pada tong sampah ' . $trashBin->kode,
        ]);

        return redirect()->back()->with('success', 'Riwayat pengangkutan berhasil dicatat.');
    }

    public function show(TrashHistory $history)
    {
        return Inertia::render('TrashHistories/Show', [
            'history' => $history->load('trashBin.unit', 'user'),
        ]);
    }

    public function destroy(TrashHistory $history)
    {
        $history->delete();

        Activity::create([
            'user_id' => auth()->id(),
            'tipe' => 'hapus',
            'deskripsi' => 'Menghapus riwayat pengangkutan',
        ]);

        return redirect()->back()->with('success', 'Riwayat pengangkutan berhasil dihapus.');
    }
}
