<?php

namespace App\Http\Controllers;

use App\Models\{TrashHistory, TrashBin, Activity};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TrashHistoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = TrashHistory::with('trashBin.unit', 'user')->latest('tanggal');

        if ($this->mustStayInOwnUnit($user)) {
            $query->whereHas('trashBin', function ($q) use ($user) {
                $q->where('unit_id', $user->unit_id);
            });
        }

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

        if ($this->mustStayInOwnUnit($user)) {
            $trashBins = TrashBin::where('unit_id', $user->unit_id)
                ->with('unit')
                ->whereIn('status', ['penuh', 'setengah_penuh'])
                ->orderByRaw("CASE WHEN status = 'penuh' THEN 0 ELSE 1 END")
                ->orderBy('nama')
                ->get();
        } else {
            $trashBins = TrashBin::with('unit')
                ->whereIn('status', ['penuh', 'setengah_penuh'])
                ->orderByRaw("CASE WHEN status = 'penuh' THEN 0 ELSE 1 END")
                ->orderBy('nama')
                ->get();
        }

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
            'status_sebelum' => ['nullable', Rule::in(['kosong', 'setengah_penuh', 'penuh', 'sudah_diangkut'])],
            'status_sesudah' => ['required', Rule::in(['kosong', 'setengah_penuh', 'penuh', 'sudah_diangkut'])],
            'tanggal' => 'required|date',
            'catatan' => 'nullable|string|max:1000',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'latitude_konfirmasi' => 'nullable|numeric|between:-90,90',
            'longitude_konfirmasi' => 'nullable|numeric|between:-180,180',
        ]);

        $trashBin = TrashBin::with('unit')->findOrFail($validated['trash_bin_id']);

        if ($this->mustStayInOwnUnit($request->user()) && $trashBin->unit_id !== $request->user()->unit_id) {
            abort(403, 'Anda tidak memiliki akses untuk mencatat pengangkutan tong ini.');
        }

        $confirmationDistance = $this->validatePetugasConfirmationLocation($request, $validated, $trashBin);

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('trash-histories', 'public');
        }

        $validated['user_id'] = $request->user()->id;
        $validated['status_sebelum'] = $trashBin->status;
        $validated['jarak_konfirmasi_meter'] = $confirmationDistance;

        $history = TrashHistory::create($validated);

        $trashBin->update([
            'status' => $validated['status_sesudah'],
            'terakhir_diangkut' => now(),
            'terakhir_diangkut_oleh' => $request->user()->id,
        ]);

        Activity::create([
            'user_id' => $request->user()->id,
            'tipe' => 'pengangkutan',
            'deskripsi' => 'Mencatat riwayat pengangkutan pada tong sampah ' . $trashBin->kode,
            'data' => [
                'trash_history_id' => $history->id,
                'trash_bin_id' => $trashBin->id,
                'latitude_konfirmasi' => $validated['latitude_konfirmasi'] ?? null,
                'longitude_konfirmasi' => $validated['longitude_konfirmasi'] ?? null,
                'jarak_konfirmasi_meter' => $confirmationDistance,
            ],
        ]);

        return redirect()->back()->with('success', 'Riwayat pengangkutan berhasil dicatat.');
    }

    private function validatePetugasConfirmationLocation(Request $request, array $validated, TrashBin $trashBin): ?float
    {
        if (! $request->user()->isPetugas()) {
            return null;
        }

        if ($trashBin->latitude === null || $trashBin->longitude === null) {
            return null;
        }

        if (! isset($validated['latitude_konfirmasi'], $validated['longitude_konfirmasi'])) {
            Validator::make([], [])->after(function ($validator) {
                $validator->errors()->add('latitude_konfirmasi', 'Lokasi petugas wajib aktif untuk konfirmasi tong yang memiliki titik koordinat.');
                $validator->errors()->add('longitude_konfirmasi', 'Lokasi petugas wajib aktif untuk konfirmasi tong yang memiliki titik koordinat.');
            })->validate();
        }

        $distance = $this->distanceMeters(
            (float) $validated['latitude_konfirmasi'],
            (float) $validated['longitude_konfirmasi'],
            (float) $trashBin->latitude,
            (float) $trashBin->longitude,
        );
        $radius = (float) config('sipesa.petugas.confirm_radius_meters', 50);

        if ($distance > $radius) {
            Validator::make([], [])->after(function ($validator) use ($distance, $radius) {
                $validator->errors()->add(
                    'latitude_konfirmasi',
                    'Lokasi petugas terlalu jauh dari tong. Jarak saat ini '
                    . number_format($distance, 1)
                    . ' meter, maksimal '
                    . number_format($radius, 0)
                    . ' meter.'
                );
            })->validate();
        }

        return round($distance, 2);
    }

    private function distanceMeters(float $fromLat, float $fromLng, float $toLat, float $toLng): float
    {
        $earthRadiusMeters = 6371000;
        $latDelta = deg2rad($toLat - $fromLat);
        $lngDelta = deg2rad($toLng - $fromLng);
        $fromLatRad = deg2rad($fromLat);
        $toLatRad = deg2rad($toLat);

        $a = sin($latDelta / 2) ** 2
            + cos($fromLatRad) * cos($toLatRad) * sin($lngDelta / 2) ** 2;

        return $earthRadiusMeters * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    public function show(Request $request, TrashHistory $trashHistory)
    {
        $this->authorizeHistoryAccess($request, $trashHistory);

        return Inertia::render('TrashHistories/Show', [
            'history' => $trashHistory->load('trashBin.unit', 'user'),
        ]);
    }

    public function destroy(TrashHistory $trashHistory)
    {
        $user = auth()->user();

        if (! $user?->isSuperAdmin()) {
            abort(403, 'Hanya super admin yang dapat menghapus riwayat pengangkutan.');
        }

        $trashHistory->delete();

        Activity::create([
            'user_id' => auth()->id(),
            'tipe' => 'hapus',
            'deskripsi' => 'Menghapus riwayat pengangkutan',
        ]);

        return redirect()->back()->with('success', 'Riwayat pengangkutan berhasil dihapus.');
    }

    private function authorizeHistoryAccess(Request $request, TrashHistory $trashHistory): void
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        $trashHistory->loadMissing('trashBin');

        if ($this->mustStayInOwnUnit($user) && $trashHistory->trashBin?->unit_id === $user->unit_id) {
            return;
        }

        abort(403, 'Anda tidak memiliki akses ke riwayat pengangkutan ini.');
    }

    private function mustStayInOwnUnit($user): bool
    {
        // unit_id null (unit dihapus -> set null) tetap discope, bukan akses global.
        return $user->isScopedToUnit() || $user->isPetugas();
    }
}
