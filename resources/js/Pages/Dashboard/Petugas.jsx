import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';

function timeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default function Petugas({
    tongPenuh,
    riwayatHariIni,
    totalDiangkutHariIni,
    jadwalHariIni,
}) {
    const header = (
        <div className="flex items-center gap-3">
            <span>Dasbor Petugas</span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Petugas
            </span>
        </div>
    );

    const totalPenuh = tongPenuh ? tongPenuh.length : 0;

    return (
        <AppLayout header={header}>
            <Head title="Dasbor Petugas" />

            <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    <StatCard
                        title="Tong Penuh"
                        value={totalPenuh}
                        color="red"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Sudah Diangkut Hari Ini"
                        value={totalDiangkutHariIni || 0}
                        color="green"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Total Pengangkutan"
                        value={riwayatHariIni ? riwayatHariIni.length : 0}
                        color="blue"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                        }
                    />
                </div>

                {/* Jadwal Hari Ini */}
                {jadwalHariIni && jadwalHariIni.length > 0 && (
                    <div className="rounded-xl bg-white border border-[#e5e7eb] p-5">
                        <h3 className="text-sm font-semibold text-[#111827] mb-4">Jadwal Hari Ini</h3>
                        <div className="space-y-3">
                            {jadwalHariIni.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 rounded-xl border border-[#e5e7eb] p-4 bg-[#f9fafb]">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-[#111827]">{item.rute || item.nama_rute}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#6b7280]">
                                            <span>{item.jam_mulai} - {item.jam_selesai}</span>
                                            {item.wilayah && <span>{item.wilayah}</span>}
                                            {item.hari && <span className="text-[#16a34a] font-medium">{item.hari}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tong Penuh - List for Action */}
                <div className="rounded-xl bg-white border border-[#e5e7eb] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-[#111827]">Tong Penuh</h3>
                        {tongPenuh && tongPenuh.length > 0 && (
                            <span className="text-xs text-[#dc2626] font-medium bg-[#fee2e2] px-2 py-0.5 rounded-full">
                                {tongPenuh.length} perlu diangkut
                            </span>
                        )}
                    </div>
                    {tongPenuh && tongPenuh.length > 0 ? (
                        <>
                            {/* Desktop table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#e5e7eb] text-left">
                                            <th className="pb-3 pr-4 text-xs font-medium text-[#6b7280]">Nama Unit</th>
                                            <th className="pb-3 pr-4 text-xs font-medium text-[#6b7280]">Kode</th>
                                            <th className="pb-3 pr-4 text-xs font-medium text-[#6b7280]">Lokasi</th>
                                            <th className="pb-3 pr-4 text-xs font-medium text-[#6b7280]">Status</th>
                                            <th className="pb-3 text-xs font-medium text-[#6b7280]">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f3f4f6]">
                                        {tongPenuh.map((item, i) => (
                                            <tr key={i} className="hover:bg-[#f9fafb] transition">
                                                <td className="py-3 pr-4 text-[#111827] font-medium">{item.unit?.nama || '-'}</td>
                                                <td className="py-3 pr-4 text-[#374151]">{item.kode}</td>
                                                <td className="py-3 pr-4 text-[#6b7280]">{item.lokasi || item.nama || '-'}</td>
                                                <td className="py-3 pr-4">
                                                    <StatusBadge status={item.status || 'penuh'} type="trash" />
                                                </td>
                                                <td className="py-3">
                                                    <Link
                                                        href={route('petugas.pengangkutan.index')}
                                                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-[#16a34a] hover:bg-[#15803d] transition"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                        </svg>
                                                        Angkut
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="lg:hidden space-y-3">
                                {tongPenuh.map((item, i) => (
                                    <div key={i} className="rounded-xl border border-[#e5e7eb] p-4 bg-white hover:border-[#d1d5db] transition">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-[#111827]">{item.nama || item.kode}</p>
                                                <p className="text-xs text-[#6b7280] mt-0.5">{item.unit?.nama}</p>
                                                <p className="text-xs text-[#9ca3af] mt-0.5">{item.lokasi}</p>
                                                <div className="mt-2">
                                                    <StatusBadge status={item.status || 'penuh'} type="trash" />
                                                </div>
                                            </div>
                                            <Link
                                                href={route('petugas.pengangkutan.index')}
                                                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-[#16a34a] hover:bg-[#15803d] transition shrink-0"
                                            >
                                                Angkut
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <EmptyState
                            icon={
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            }
                            title="Tidak ada tong penuh"
                            description="Semua tong dalam keadaan terkendali"
                        />
                    )}
                </div>

                {/* Riwayat Hari Ini */}
                <div className="rounded-xl bg-white border border-[#e5e7eb] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-[#111827]">Riwayat Hari Ini</h3>
                        {riwayatHariIni && riwayatHariIni.length > 0 && (
                            <Link
                                href={route('petugas.pengangkutan.index')}
                                className="text-xs font-medium text-[#16a34a] hover:text-[#15803d] transition"
                            >
                                Lihat Semua
                            </Link>
                        )}
                    </div>
                    {riwayatHariIni && riwayatHariIni.length > 0 ? (
                        <div className="divide-y divide-[#f3f4f6] -mx-1">
                            {riwayatHariIni.map((item, i) => {
                                const isCompleted = item.status === 'selesai' || item.status === 'sudah_diangkut';
                                return (
                                    <div key={i} className="flex items-center gap-3 px-1 py-3">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isCompleted ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                                            {isCompleted ? (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-[#111827] truncate">
                                                {item.nama_tong || item.nama || item.kode || 'Tong Sampah'}
                                            </p>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#6b7280]">
                                                <span>{item.waktu || timeAgo(item.created_at || item.tanggal)}</span>
                                                {item.status && (
                                                    <StatusBadge status={item.status} type="trash" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            icon={
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            }
                            title="Belum ada riwayat"
                            description="Riwayat pengangkutan hari ini akan muncul di sini"
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
