import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import { usePage, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';

const jenisSampahOptions = ['organik', 'anorganik', 'b3'];
const statusDotColors = {
    kosong: 'bg-green-400',
    setengah_penuh: 'bg-yellow-400',
    penuh: 'bg-red-400',
    sudah_diangkut: 'bg-blue-400',
};

export default function Index({ trashBins, filters, units }) {
    const { props: pageProps } = usePage();
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [localFilters, setLocalFilters] = useState({
        search: filters?.search || '',
        unit_id: filters?.unit_id || '',
        status: filters?.status || '',
        jenis_sampah: filters?.jenis_sampah || '',
    });

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        nama: '',
        unit_id: '',
        lokasi: '',
        jenis_sampah: 'organik',
        keterangan: '',
    });

    const applyFilters = useCallback(
        (newFilters) => {
            const merged = { ...localFilters, ...newFilters };
            setLocalFilters(merged);
            const params = new URLSearchParams();
            if (merged.search) params.set('search', merged.search);
            if (merged.unit_id) params.set('unit_id', merged.unit_id);
            if (merged.status) params.set('status', merged.status);
            if (merged.jenis_sampah) params.set('jenis_sampah', merged.jenis_sampah);
            router.get(route('admin.trash-bins.index'), Object.fromEntries(params), {
                preserveState: true,
            });
        },
        [localFilters],
    );

    const openCreate = () => {
        reset();
        clearErrors();
        setEditItem(null);
        setModalOpen(true);
    };

    const openEdit = (item) => {
        clearErrors();
        setEditItem(item);
        setData({
            kode: item.kode || '',
            nama: item.nama || '',
            unit_id: item.unit_id || '',
            lokasi: item.lokasi || '',
            jenis_sampah: item.jenis_sampah || 'organik',
            keterangan: item.keterangan || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = editItem ? route('admin.trash-bins.update', editItem.id) : route('admin.trash-bins.store');
        const method = editItem ? put : post;
        method(url, {
            onSuccess: () => {
                setModalOpen(false);
                reset();
            },
        });
    };

    const confirmDelete = (id) => {
        Swal.fire({
            title: 'Hapus Tong Sampah?',
            text: 'Data tong sampah beserta riwayatnya akan dihapus. Tindakan ini tidak dapat dibatalkan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.trash-bins.destroy', id));
            }
        });
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditItem(null);
    };

    const binList = trashBins?.data || [];

    return (
        <AppLayout header="Data Tong Sampah">
            <div className="space-y-4">
                {/* Filter Bar */}
                <div className="rounded-xl bg-white border border-[#e5e7eb] p-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="block text-xs font-medium text-[#6b7280] mb-1">Cari</label>
                            <input
                                type="text"
                                value={localFilters.search}
                                onChange={(e) => applyFilters({ search: e.target.value })}
                                placeholder="Kode atau nama tong..."
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#6b7280] mb-1">Unit</label>
                            <select
                                value={localFilters.unit_id}
                                onChange={(e) => applyFilters({ unit_id: e.target.value })}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            >
                                <option value="">Semua Unit</option>
                                {units?.map((u) => (
                                    <option key={u.id} value={u.id}>{u.nama}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#6b7280] mb-1">Status</label>
                            <select
                                value={localFilters.status}
                                onChange={(e) => applyFilters({ status: e.target.value })}
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
                            <label className="block text-xs font-medium text-[#6b7280] mb-1">Jenis Sampah</label>
                            <select
                                value={localFilters.jenis_sampah}
                                onChange={(e) => applyFilters({ jenis_sampah: e.target.value })}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            >
                                <option value="">Semua Jenis</option>
                                <option value="organik">Organik</option>
                                <option value="anorganik">Anorganik</option>
                                <option value="b3">B3</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-xl bg-white border border-[#e5e7eb]">
                    <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
                        <div>
                            <h2 className="text-sm font-semibold text-[#111827]">Daftar tong sampah</h2>
                            <p className="mt-0.5 text-xs text-[#9ca3af]">Kelola data tong sampah di setiap unit</p>
                        </div>
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d]"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Tambah Tong
                        </button>
                    </div>

                    {binList.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs font-medium text-[#6b7280]">
                                            <th className="px-5 py-3">Kode</th>
                                            <th className="px-5 py-3">Nama</th>
                                            <th className="px-5 py-3">Unit</th>
                                            <th className="px-5 py-3">Jenis Sampah</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Lokasi</th>
                                            <th className="px-5 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f3f4f6]">
                                        {binList.map((bin) => (
                                            <tr key={bin.id} className="hover:bg-[#f9fafb] transition">
                                                <td className="px-5 py-3 font-mono text-xs font-medium text-[#111827]">{bin.kode}</td>
                                                <td className="px-5 py-3 font-medium text-[#111827]">{bin.nama}</td>
                                                <td className="px-5 py-3 text-[#6b7280]">{bin.unit?.nama || '-'}</td>
                                                <td className="px-5 py-3 text-[#6b7280] capitalize">{bin.jenis_sampah || '-'}</td>
                                                <td className="px-5 py-3">
                                                    <StatusBadge status={bin.status} type="trash" />
                                                </td>
                                                <td className="px-5 py-3 text-[#9ca3af] max-w-[150px] truncate">{bin.lokasi || '-'}</td>
                                                <td className="px-5 py-3 text-right space-x-2">
                                                    <button onClick={() => openEdit(bin)} className="text-xs font-medium text-[#16a34a] hover:text-[#15803d] transition">Edit</button>
                                                    <button onClick={() => confirmDelete(bin.id)} className="text-xs font-medium text-[#dc2626] hover:text-[#b91c1c] transition">Hapus</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="divide-y divide-[#f3f4f6] lg:hidden">
                                {binList.map((bin) => (
                                    <div key={bin.id} className="p-4 space-y-2.5">
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-medium text-[#111827]">{bin.kode}</span>
                                                    <StatusBadge status={bin.status} type="trash" />
                                                </div>
                                                <h3 className="mt-0.5 text-sm font-semibold text-[#111827]">{bin.nama}</h3>
                                                <p className="text-xs text-[#6b7280]">{bin.unit?.nama || '-'}</p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => openEdit(bin)} className="text-xs font-medium text-[#16a34a] hover:text-[#15803d] transition">Edit</button>
                                                <button onClick={() => confirmDelete(bin.id)} className="text-xs font-medium text-[#dc2626] hover:text-[#b91c1c] transition">Hapus</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-[#6b7280]">
                                            <span className={`inline-block h-2 w-2 rounded-full ${statusDotColors[bin.status] || 'bg-gray-400'}`} />
                                            <span>{bin.lokasi || 'Lokasi tidak tersedia'}</span>
                                            <span className="text-[#d1d5db]">|</span>
                                            <span className="capitalize">{bin.jenis_sampah || '-'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-[#e5e7eb] px-5 py-3">
                                <Pagination links={trashBins.links} meta={trashBins.meta} />
                            </div>
                        </>
                    ) : (
                        <EmptyState
                            icon={
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                                </svg>
                            }
                            title="Belum ada tong sampah"
                            description="Tambahkan data tong sampah untuk memulai pemantauan"
                        />
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Transition show={modalOpen}>
                <Dialog onClose={closeModal} className="relative z-50">
                    <Transition.Child
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                                <Dialog.Title className="text-base font-semibold text-[#111827] mb-1">
                                    {editItem ? 'Edit Tong Sampah' : 'Tambah Tong Sampah'}
                                </Dialog.Title>
                                <p className="text-xs text-[#9ca3af] mb-5">
                                    {editItem ? 'Perbarui informasi tong sampah' : 'Daftarkan tong sampah baru ke sistem'}
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-medium text-[#374151] mb-1">Kode</label>
                                            <input
                                                type="text"
                                                value={data.kode}
                                                onChange={(e) => setData('kode', e.target.value)}
                                                placeholder="TS-001"
                                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                            />
                                            {errors.kode && <p className="mt-1 text-xs text-[#dc2626]">{errors.kode}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[#374151] mb-1">Nama</label>
                                            <input
                                                type="text"
                                                value={data.nama}
                                                onChange={(e) => setData('nama', e.target.value)}
                                                placeholder="Nama tong sampah"
                                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                            />
                                            {errors.nama && <p className="mt-1 text-xs text-[#dc2626]">{errors.nama}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[#374151] mb-1">Unit</label>
                                        <select
                                            value={data.unit_id}
                                            onChange={(e) => setData('unit_id', e.target.value)}
                                            className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                        >
                                            <option value="">Pilih Unit</option>
                                            {units?.map((u) => (
                                                <option key={u.id} value={u.id}>{u.nama}</option>
                                            ))}
                                        </select>
                                        {errors.unit_id && <p className="mt-1 text-xs text-[#dc2626]">{errors.unit_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[#374151] mb-1">Lokasi</label>
                                        <input
                                            type="text"
                                            value={data.lokasi}
                                            onChange={(e) => setData('lokasi', e.target.value)}
                                            placeholder="Lokasi penempatan tong"
                                            className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                        />
                                        {errors.lokasi && <p className="mt-1 text-xs text-[#dc2626]">{errors.lokasi}</p>}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-medium text-[#374151] mb-1">Jenis Sampah</label>
                                            <select
                                                value={data.jenis_sampah}
                                                onChange={(e) => setData('jenis_sampah', e.target.value)}
                                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                            >
                                                {jenisSampahOptions.map((j) => (
                                                    <option key={j} value={j} className="capitalize">
                                                        {j === 'b3' ? 'B3' : j.charAt(0).toUpperCase() + j.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.jenis_sampah && <p className="mt-1 text-xs text-[#dc2626]">{errors.jenis_sampah}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[#374151] mb-1">&nbsp;</label>
                                            <div className="h-0" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[#374151] mb-1">Keterangan</label>
                                        <textarea
                                            value={data.keterangan}
                                            onChange={(e) => setData('keterangan', e.target.value)}
                                            rows={2}
                                            placeholder="Keterangan tambahan (opsional)"
                                            className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                        />
                                        {errors.keterangan && <p className="mt-1 text-xs text-[#dc2626]">{errors.keterangan}</p>}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="rounded-full px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f3f4f6]"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d] disabled:opacity-50"
                                        >
                                            {processing ? 'Menyimpan...' : editItem ? 'Simpan' : 'Tambah'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </AppLayout>
    );
}
