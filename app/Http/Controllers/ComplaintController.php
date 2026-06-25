<?php

namespace App\Http\Controllers;

use App\Models\{Complaint, TrashBin, Activity};
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $query = Complaint::with('user', 'trashBin.unit', 'ditanggapiOleh')->latest();

        $user = $request->user();

        if ($user->isScopedToUnit()) {
            $query->where(function ($q) use ($user) {
                $q->whereHas('trashBin', fn ($trashBin) => $trashBin->where('unit_id', $user->unit_id))
                    ->orWhere(function ($fallback) use ($user) {
                        $fallback->whereNull('trash_bin_id')
                            ->whereHas('user', fn ($reporter) => $reporter->where('unit_id', $user->unit_id));
                    });
            });
        }

        if ($user->isSiswa()) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status') && in_array($request->status, ['menunggu', 'diproses', 'selesai'])) {
            $query->where('status', $request->status);
        }

        $trashBins = TrashBin::query()
            ->when($this->mustStayInOwnUnit($user), fn ($q) => $q->where('unit_id', $user->unit_id))
            ->whereIn('status', ['penuh', 'setengah_penuh'])
            ->get();

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
            'deskripsi' => 'required|string|max:3000',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if (! empty($validated['trash_bin_id']) && $this->mustStayInOwnUnit($request->user())) {
            $belongsToUnit = TrashBin::where('id', $validated['trash_bin_id'])
                ->where('unit_id', $request->user()->unit_id)
                ->exists();

            if (! $belongsToUnit) {
                abort(403, 'Tong aduan berada di luar unit Anda.');
            }
        }

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

    public function show(Request $request, Complaint $complaint)
    {
        $this->authorizeComplaintAccess($request, $complaint);

        return Inertia::render('Complaints/Show', [
            'complaint' => $complaint->load('user', 'trashBin.unit', 'ditanggapiOleh'),
        ]);
    }

    public function tanggapi(Request $request, Complaint $complaint)
    {
        $this->authorizeComplaintAccess($request, $complaint, write: true);

        $validated = $request->validate([
            'status' => 'required|in:diproses,selesai',
            'tanggapan' => 'required|string|max:3000',
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

    public function destroy(Request $request, Complaint $complaint)
    {
        $this->authorizeComplaintAccess($request, $complaint, write: true);

        $judul = $complaint->judul;

        $complaint->delete();

        Activity::create([
            'user_id' => request()->user()->id,
            'tipe' => 'aduan',
            'deskripsi' => 'Menghapus aduan: ' . $judul,
        ]);

        return redirect()->back()->with('success', 'Aduan berhasil dihapus.');
    }

    private function authorizeComplaintAccess(Request $request, Complaint $complaint, bool $write = false): void
    {
        $user = $request->user();
        $complaint->loadMissing('trashBin', 'user');

        if (! $user) {
            abort(403);
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        if (! $write && $user->isKepalaPusat()) {
            return;
        }

        if ($user->isScopedToUnit()) {
            $belongsToUsersUnit = $complaint->trashBin?->unit_id === $user->unit_id
                || ($complaint->trash_bin_id === null && $complaint->user?->unit_id === $user->unit_id);

            if ($belongsToUsersUnit) {
                if ($write && ! $user->isAdminUnit()) {
                    abort(403, 'Akun Kepala hanya memiliki akses lihat (read-only).');
                }

                return;
            }

            abort(403, 'Aduan ini berada di luar unit Anda.');
        }

        if (! $write && $user->isSiswa() && $complaint->user_id === $user->id) {
            return;
        }

        abort(403);
    }

    private function mustStayInOwnUnit($user): bool
    {
        // unit_id null (mis. unit dihapus -> set null) tetap dianggap terikat unit,
        // sehingga discope ke whereNull dan tidak bocor ke unit lain.
        return $user->isScopedToUnit() || $user->isSiswa();
    }
}
