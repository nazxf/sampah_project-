import AppLayout from '@/Layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const tipeLabels = {
    harian: 'Harian',
    mingguan: 'Mingguan',
    bulanan: 'Bulanan',
};

function formatDate(value) {
    if (!value) return '-';

    try {
        return new Date(value).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return value;
    }
}

function Metric({ label, value }) {
    return (
        <div className="rounded-lg border border-cloud-ash bg-white p-4">
            <p className="text-xs font-medium text-muted-earth">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-earth-heading">{value ?? 0}</p>
        </div>
    );
}

export default function Show({ report }) {
    const { props } = usePage();
    const role = props.auth?.user?.role;
    const canWrite = role === 'super_admin' || role === 'admin_unit';
    const metricItems = [
        { label: 'Tong Penuh', value: report.total_tong_penuh || 0 },
        { label: 'Pengangkutan', value: report.total_pengangkutan || 0 },
        { label: 'Aduan', value: report.total_aduan || 0 },
    ];
    const hasMetricData = metricItems.some((item) => Number(item.value) > 0);
    const metricChartData = {
        labels: metricItems.map((item) => item.label),
        datasets: [
            {
                data: metricItems.map((item) => item.value),
                backgroundColor: ['#dc2626', '#16a34a', '#d97706'],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 4,
            },
        ],
    };
    const metricChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
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

    return (
        <AppLayout header="Detail Laporan">
            <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-cloud-ash bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase text-muted-earth">
                            {tipeLabels[report.tipe] || report.tipe || 'Laporan'}
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-earth-heading">{report.judul}</h2>
                        <p className="mt-1 text-sm text-muted-earth">
                            {report.unit?.nama || 'Semua Unit'} | {formatDate(report.periode_mulai)} - {formatDate(report.periode_selesai)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={route('admin.reports.index')}
                            className="rounded-full border border-cloud-ash px-4 py-2 text-sm font-medium text-grounded-charcoal transition hover:bg-river-stone"
                        >
                            Kembali
                        </Link>
                        <Link
                            href={route('admin.reports.pdf', report.id)}
                            className="rounded-full bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4f46e5]"
                        >
                            PDF
                        </Link>
                        <Link
                            href={route('admin.reports.csv', report.id)}
                            className="rounded-full bg-[#059669] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#047857]"
                        >
                            CSV
                        </Link>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Total Tong Penuh" value={report.total_tong_penuh} />
                    <Metric label="Total Pengangkutan" value={report.total_pengangkutan} />
                    <Metric label="Total Aduan" value={report.total_aduan} />
                </div>

                <div className="rounded-lg border border-cloud-ash bg-white p-5">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-earth-heading">Diagram rekap laporan</h3>
                        <p className="mt-1 text-xs text-muted-earth/70">
                            Komposisi total kejadian pada periode laporan ini.
                        </p>
                    </div>
                    <div className="h-72">
                        {hasMetricData ? (
                            <Doughnut data={metricChartData} options={metricChartOptions} />
                        ) : (
                            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-cloud-ash bg-warm-chalk px-4 text-center">
                                <p className="text-sm font-medium text-muted-earth">Belum ada data untuk diagram.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-cloud-ash bg-white p-5">
                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium text-muted-earth">Dibuat oleh</p>
                            <p className="mt-1 text-earth-heading">{report.user?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-earth">Unit</p>
                            <p className="mt-1 text-earth-heading">{report.unit?.nama || 'Semua Unit'}</p>
                        </div>
                    </div>
                    <div className="mt-5 border-t border-cloud-ash pt-5">
                        <p className="text-xs font-medium text-muted-earth">Isi Laporan</p>
                        <div className="mt-2 whitespace-pre-line text-sm leading-6 text-grounded-charcoal">
                            {report.isi || 'Belum ada isi laporan.'}
                        </div>
                    </div>
                    {!canWrite && (
                        <p className="mt-5 rounded-lg bg-river-stone px-4 py-3 text-xs text-muted-earth">
                            Akun kepala memiliki akses lihat saja. Perubahan laporan hanya dapat dilakukan oleh admin.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
