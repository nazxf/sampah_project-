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
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const tipeFilterTabs = ['semua', 'harian', 'mingguan', 'bulanan'];

const tipeStyles = {
    harian: 'bg-blue-100 text-blue-800',
    mingguan: 'bg-purple-100 text-purple-800',
    bulanan: 'bg-green-100 text-green-800',
};

const tipeLabels = {
    harian: 'Harian',
    mingguan: 'Mingguan',
    bulanan: 'Bulanan',
};

const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                boxWidth: 8,
                padding: 14,
                font: { size: 11 },
                color: '#5f665f',
            },
        },
        tooltip: {
            backgroundColor: '#182018',
            titleFont: { size: 12 },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
        },
    },
};

function ChartEmpty({ title = 'Belum ada data grafik' }) {
    return (
        <div className="flex h-full min-h-[220px] items-center justify-center rounded-lg border border-dashed border-cloud-ash bg-warm-chalk px-4 text-center">
            <p className="text-sm font-medium text-muted-earth">{title}</p>
        </div>
    );
}

export default function ReportsIndex({ reports, summary, chartData, filters, units }) {
    const { props } = usePage();
    const user = props.auth.user;
    const canWrite = user?.role === 'super_admin' || user?.role === 'admin_unit';

    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [flashMsg, setFlashMsg] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        judul: '',
        tipe: 'bulanan',
        unit_id: '',
        periode_mulai: '',
        periode_selesai: '',
        isi: '',
        total_tong_penuh: '',
        total_pengangkutan: '',
        total_aduan: '',
    });

    useEffect(() => {
        const msg = props.flash?.success || props.flash?.error;
        if (msg) {
            setFlashMsg(msg);
            const t = setTimeout(() => setFlashMsg(null), 3000);
            return () => clearTimeout(t);
        }
    }, [props.flash]);

    const setFilter = (tipe) => {
        if (tipe === 'semua') {
            router.get(route('admin.reports.index'), {}, { preserveState: true, replace: true });
        } else {
            router.get(route('admin.reports.index'), { tipe }, { preserveState: true, replace: true });
        }
    };

    const setUnitFilter = (unitId) => {
        const params = {};
        if (filters?.tipe && filters.tipe !== 'semua') params.tipe = filters.tipe;
        if (unitId) params.unit_id = unitId;
        router.get(route('admin.reports.index'), params, { preserveState: true, replace: true });
    };

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
            judul: item.judul || '',
            tipe: item.tipe || 'bulanan',
            unit_id: item.unit_id || '',
            periode_mulai: item.periode_mulai || '',
            periode_selesai: item.periode_selesai || '',
            isi: item.isi || '',
            total_tong_penuh: item.total_tong_penuh || '',
            total_pengangkutan: item.total_pengangkutan || '',
            total_aduan: item.total_aduan || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editItem) {
            put(route('admin.reports.update', editItem.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.reports.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus laporan?',
            text: 'Tindakan ini tidak dapat dibatalkan',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.reports.destroy', id));
            }
        });
    };

    const summaryCards = [
        {
            title: 'Total Tong Penuh',
            value: summary?.total_tong_penuh || 0,
            color: 'red',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
            ),
        },
        {
            title: 'Total Pengangkutan',
            value: summary?.total_pengangkutan || 0,
            color: 'blue',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
            ),
        },
        {
            title: 'Total Aduan',
            value: summary?.total_aduan || 0,
            color: 'yellow',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
            ),
        },
        {
            title: 'Total Laporan',
            value: summary?.total_laporan || reports?.total || 0,
            color: 'indigo',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
            ),
        },
    ];

    const metricBreakdown = chartData?.metric_breakdown || [];
    const typeBreakdown = chartData?.type_breakdown || [];
    const trend = chartData?.trend || [];
    const monthLabel = chartData?.month_label || 'Bulan ini';
    const hasMetricData = metricBreakdown.some((item) => Number(item.value) > 0);
    const hasTypeData = typeBreakdown.some((item) => Number(item.total) > 0);
    const hasTrendData = trend.some((item) =>
        Number(item.tong_penuh) > 0 ||
        Number(item.pengangkutan) > 0 ||
        Number(item.aduan) > 0 ||
        Number(item.laporan) > 0
    );

    const metricChartData = {
        labels: metricBreakdown.map((item) => item.label),
        datasets: [
            {
                label: 'Total',
                data: metricBreakdown.map((item) => item.value || 0),
                backgroundColor: ['rgba(220, 38, 38, 0.72)', 'rgba(22, 163, 74, 0.72)', 'rgba(217, 119, 6, 0.72)', 'rgba(79, 70, 229, 0.72)'],
                borderColor: ['#dc2626', '#16a34a', '#d97706', '#4f46e5'],
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const metricChartOptions = {
        ...chartOptionsBase,
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#6f776f', font: { size: 11 } },
            },
            y: {
                beginAtZero: true,
                grid: { color: '#edf1ed' },
                ticks: { color: '#6f776f', precision: 0 },
            },
        },
    };

    const typeChartData = {
        labels: typeBreakdown.map((item) => item.label),
        datasets: [
            {
                data: typeBreakdown.map((item) => item.total || 0),
                backgroundColor: ['#3b82f6', '#8b5cf6', '#16a34a'],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 4,
            },
        ],
    };

    const trendChartData = {
        labels: trend.map((item) => item.label),
        datasets: [
            {
                label: 'Pengangkutan',
                data: trend.map((item) => item.pengangkutan || 0),
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.08)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: '#16a34a',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Tong Penuh',
                data: trend.map((item) => item.tong_penuh || 0),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.05)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: '#dc2626',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.35,
                fill: false,
            },
            {
                label: 'Aduan',
                data: trend.map((item) => item.aduan || 0),
                borderColor: '#d97706',
                backgroundColor: 'rgba(217, 119, 6, 0.05)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: '#d97706',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.35,
                fill: false,
            },
            {
                label: 'Laporan',
                data: trend.map((item) => item.laporan || 0),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.05)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.35,
                fill: false,
            },
        ],
    };

    const trendChartOptions = {
        ...chartOptionsBase,
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#6f776f', font: { size: 11 }, maxTicksLimit: 8 },
            },
            y: {
                beginAtZero: true,
                grid: { color: '#edf1ed' },
                ticks: { color: '#6f776f', precision: 0 },
            },
        },
    };

    return (
        <AppLayout header="Laporan">
            {flashMsg && (
                <div
                    className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                        flashMsg.includes('berhasil')
                            ? 'bg-[#dcfce7] text-primary-600'
                            : 'bg-[#fee2e2] text-earth-red'
                    }`}
                >
                    {flashMsg}
                </div>
            )}

            {/* Summary Stats Cards */}
            {summary && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {summaryCards.map((card, i) => (
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

            {summary && (
                <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                    <div className="rounded-xl border border-cloud-ash bg-white p-5">
                        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-earth-heading">Tren sebulan ini</h2>
                                <p className="text-xs text-muted-earth/70">Data harian {monthLabel}: pengangkutan, tong penuh, aduan, dan laporan.</p>
                            </div>
                            <span className="text-xs font-medium text-muted-earth">{reports?.total || 0} laporan terfilter</span>
                        </div>
                        <div className="h-72">
                            {hasTrendData ? (
                                <Line data={trendChartData} options={trendChartOptions} />
                            ) : (
                                <ChartEmpty title={`Belum ada data di ${monthLabel}`} />
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                        <div className="rounded-xl border border-cloud-ash bg-white p-5">
                            <h2 className="mb-4 text-sm font-semibold text-earth-heading">Rekap metrik bulan ini</h2>
                            <div className="h-56">
                                {hasMetricData ? (
                                    <Bar data={metricChartData} options={metricChartOptions} />
                                ) : (
                                    <ChartEmpty title={`Belum ada rekap di ${monthLabel}`} />
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-cloud-ash bg-white p-5">
                            <h2 className="mb-4 text-sm font-semibold text-earth-heading">Komposisi tipe bulan ini</h2>
                            <div className="h-56">
                                {hasTypeData ? (
                                    <Doughnut data={typeChartData} options={{ ...chartOptionsBase, cutout: '62%' }} />
                                ) : (
                                    <ChartEmpty title="Belum ada tipe laporan" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-xl bg-white border border-cloud-ash">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-cloud-ash px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-earth-heading">Daftar Laporan</h2>
                        <p className="mt-0.5 text-xs text-muted-earth/70">
                            Laporan harian, mingguan, dan bulanan
                        </p>
                    </div>
                    {canWrite && (
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d]"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Buat Laporan
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 border-b border-cloud-ash px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        {tipeFilterTabs.map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition capitalize ${
                                    (filters?.tipe || 'semua') === t
                                        ? 'bg-[#16a34a] text-white'
                                        : 'bg-river-stone text-muted-earth hover:bg-[#e5e7eb]'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    {units && units.length > 0 && (
                        <select
                            value={filters?.unit_id || ''}
                            onChange={(e) => setUnitFilter(e.target.value)}
                            className="rounded-lg border border-[#d1d5db] px-3 py-1.5 text-xs text-earth-heading focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                        >
                            <option value="">Semua Unit</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.nama}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Table / Content */}
                {reports?.data?.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-cloud-ash bg-warm-chalk text-xs font-medium text-muted-earth">
                                        <th className="px-5 py-3 w-12">No</th>
                                        <th className="px-5 py-3">Judul</th>
                                        <th className="px-5 py-3">Tipe</th>
                                        <th className="px-5 py-3">Unit</th>
                                        <th className="px-5 py-3">Periode</th>
                                        <th className="px-5 py-3">Total Angkut</th>
                                        <th className="px-5 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-river-stone">
                                    {reports.data.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-warm-chalk transition">
                                            <td className="px-5 py-3 text-muted-earth/70">
                                                {reports.from + index}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-medium text-earth-heading">{item.judul}</div>
                                                <div className="mt-0.5 text-xs text-muted-earth/70 line-clamp-1">{item.isi}</div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                        tipeStyles[item.tipe] || 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {tipeLabels[item.tipe] || item.tipe}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-muted-earth">
                                                {item.unit?.nama || '-'}
                                            </td>
                                            <td className="px-5 py-3 text-muted-earth/70 text-xs">
                                                {item.periode_mulai_formatted || item.periode_mulai || '-'}
                                                {' - '}
                                                {item.periode_selesai_formatted || item.periode_selesai || '-'}
                                            </td>
                                            <td className="px-5 py-3 text-muted-earth">
                                                {item.total_pengangkutan || 0}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('admin.reports.show', item.id)}
                                                        className="text-xs font-medium text-primary-600 hover:text-primary-700 transition"
                                                    >
                                                        Detail
                                                    </Link>
                                                    {canWrite && (
                                                        <>
                                                            <button
                                                                onClick={() => openEdit(item)}
                                                                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="text-xs font-medium text-earth-red hover:text-[#b91c1c] transition"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </>
                                                    )}
                                                    <Link
                                                        href={route('admin.reports.pdf', item.id)}
                                                        className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5] transition"
                                                    >
                                                        PDF
                                                    </Link>
                                                    <Link
                                                        href={route('admin.reports.csv', item.id)}
                                                        className="text-xs font-medium text-[#059669] hover:text-[#047857] transition"
                                                    >
                                                        CSV
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden divide-y divide-river-stone">
                            {reports.data.map((item, index) => (
                                <div key={item.id} className="px-5 py-4 hover:bg-warm-chalk transition">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-earth/70">#{reports.from + index}</span>
                                                <h3 className="text-sm font-semibold text-earth-heading">{item.judul}</h3>
                                            </div>
                                            <p className="mt-1 text-sm text-muted-earth line-clamp-2">{item.isi}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                        tipeStyles[item.tipe] || 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {tipeLabels[item.tipe] || item.tipe}
                                                </span>
                                                <span className="text-xs text-muted-earth/70">
                                                    {item.unit?.nama || '-'}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-earth/70">
                                                <span>
                                                    {item.periode_mulai_formatted || item.periode_mulai || '-'}
                                                    {' - '}
                                                    {item.periode_selesai_formatted || item.periode_selesai || '-'}
                                                </span>
                                                <span>Angkut: {item.total_pengangkutan || 0}</span>
                                                {item.user?.name && <span>Oleh: {item.user.name}</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <button
                                                onClick={() => router.get(route('admin.reports.show', item.id))}
                                                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition"
                                            >
                                                Detail
                                            </button>
                                            {canWrite && (
                                                <>
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="text-xs font-medium text-primary-600 hover:text-primary-700 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-xs font-medium text-earth-red hover:text-[#b91c1c] transition"
                                                    >
                                                        Hapus
                                                    </button>
                                                </>
                                            )}
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('admin.reports.pdf', item.id)}
                                                    className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5] transition"
                                                >
                                                    PDF
                                                </Link>
                                                <Link
                                                    href={route('admin.reports.csv', item.id)}
                                                    className="text-xs font-medium text-[#059669] hover:text-[#047857] transition"
                                                >
                                                    CSV
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {reports.links && reports.meta && (
                            <div className="border-t border-cloud-ash px-5 py-3">
                                <Pagination links={reports.links} meta={reports.meta} />
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        }
                        title={
                            filters?.tipe && filters.tipe !== 'semua'
                                ? `Tidak ada laporan dengan tipe "${filters.tipe}"`
                                : 'Belum ada laporan'
                        }
                        description={canWrite ? 'Buat laporan pertama untuk melihat ringkasan data' : 'Belum ada laporan yang dapat ditampilkan'}
                    />
                )}
            </div>

            {/* Create / Edit Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-base font-semibold text-earth-heading mb-4">
                        {editItem ? 'Edit Laporan' : 'Buat Laporan Baru'}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-grounded-charcoal mb-1">Judul</label>
                            <input
                                type="text"
                                value={data.judul}
                                onChange={(e) => setData('judul', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-earth-heading focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                                required
                            />
                            {errors.judul && <p className="mt-1 text-xs text-earth-red">{errors.judul}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-grounded-charcoal mb-1">Tipe</label>
                            <select
                                value={data.tipe}
                                onChange={(e) => setData('tipe', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-earth-heading focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            >
                                <option value="harian">Harian</option>
                                <option value="mingguan">Mingguan</option>
                                <option value="bulanan">Bulanan</option>
                            </select>
                            {errors.tipe && <p className="mt-1 text-xs text-earth-red">{errors.tipe}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-grounded-charcoal mb-1">Unit</label>
                            <select
                                value={data.unit_id}
                                onChange={(e) => setData('unit_id', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-earth-heading focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            >
                                <option value="">Semua Unit</option>
                                {units?.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.nama}
                                    </option>
                                ))}
                            </select>
                            {errors.unit_id && <p className="mt-1 text-xs text-earth-red">{errors.unit_id}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-grounded-charcoal mb-1">Periode Mulai</label>
                            <input
                                type="date"
                                value={data.periode_mulai}
                                onChange={(e) => setData('periode_mulai', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-earth-heading focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            />
                            {errors.periode_mulai && <p className="mt-1 text-xs text-earth-red">{errors.periode_mulai}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-grounded-charcoal mb-1">Periode Selesai</label>
                            <input
                                type="date"
                                value={data.periode_selesai}
                                onChange={(e) => setData('periode_selesai', e.target.value)}
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-earth-heading focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            />
                            {errors.periode_selesai && (
                                <p className="mt-1 text-xs text-earth-red">{errors.periode_selesai}</p>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-grounded-charcoal mb-1">Isi Laporan</label>
                            <textarea
                                value={data.isi}
                                onChange={(e) => setData('isi', e.target.value)}
                                rows={6}
                                placeholder="Tulis isi laporan di sini (mendukung format rich text)..."
                                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm text-earth-heading focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]"
                            />
                            {errors.isi && <p className="mt-1 text-xs text-earth-red">{errors.isi}</p>}
                        </div>

                        {/* Auto-calculated totals display */}
                        {(data.total_tong_penuh || data.total_pengangkutan || data.total_aduan) && (
                            <div className="sm:col-span-2 rounded-lg bg-river-stone p-4">
                                <p className="text-xs font-medium text-grounded-charcoal mb-2">Ringkasan Otomatis</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {data.total_tong_penuh && (
                                        <div>
                                            <p className="text-xs text-muted-earth/70">Total Tong Penuh</p>
                                            <p className="text-sm font-semibold text-earth-heading">{data.total_tong_penuh}</p>
                                        </div>
                                    )}
                                    {data.total_pengangkutan && (
                                        <div>
                                            <p className="text-xs text-muted-earth/70">Total Pengangkutan</p>
                                            <p className="text-sm font-semibold text-earth-heading">{data.total_pengangkutan}</p>
                                        </div>
                                    )}
                                    {data.total_aduan && (
                                        <div>
                                            <p className="text-xs text-muted-earth/70">Total Aduan</p>
                                            <p className="text-sm font-semibold text-earth-heading">{data.total_aduan}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-cloud-ash">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-full px-4 py-2 text-sm font-medium text-grounded-charcoal transition hover:bg-river-stone"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d] disabled:opacity-50"
                        >
                            {editItem ? 'Simpan Perubahan' : 'Buat Laporan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
