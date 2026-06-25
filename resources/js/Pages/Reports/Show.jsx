import AppLayout from '@/Layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';

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
