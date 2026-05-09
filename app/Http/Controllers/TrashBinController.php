<?php

namespace App\Http\Controllers;

use App\Models\{TrashBin, Unit, Activity};
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TrashBinController extends Controller
{
    public function index(Request $request)
    {
        $query = TrashBin::with('unit')
            ->when($request->unit_id, fn ($q) => $q->where('unit_id', $request->unit_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->jenis_sampah, fn ($q) => $q->where('jenis_sampah', $request->jenis_sampah))
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('kode', 'like', "%{$request->search}%")
                    ->orWhere('nama', 'like', "%{$request->search}%")
                    ->orWhere('lokasi', 'like', "%{$request->search}%");
            }));

        return Inertia::render('TrashBins/Index', [
            'trashBins' => $query->orderBy('nama')->paginate(12),
            'filters' => $request->only(['unit_id', 'status', 'jenis_sampah', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:255|unique:trash_bins,kode',
            'nama' => 'required|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'lokasi' => 'required|string|max:255',
            'jenis_sampah' => 'required|string|max:255',
        ]);

        $trashBin = TrashBin::create($validated);

        $this->logActivity('trash_bin', 'Menambahkan tempat sampah ' . $trashBin->nama);

        return redirect()->back()->with('success', 'Tempat sampah berhasil ditambahkan');
    }

    public function update(Request $request, TrashBin $trashBin)
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:255', Rule::unique('trash_bins', 'kode')->ignore($trashBin->id)],
            'nama' => 'required|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'lokasi' => 'required|string|max:255',
            'jenis_sampah' => 'required|string|max:255',
        ]);

        $trashBin->update($validated);

        $this->logActivity('trash_bin', 'Memperbarui tempat sampah ' . $trashBin->nama);

        return redirect()->back()->with('success', 'Tempat sampah berhasil diperbarui');
    }

    public function destroy(TrashBin $trashBin)
    {
        $this->logActivity('trash_bin', 'Menghapus tempat sampah ' . $trashBin->nama);

        $trashBin->delete();

        return redirect()->back()->with('success', 'Tempat sampah berhasil dihapus');
    }

    public function updateStatus(Request $request, TrashBin $trashBin)
    {
        $validated = $request->validate([
            'status' => 'required|in:kosong,setengah_penuh,penuh',
        ]);

        $trashBin->update(['status' => $validated['status']]);

        $this->logActivity('trash_bin', 'Memperbarui status tempat sampah ' . $trashBin->nama . ' menjadi ' . $validated['status']);

        return redirect()->back()->with('success', 'Status tempat sampah berhasil diperbarui');
    }

    public function monitor()
    {
        $units = Unit::with('trashBins')->orderBy('nama')->get();

        return Inertia::render('TrashBins/Monitor', [
            'units' => $units,
        ]);
    }

    private function logActivity(string $tipe, string $deskripsi, array $data = []): void
    {
        Activity::create([
            'user_id' => auth()->id(),
            'tipe' => $tipe,
            'deskripsi' => $deskripsi,
            'data' => $data,
        ]);
    }
}
