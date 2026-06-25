import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';
import { usePage, useForm, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import StatCard from '@/Components/StatCard';

const roleStyles = {
    super_admin: 'bg-red-100 text-red-800',
    admin_unit: 'bg-indigo-100 text-indigo-800',
    kepala_unit: 'bg-amber-100 text-amber-800',
    kepala_pusat: 'bg-purple-100 text-purple-800',
    petugas: 'bg-blue-100 text-blue-800',
    siswa: 'bg-green-100 text-green-800',
};

const roleLabels = {
    super_admin: 'Super Admin',
    admin_unit: 'Admin Unit',
    kepala_unit: 'Kepala Unit',
    kepala_pusat: 'Kepala Pusat',
    petugas: 'Petugas',
    siswa: 'Siswa',
};

export default function UsersIndex({ users, filters, roleList, unitList, stats }) {
    const { props } = usePage();
    const currentUser = props.auth.user;
    const isSuperAdmin = currentUser.role === 'super_admin';

    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [flashMsg, setFlashMsg] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        unit_id: '',
        no_telepon: '',
        alamat: '',
    });

    useEffect(() => {
        const msg = props.flash?.success || props.flash?.error;
        if (msg) {
            setFlashMsg(msg);
            const t = setTimeout(() => setFlashMsg(null), 3000);
            return () => clearTimeout(t);
        }
    }, [props.flash]);

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const search = formData.get('search');
        router.get(route('admin.users.index'), { ...filters, search }, { preserveState: true, replace: true });
    };

    const setFilter = (key, value) => {
        const params = { ...filters, [key]: value };
        if (!value) delete params[key];
        router.get(route('admin.users.index'), params, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        reset();
        clearErrors();
        setEditItem(null);
        if (!isSuperAdmin && currentUser.unit_id) {
            setData('unit_id', currentUser.unit_id);
        }
        setModalOpen(true);
    };

    const openEdit = (user) => {
        clearErrors();
        setEditItem(user);
        setData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role_id: user.role_id || user.role || '',
            unit_id: user.unit_id || '',
            no_telepon: user.no_telepon || '',
            alamat: user.alamat || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editItem) {
            put(route('admin.users.update', editItem.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id, name) => {
        if (id === currentUser.id) {
            Swal.fire({
                icon: 'error',
                title: 'Tidak dapat menghapus',
                text: 'Anda tidak dapat menghapus akun sendiri.',
                timer: 3000,
                showConfirmButton: false,
            });
            return;
        }

        Swal.fire({
            title: 'Hapus pengguna?',
            html: `Anda akan menghapus <b>${name}</b>. Tindakan ini tidak dapat dibatalkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.users.destroy', id));
            }
        });
    };

    const roleStats = [
        {
            title: 'Total Pengguna',
            value: stats?.total || 0,
            color: 'indigo',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
            ),
        },
        {
            title: 'Super Admin',
            value: stats?.super_admin || 0,
            color: 'red',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
            ),
        },
        {
            title: 'Admin Unit',
            value: stats?.admin_unit || 0,
            color: 'indigo',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
            ),
        },
        {
            title: 'Petugas',
            value: stats?.petugas || 0,
            color: 'blue',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
            ),
        },
        {
            title: 'Siswa',
            value: stats?.siswa || 0,
            color: 'green',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
            ),
        },
    ];

    const adminUnitRoleOptions = roleList?.filter((r) => r.name === 'petugas' || r.name === 'siswa') || [];
    const roleOptions = isSuperAdmin ? (roleList || []) : adminUnitRoleOptions;

    return (
        <AppLayout header="Kelola Pengguna">
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

            <div className="space-y-4">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {roleStats.map((card, i) => (
                            <StatCard
                                key={i}
                                title={card.title}
                                value={card.value}
                                icon={card.icon}
                                color={card.color}
                            />
                        ))}
                    </div>
                )}

                <div className="rounded-xl bg-white border border-[#e5e7eb]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
                        <div>
                            <h2 className="text-sm font-semibold text-[#111827]">Daftar Pengguna</h2>
                            <p className="mt-0.5 text-xs text-[#9ca3af]">Kelola akun pengguna sistem</p>
                        </div>
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d]"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Tambah Pengguna
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-5 py-3 sm:flex-row sm:items-center">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters?.search || ''}
                                placeholder="Cari nama atau email..."
                                className="flex-1 rounded-lg border border-[#d1d5db] px-3 py-1.5 text-xs text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            />
                            <button
                                type="submit"
                                className="rounded-lg bg-[#f3f4f6] px-3 py-1.5 text-xs font-medium text-[#374151] transition hover:bg-[#e5e7eb]"
                            >
                                Cari
                            </button>
                        </form>
                        <div className="flex gap-2">
                            <select
                                value={filters?.role_id || ''}
                                onChange={(e) => setFilter('role_id', e.target.value)}
                                className="rounded-lg border border-[#d1d5db] px-3 py-1.5 text-xs text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            >
                                <option value="">Semua Role</option>
                                {roleOptions.map((r) => (
                                    <option key={r.id || r.name} value={r.id || r.name || r}>
                                        {roleLabels[r.name || r] || r.name || r}
                                    </option>
                                ))}
                            </select>
                            {isSuperAdmin && unitList && unitList.length > 0 && (
                                <select
                                    value={filters?.unit_id || ''}
                                    onChange={(e) => setFilter('unit_id', e.target.value)}
                                    className="rounded-lg border border-[#d1d5db] px-3 py-1.5 text-xs text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                >
                                    <option value="">Semua Unit</option>
                                    {unitList.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nama}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Table / Content */}
                    {users?.data?.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs font-medium text-[#6b7280]">
                                            <th className="px-5 py-3 w-12">No</th>
                                            <th className="px-5 py-3">Nama</th>
                                            <th className="px-5 py-3">Email</th>
                                            <th className="px-5 py-3">Role</th>
                                            <th className="px-5 py-3">Unit</th>
                                            <th className="px-5 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f3f4f6]">
                                        {users.data.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-[#f9fafb] transition">
                                                <td className="px-5 py-3 text-[#9ca3af]">
                                                    {users.from + index}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="font-medium text-[#111827]">{user.name}</div>
                                                    {user.no_telepon && (
                                                        <div className="text-xs text-[#9ca3af]">{user.no_telepon}</div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-[#6b7280]">{user.email}</td>
                                                <td className="px-5 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                            roleStyles[user.role] || 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {user.role_label || roleLabels[user.role] || user.role}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {user.unit ? (
                                                        <span className="inline-flex items-center rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-medium text-[#6b7280]">
                                                            {user.unit.nama}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-[#9ca3af]">-</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEdit(user)}
                                                            className="text-xs font-medium text-[#16a34a] hover:text-[#15803d] transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id, user.name)}
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
                                {users.data.map((user, index) => (
                                    <div key={user.id} className="px-5 py-4 hover:bg-[#f9fafb] transition">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-[#9ca3af]">#{users.from + index}</span>
                                                    <h3 className="text-sm font-semibold text-[#111827]">{user.name}</h3>
                                                </div>
                                                <p className="mt-0.5 text-xs text-[#6b7280]">{user.email}</p>
                                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                            roleStyles[user.role] || 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {user.role_label || roleLabels[user.role] || user.role}
                                                    </span>
                                                    {user.unit && (
                                                        <span className="inline-flex items-center rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-medium text-[#6b7280]">
                                                            {user.unit.nama}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs text-[#9ca3af]">
                                                    {user.no_telepon && (
                                                        <span>{user.no_telepon}</span>
                                                    )}
                                                    {user.alamat && (
                                                        <span className="ml-2">{user.alamat}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    className="text-xs font-medium text-[#16a34a] hover:text-[#15803d] transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="text-xs font-medium text-[#dc2626] hover:text-[#b91c1c] transition"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {users.links && users.meta && (
                                <div className="border-t border-[#e5e7eb] px-5 py-3">
                                    <Pagination links={users.links} meta={users.meta} />
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon={
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                </svg>
                            }
                            title={
                                filters?.search || filters?.role_id || filters?.unit_id
                                    ? 'Tidak ada pengguna yang cocok dengan filter'
                                    : 'Belum ada pengguna'
                            }
                            description="Daftar pengguna akan muncul di sini"
                        />
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-base font-semibold text-[#111827] mb-4">
                        {editItem ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-[#374151] mb-1">Nama</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-[#dc2626]">{errors.name}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-[#374151] mb-1">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-[#dc2626]">{errors.email}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-[#374151] mb-1">
                                Password
                                {editItem && (
                                    <span className="text-[#9ca3af] font-normal"> (kosongkan jika tidak berubah)</span>
                                )}
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                {...(!editItem ? { required: true } : {})}
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-[#dc2626]">{errors.password}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1">Role</label>
                            <select
                                value={data.role_id}
                                onChange={(e) => setData('role_id', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                required
                            >
                                <option value="">Pilih Role</option>
                                {roleOptions.map((r) => (
                                    <option key={r.id || r.name} value={r.id || r.name}>
                                        {roleLabels[r.name || r] || r.name || r}
                                    </option>
                                ))}
                            </select>
                            {errors.role_id && (
                                <p className="mt-1 text-xs text-[#dc2626]">{errors.role_id}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1">Unit</label>
                            {isSuperAdmin ? (
                                <select
                                    value={data.unit_id}
                                    onChange={(e) => setData('unit_id', e.target.value)}
                                    className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                >
                                    <option value="">Pilih Unit</option>
                                    {unitList?.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nama}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={currentUser.unit?.nama || ''}
                                    disabled
                                    className="w-full rounded-md border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2 text-sm text-[#9ca3af]"
                                />
                            )}
                            {errors.unit_id && (
                                <p className="mt-1 text-xs text-[#dc2626]">{errors.unit_id}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#374151] mb-1">No. Telepon</label>
                            <input
                                type="text"
                                value={data.no_telepon}
                                onChange={(e) => setData('no_telepon', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-[#374151] mb-1">Alamat</label>
                            <textarea
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                rows={2}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e5e7eb]">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-full px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f3f4f6]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d] disabled:opacity-50"
                        >
                            {editItem ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
