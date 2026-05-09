import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import { usePage, router, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const statusCardStyles = {
    kosong: 'bg-green-50 border-green-300',
    setengah_penuh: 'bg-yellow-50 border-yellow-300',
    penuh: 'bg-red-50 border-red-300',
    sudah_diangkut: 'bg-blue-50 border-blue-300',
};

const statusBgStyles = {
    kosong: 'bg-green-500',
    setengah_penuh: 'bg-yellow-500',
    penuh: 'bg-red-500',
    sudah_diangkut: 'bg-blue-500',
};

const statusLabel = {
    kosong: 'Kosong',
    setengah_penuh: 'Setengah Penuh',
    penuh: 'Penuh',
    sudah_diangkut: 'Sudah Diangkut',
};

export default function Monitor({ units }) {
    const { props: pageProps } = usePage();
    const role = pageProps.auth.user?.role || 'siswa';
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [unitFilter, setUnitFilter] = useState('');

    const filteredUnits = useMemo(() => {
        if (!units) return [];

        return units
            .map((unit) => {
                const filteredBins = (unit.trash_bins || []).filter((bin) => {
                    const matchSearch =
                        !search ||
                        (bin.kode && bin.kode.toLowerCase().includes(search.toLowerCase())) ||
                        (bin.nama && bin.nama.toLowerCase().includes(search.toLowerCase())) ||
                        (bin.lokasi && bin.lokasi.toLowerCase().includes(search.toLowerCase()));

                    const matchStatus = !statusFilter || bin.status === statusFilter;

                    return matchSearch && matchStatus;
                });

                return { ...unit, filteredBins };
            })
            .filter((unit) => {
                const matchUnit = !unitFilter || unit.id.toString() === unitFilter;
                return matchUnit && unit.filteredBins.length > 0;
            });
    }, [units, search, statusFilter, unitFilter]);

    const handleAngkut = (bin) => {
        router.get(route('petugas.pengangkutan.index'), { trash_bin_id: bin.id });
    };

    const handleAdukan = (bin) => {
        router.get(route('siswa.aduan.index'), { trash_bin_id: bin.id });
    };

    const handleEdit = (bin) => {
        router.get(route('admin.trash-bins.index'));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch {
            return dateStr;
        }
    };

    return (
        <AppLayout header="Monitoring Tong Sampah">
            <div className="space-y-4">
                {/* Search and Filter Bar */}
                <div className="rounded-xl bg-white border border-[#e5e7eb] p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                            <label className="block text-xs font-medium text-[#6b7280] mb-1">Cari Tong</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Kode, nama, atau lokasi..."
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#6b7280] mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            >
                                <option value="">Semua Status</option>
                                <option value="kosong">Kosong</option>
                                <option value="setengah_penuh">Setengah Penuh</option>
                                <option value="penuh">Penuh</option>
                                <option value="sudah_diangkut">Sudah Diangkut</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#6b7280] mb-1">Unit</label>
                            <select
                                value={unitFilter}
                                onChange={(e) => setUnitFilter(e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            >
                                <option value="">Semua Unit</option>
                                {units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.nama}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Unit Groups */}
                {filteredUnits.length > 0 ? (
                    <div className="space-y-6">
                        {filteredUnits.map((unit) => (
                            <div key={unit.id} className="rounded-xl bg-white border border-[#e5e7eb] overflow-hidden">
                                {/* Unit Header */}
                                <div className="flex items-center gap-3 border-b border-[#e5e7eb] bg-[#f9fafb] px-5 py-3.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-5.25 0v15m3-12h.75M16.5 15.75h.75" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#111827]">{unit.nama}</h2>
                                        <p className="text-xs text-[#9ca3af]">
                                            {unit.filteredBins.length} tong sampah
                                            {unit.alamat ? ` - ${unit.alamat}` : ''}
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 text-xs text-[#6b7280]">
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-red-400" /> {unit.filteredBins.filter((b) => b.status === 'penuh').length}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-yellow-400" /> {unit.filteredBins.filter((b) => b.status === 'setengah_penuh').length}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-green-400" /> {unit.filteredBins.filter((b) => b.status === 'kosong').length}
                                        </span>
                                    </div>
                                </div>

                                {/* Bin Cards Grid */}
                                <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {unit.filteredBins.map((bin) => (
                                        <div
                                            key={bin.id}
                                            className={`rounded-xl border-2 p-4 transition hover:shadow-md ${statusCardStyles[bin.status] || 'bg-gray-50 border-gray-300'}`}
                                        >
                                            {/* Status Indicator Bar */}
                                            <div className={`mb-3 h-1.5 w-full rounded-full ${statusBgStyles[bin.status] || 'bg-gray-500'}`} />

                                            <div className="space-y-2.5">
                                                {/* Header: Kode + Nama */}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-medium text-[#6b7280]">{bin.kode}</span>
                                                        <StatusBadge status={bin.status} type="trash" />
                                                    </div>
                                                    <h3 className="mt-0.5 text-sm font-semibold text-[#111827]">{bin.nama}</h3>
                                                </div>

                                                {/* Info */}
                                                <div className="space-y-1 text-xs text-[#6b7280]">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                                        </svg>
                                                        <span className="truncate">{bin.lokasi || '-'}</span>
                                                    </div>
                                                    {bin.jenis_sampah && (
                                                        <div className="flex items-center gap-1.5">
                                                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                                            </svg>
                                                            <span className="capitalize">{bin.jenis_sampah}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                        </svg>
                                                        <span>
                                                            {bin.terakhir_diangkut ? `Terakhir diangkut: ${formatDate(bin.terakhir_diangkut)}` : 'Belum pernah diangkut'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                                    {role === 'petugas' && (bin.status === 'penuh' || bin.status === 'setengah_penuh') && (
                                                        <button
                                                            onClick={() => handleAngkut(bin)}
                                                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#16a34a] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#15803d]"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                            </svg>
                                                            Angkut
                                                        </button>
                                                    )}
                                                    {role === 'siswa' && bin.status === 'penuh' && (
                                                        <button
                                                            onClick={() => handleAdukan(bin)}
                                                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#dc2626] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#b91c1c]"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                                            </svg>
                                                            Adukan
                                                        </button>
                                                    )}
                                                    {(role === 'super_admin' || role === 'admin_unit') && (
                                                        <button
                                                            onClick={() => handleEdit(bin)}
                                                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition hover:bg-[#f3f4f6]"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl bg-white border border-[#e5e7eb]">
                        <EmptyState
                            icon={
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Zm0 0V3m0 0a9 9 0 0 1 9 9m-9-9a9 9 0 0 0-9 9" />
                                </svg>
                            }
                            title="Tidak ada tong sampah"
                            description={search || statusFilter || unitFilter ? 'Coba ubah filter pencarian' : 'Belum ada data tong sampah yang tersedia'}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
