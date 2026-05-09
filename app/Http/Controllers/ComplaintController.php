<?php

namespace App\Http\Controllers;

use App\Models\{Complaint, TrashBin, Activity};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $query = Complaint::with('user', 'trashBin.unit', 'ditanggapiOleh')->latest();

        $user = $request->user();

        if ($user->isAdminUnit()) {
            $query->whereHas('trashBin.unit', function ($q) use ($user) {
                $q->where('id', $user->unit_id);
            });
        }

        if ($user->isSiswa()) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status') && in_array($request->status, ['menunggu', 'diproses', 'selesai'])) {
            $query->where('status', $request->status);
        }

        $trashBins = TrashBin::whereIn('status', ['penuh', 'setengah_penuh'])->get();

        $complaints = $query->paginate(15)->appends($request->only(['status']));

        return Inertia::render('Complaints/Index', [
            'complaints' => $complaints,
            'filters' => $request->only(['status']),
            'trashBins' => $trashBins,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'trash_bin_id' => 'nullable|exists:trash_bins,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'foto' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('complaints', 'public');
        }

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'menunggu';

        $complaint = Complaint::create($validated);

        Activity::create([
            'user_id' => $request->user()->id,
            'tipe' => 'aduan',
            'deskripsi' => 'Membuat aduan: ' . $complaint->judul,
        ]);

        return redirect()->back()->with('success', 'Aduan berhasil dikirim.');
    }

    public function show(Complaint $complaint)
    {
        return Inertia::render('Complaints/Show', [
            'complaint' => $complaint->load('user', 'trashBin.unit', 'ditanggapiOleh'),
        ]);
    }

    public function tanggapi(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'status' => 'required|in:diproses,selesai',
            'tanggapan' => 'required|string',
        ]);

        $complaint->update([
            'status' => $validated['status'],
            'tanggapan' => $validated['tanggapan'],
            'ditanggapi_oleh' => $request->user()->id,
            'ditanggapi_pada' => now(),
        ]);

        Activity::create([
            'user_id' => $request->user()->id,
            'tipe' => 'aduan',
            'deskripsi' => 'Menanggapi aduan: ' . $complaint->judul,
        ]);

        return redirect()->back()->with('success', 'Aduan berhasil ditanggapi.');
    }

    public function destroy(Complaint $complaint)
    {
        $judul = $complaint->judul;

        $complaint->delete();

        Activity::create([
            'user_id' => request()->user()->id,
            'tipe' => 'aduan',
            'deskripsi' => 'Menghapus aduan: ' . $judul,
        ]);

        return redirect()->back()->with('success', 'Aduan berhasil dihapus.');
    }
}
