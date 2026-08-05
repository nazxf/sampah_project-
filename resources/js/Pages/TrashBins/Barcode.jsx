import AppLayout from '@/Layouts/AppLayout';
import QRCode from '@/Components/QRCode';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link } from '@inertiajs/react';

export default function Barcode({ trashBin, reportUrl }) {
    return (
        <AppLayout header="Cetak Barcode Tong">
            <Head title={`Barcode ${trashBin.kode}`} />
            <style>{`
                @media print {
                    body { background: white !important; }
                    aside, header, nav, .no-print { display: none !important; }
                    main { padding: 0 !important; }
                    .print-sheet { border: 0 !important; box-shadow: none !important; }
                }
            `}</style>

            <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
                <Link
                    href={route('admin.trash-bins.index')}
                    className="rounded-lg border border-cloud-ash bg-white px-4 py-2 text-sm font-medium text-grounded-charcoal transition hover:bg-river-stone"
                >
                    Kembali
                </Link>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                    Cetak Barcode
                </button>
            </div>

            <section className="print-sheet mx-auto max-w-xl rounded-lg border border-cloud-ash bg-white p-8 shadow-sm">
                <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">SiPeSa</p>
                    <h1 className="mt-2 text-2xl font-bold text-earth-heading">Scan untuk Lapor Tong</h1>
                    <p className="mt-2 text-sm text-muted-earth">
                        Arahkan kamera HP ke QR ini untuk melaporkan kondisi tong tanpa login.
                    </p>
                </div>

                <div className="mt-6 flex justify-center">
                    <div className="rounded-lg border-4 border-earth-heading bg-white p-3">
                        <QRCode value={reportUrl} size={300} title={`QR laporan ${trashBin.kode}`} />
                    </div>
                </div>

                <div className="mt-6 rounded-lg border border-cloud-ash p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="font-mono text-sm font-bold text-earth-heading">{trashBin.kode}</p>
                            <h2 className="mt-1 text-xl font-bold text-earth-heading">{trashBin.nama}</h2>
                            <p className="mt-1 text-sm text-muted-earth">{trashBin.unit?.nama || '-'}</p>
                        </div>
                        <StatusBadge status={trashBin.status} type="trash" />
                    </div>
                    <p className="mt-4 text-sm text-grounded-charcoal">{trashBin.lokasi}</p>
                    <p className="mt-3 break-all rounded-md bg-river-stone px-3 py-2 font-mono text-xs text-muted-earth">
                        {reportUrl}
                    </p>
                </div>
            </section>
        </AppLayout>
    );
}
