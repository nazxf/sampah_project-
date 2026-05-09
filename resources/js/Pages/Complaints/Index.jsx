import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';
import { usePage, useForm, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';

const statusFilterTabs = ['semua', 'menunggu', 'diproses', 'selesai'];

const statusStyles = {
    menunggu: 'bg-yellow-100 text-yellow-800',
    diproses: 'bg-blue-100 text-blue-800',
    selesai: 'bg-green-100 text-green-800',
};

const statusLabels = {
    menunggu: 'Menunggu',
    diproses: 'Diproses',
    selesai: 'Selesai',
};

export default function ComplaintsIndex({ complaints, filters, trashBins }) {
    const { props } = usePage();
    const user = props.auth.user;
    const isAdmin = user.role === 'super_admin' || user.role === 'admin_unit';
    const isSiswa = user.role === 'siswa';

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [responseModalOpen, setResponseModalOpen] = useState(false);
    const [responseItem, setResponseItem] = useState(null);
    const [flashMsg, setFlashMsg] = useState(null);
    const [showTanggapanId, setShowTanggapanId] = useState(null);

    const createForm = useForm({
        trash_bin_id: '',
        judul: '',
        deskripsi: '',
        foto: null,
    });

    const responseForm = useForm({
        status: 'diproses',
        tanggapan: '',
    });

    useEffect(() => {
        const msg = props.flash?.success || props.flash?.error;
        if (msg) {
            setFlashMsg(msg);
            const t = setTimeout(() => setFlashMsg(null), 3000);
            return () => clearTimeout(t);
        }
    }, [props.flash]);

    const setFilter = (status) => {
        if (status === 'semua') {
            router.get(route('admin.complaints.index'), {}, { preserveState: true, replace: true });
        } else {
            router.get(route('admin.complaints.index'), { status }, { preserveState: true, replace: true });
        }
    };

    const openCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setCreateModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('siswa.aduan.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const openResponse = (item) => {
        responseForm.clearErrors();
        setResponseItem(item);
        responseForm.setData({
            status: item.status === 'menunggu' ? 'diproses' : item.status,
            tanggapan: item.tanggapan || '',
        });
        setResponseModalOpen(true);
    };

    const handleResponse = (e) => {
        e.preventDefault();
        responseForm.put(route('admin.complaints.tanggapi', responseItem.id), {
            onSuccess: () => {
                setResponseModalOpen(false);
                responseForm.reset();
            },
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus aduan?',
            text: 'Tindakan ini tidak dapat dibatalkan',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.complaints.destroy', id));
            }
        });
    };

    const pageTitle = isAdmin ? 'Data Aduan' : 'Aduan Saya';

    const filteredBins = trashBins?.filter(
        (bin) => bin.status === 'penuh' || bin.status === 'setengah_penuh'
    ) || [];

    return (
        <AppLayout header={pageTitle}>
            {flashMsg && (
                <div
                    className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                        flashMsg.includes('berhasil')
                            ? 'bg-[#dcfce7] text-[#16a34a]'
                            : 'bg-[#fee2e2] text-[#dc2626]'
                    }`}
                >
                    {flashMsg}
                </div>
            )}

            <div className="rounded-xl bg-white border border-[#e5e7eb]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-[#111827]">{pageTitle}</h2>
                        <p className="mt-0.5 text-xs text-[#9ca3af]">
                            {isAdmin
                                ? 'Kelola dan tanggapi aduan dari pengguna'
                                : 'Lihat aduan yang telah kamu kirimkan'}
                        </p>
                    </div>
                    {isSiswa && (
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d]"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Buat Aduan
                        </button>
                    )}
                </div>

                {/* Status filter tabs (admin only) */}
                {isAdmin && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-[#e5e7eb] px-5 py-3">
                        {statusFilterTabs.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition capitalize ${
                                    (filters?.status || 'semua') === s
                                        ? 'bg-[#16a34a] text-white'
                                        : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]'
                                }`}
                            >
                                {s === 'semua' ? 'Semua' : statusLabels[s] || s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Table / Content */}
                {complaints?.data?.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs font-medium text-[#6b7280]">
                                        <th className="px-5 py-3 w-12">No</th>
                                        <th className="px-5 py-3">Judul</th>
                                        {isAdmin && <th className="px-5 py-3">Pelapor</th>}
                                        <th className="px-5 py-3">Tong</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Tanggal</th>
                                        <th className="px-5 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f3f4f6]">
                                    {complaints.data.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-[#f9fafb] transition">
                                            <td className="px-5 py-3 text-[#9ca3af]">
                                                {complaints.from + index}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-medium text-[#111827]">{item.judul}</div>
                                                <div className="mt-0.5 text-xs text-[#9ca3af] line-clamp-1">{item.deskripsi}</div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-5 py-3 text-[#6b7280]">
                                                    {item.user?.name || '-'}
                                                </td>
                                            )}
                                            <td className="px-5 py-3 text-[#6b7280]">
                                                {item.trash_bin?.kode || (item.trash_bin?.unit?.nama ? `${item.trash_bin.unit.nama} - ${item.trash_bin.kode}` : '-')}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={item.status} type="complaint" />
                                            </td>
                                            <td className="px-5 py-3 text-[#9ca3af] text-xs">
                                                {item.created_at_formatted || item.created_at}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => openResponse(item)}
                                                            className="text-xs font-medium text-[#16a34a] hover:text-[#15803d] transition"
                                                        >
                                                            Tanggapi
                                                        </button>
                                                    )}
                                                    {(isAdmin || isSiswa) && item.tanggapan && (
                                                        <button
                                                            onClick={() =>
                                                                setShowTanggapanId(showTanggapanId === item.id ? null : item.id)
                                                            }
                                                            className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5] transition"
                                                        >
                                                            {showTanggapanId === item.id ? 'Sembunyikan' : 'Lihat Tanggapan'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-xs font-medium text-[#dc2626] hover:text-[#b91c1c] transition"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden divide-y divide-[#f3f4f6]">
                            {complaints.data.map((item, index) => (
                                <div key={item.id} className="px-5 py-4 hover:bg-[#f9fafb] transition">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#9ca3af]">#{complaints.from + index}</span>
                                                <h3 className="text-sm font-semibold text-[#111827]">{item.judul}</h3>
                                            </div>
                                            <p className="mt-1 text-sm text-[#6b7280] line-clamp-2">{item.deskripsi}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9ca3af]">
                                                {isAdmin && <span>Pelapor: {item.user?.name || '-'}</span>}
                                                <span>Tong: {item.trash_bin?.kode || '-'}</span>
                                                <span>{item.created_at_formatted || item.created_at}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <StatusBadge status={item.status} type="complaint" />
                                                {item.ditanggapi_oleh && (
                                                    <span className="text-xs text-[#9ca3af]">
                                                        ditanggapi: {item.ditanggapi_oleh.name || '-'}
                                                    </span>
                                                )}
                                            </div>
                                            {showTanggapanId === item.id && item.tanggapan && (
                                                <div className="mt-2 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-3 py-2">
                                                    <p className="text-xs font-medium text-[#16a34a]">Tanggapan:</p>
                                                    <p className="mt-0.5 text-xs text-[#374151]">{item.tanggapan}</p>
                                                    {item.ditanggapi_oleh && (
                                                        <p className="mt-1 text-xs text-[#9ca3af]">
                                                            oleh {item.ditanggapi_oleh.name}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => openResponse(item)}
                                                    className="text-xs font-medium text-[#16a34a] hover:text-[#15803d] transition"
                                                >
                                                    Tanggapi
                                                </button>
                                            )}
                                            {(isAdmin || isSiswa) && item.tanggapan && (
                                                <button
                                                    onClick={() =>
                                                        setShowTanggapanId(showTanggapanId === item.id ? null : item.id)
                                                    }
                                                    className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5] transition"
                                                >
                                                    {showTanggapanId === item.id ? 'Sembunyikan' : 'Tanggapan'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-xs font-medium text-[#dc2626] hover:text-[#b91c1c] transition"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: show tanggapan inline below row */}
                        <div className="hidden lg:block">
                            {showTanggapanId && (
                                complaints.data
                                    .filter((item) => item.id === showTanggapanId && item.tanggapan)
                                    .map((item) => (
                                        <div
                                            key={`tanggapan-${item.id}`}
                                            className="border-t border-[#dcfce7] bg-[#f0fdf4] px-5 py-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="h-4 w-4 shrink-0 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                                </svg>
                                                <span className="text-xs font-semibold text-[#16a34a]">Tanggapan</span>
                                                {item.ditanggapi_oleh && (
                                                    <span className="text-xs text-[#9ca3af]">
                                                        oleh {item.ditanggapi_oleh.name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-[#374151]">{item.tanggapan}</p>
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* Pagination */}
                        {complaints.links && complaints.meta && (
                            <div className="border-t border-[#e5e7eb] px-5 py-3">
                                <Pagination links={complaints.links} meta={complaints.meta} />
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        }
                        title={
                            filters?.status && filters.status !== 'semua'
                                ? `Tidak ada aduan dengan status "${statusLabels[filters.status] || filters.status}"`
                                : 'Belum ada aduan'
                        }
                        description={
                            isSiswa
                                ? 'Kamu belum membuat aduan. Klik "Buat Aduan" untuk memulai.'
                                : 'Aduan dari pengguna akan muncul di sini'
                        }
                    />
                )}
            </div>

            {/* Create Complaint Modal (Siswa) */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleCreate} className="p-6" encType="multipart/form-data">
                    <h3 className="text-base font-semibold text-[#111827] mb-4">Buat Aduan Baru</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1">
                                Tong Sampah
                            </label>
                            <select
                                value={createForm.data.trash_bin_id}
                                onChange={(e) => createForm.setData('trash_bin_id', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                required
                            >
                                <option value="">Pilih tong sampah</option>
                                {filteredBins.map((bin) => (
                                    <option key={bin.id} value={bin.id}>
                                        {bin.kode} - {bin.lokasi || bin.unit?.nama || '-'} ({bin.status === 'penuh' ? 'Penuh' : 'Setengah Penuh'})
                                    </option>
                                ))}
                            </select>
                            {filteredBins.length === 0 && (
                                <p className="mt-1 text-xs text-[#9ca3af]">
                                    Tidak ada tong sampah yang penuh atau setengah penuh saat ini.
                                </p>
                            )}
                            {createForm.errors.trash_bin_id && (
                                <p className="mt-1 text-xs text-[#dc2626]">{createForm.errors.trash_bin_id}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1">Judul</label>
                            <input
                                type="text"
                                value={createForm.data.judul}
                                onChange={(e) => createForm.setData('judul', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                required
                            />
                            {createForm.errors.judul && (
                                <p className="mt-1 text-xs text-[#dc2626]">{createForm.errors.judul}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1">Deskripsi</label>
                            <textarea
                                value={createForm.data.deskripsi}
                                onChange={(e) => createForm.setData('deskripsi', e.target.value)}
                                rows={4}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                required
                            />
                            {createForm.errors.deskripsi && (
                                <p className="mt-1 text-xs text-[#dc2626]">{createForm.errors.deskripsi}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1">Foto (opsional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => createForm.setData('foto', e.target.files[0])}
                                className="w-full text-sm text-[#6b7280] file:mr-3 file:rounded-lg file:border-0 file:bg-[#f3f4f6] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#374151] hover:file:bg-[#e5e7eb]"
                            />
                            {createForm.errors.foto && (
                                <p className="mt-1 text-xs text-[#dc2626]">{createForm.errors.foto}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e5e7eb]">
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(false)}
                            className="rounded-full px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f3f4f6]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d] disabled:opacity-50"
                        >
                            Kirim Aduan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Response Modal (Admin) */}
            <Modal show={responseModalOpen} onClose={() => setResponseModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleResponse} className="p-6">
                    <h3 className="text-base font-semibold text-[#111827] mb-1">Tanggapi Aduan</h3>
                    {responseItem && (
                        <div className="mb-4 rounded-lg bg-[#f3f4f6] p-3">
                            <p className="text-sm font-medium text-[#111827]">{responseItem.judul}</p>
                            <p className="mt-1 text-xs text-[#6b7280]">{responseItem.deskripsi}</p>
                            <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-[#9ca3af]">
                                <span>Pelapor: {responseItem.user?.name || '-'}</span>
                                <span>Tong: {responseItem.trash_bin?.kode || '-'}</span>
                            </div>
                            {responseItem.tanggapan && (
                                <div className="mt-2 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-3 py-2">
                                    <p className="text-xs font-medium text-[#16a34a]">Tanggapan sebelumnya:</p>
                                    <p className="mt-0.5 text-xs text-[#374151]">{responseItem.tanggapan}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1">Status</label>
                            <select
                                value={responseForm.data.status}
                                onChange={(e) => responseForm.setData('status', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            >
                                <option value="diproses">Diproses</option>
                                <option value="selesai">Selesai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1">Tanggapan</label>
                            <textarea
                                value={responseForm.data.tanggapan}
                                onChange={(e) => responseForm.setData('tanggapan', e.target.value)}
                                rows={4}
                                required
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            />
                            {responseForm.errors.tanggapan && (
                                <p className="mt-1 text-xs text-[#dc2626]">{responseForm.errors.tanggapan}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e5e7eb]">
                        <button
                            type="button"
                            onClick={() => setResponseModalOpen(false)}
                            className="rounded-full px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f3f4f6]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={responseForm.processing}
                            className="rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d] disabled:opacity-50"
                        >
                            Simpan Tanggapan
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
