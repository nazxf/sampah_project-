import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import { Link, usePage } from '@inertiajs/react';

function formatDate(value) {
    if (!value) return '-';

    try {
        return new Date(value).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

function hasConfirmationCoordinates(history) {
    return history?.latitude_konfirmasi !== null
        && history?.latitude_konfirmasi !== undefined
        && history?.longitude_konfirmasi !== null
        && history?.longitude_konfirmasi !== undefined;
}

function confirmationMapUrl(history) {
    return `https://www.openstreetmap.org/?mlat=${history.latitude_konfirmasi}&mlon=${history.longitude_konfirmasi}#map=18/${history.latitude_konfirmasi}/${history.longitude_konfirmasi}`;
}

export default function Show({ history }) {
    const { props } = usePage();
    const role = props.auth?.user?.role;
    const backRoute = role === 'petugas' ? 'petugas.pengangkutan.index' : 'admin.trash-histories.index';

    return (
        <AppLayout header="Detail Riwayat Pengangkutan">
            <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-cloud-ash bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase text-muted-earth">{formatDate(history.tanggal)}</p>
                        <h2 className="mt-1 text-lg font-semibold text-earth-heading">
                            {history.trash_bin?.kode || '-'} - {history.trash_bin?.nama || '-'}
                        </h2>
                        <p className="mt-1 text-sm text-muted-earth">
                            {history.trash_bin?.unit?.nama || 'Unit tidak tersedia'} | {history.trash_bin?.lokasi || 'Lokasi tidak tersedia'}
                        </p>
                    </div>
                    <Link
                        href={route(backRoute)}
                        className="rounded-full border border-cloud-ash px-4 py-2 text-sm font-medium text-grounded-charcoal transition hover:bg-river-stone"
                    >
                        Kembali
                    </Link>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-lg border border-cloud-ash bg-white p-5">
                        <h3 className="text-sm font-semibold text-earth-heading">Status Pengangkutan</h3>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <StatusBadge status={history.status_sebelum} type="trash" />
                            <span className="text-muted-earth">menjadi</span>
                            <StatusBadge status={history.status_sesudah} type="trash" />
                        </div>

                        <div className="mt-5 border-t border-cloud-ash pt-5">
                            <p className="text-xs font-medium text-muted-earth">Catatan</p>
                            <div className="mt-2 whitespace-pre-line text-sm leading-6 text-grounded-charcoal">
                                {history.catatan || 'Tidak ada catatan.'}
                            </div>
                        </div>

                        {history.foto_url && (
                            <div className="mt-5 border-t border-cloud-ash pt-5">
                                <p className="mb-2 text-xs font-medium text-muted-earth">Foto Pengangkutan</p>
                                <a href={history.foto_url} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={history.foto_url}
                                        alt="Foto pengangkutan"
                                        className="max-h-80 rounded-lg border border-cloud-ash object-cover"
                                    />
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg border border-cloud-ash bg-white p-5">
                            <h3 className="text-sm font-semibold text-earth-heading">Informasi Petugas</h3>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div>
                                    <dt className="text-xs font-medium text-muted-earth">Petugas</dt>
                                    <dd className="mt-1 text-earth-heading">{history.user?.name || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-earth">Tanggal</dt>
                                    <dd className="mt-1 text-earth-heading">{formatDate(history.tanggal)}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-lg border border-cloud-ash bg-white p-5">
                            <h3 className="text-sm font-semibold text-earth-heading">Lokasi Konfirmasi</h3>
                            {hasConfirmationCoordinates(history) ? (
                                <div className="mt-4 space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs font-medium text-muted-earth">Koordinat petugas</p>
                                        <p className="mt-1 font-mono text-earth-heading">
                                            {Number(history.latitude_konfirmasi).toFixed(6)}, {Number(history.longitude_konfirmasi).toFixed(6)}
                                        </p>
                                    </div>
                                    {history.jarak_konfirmasi_meter !== null && history.jarak_konfirmasi_meter !== undefined && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-earth">Jarak dari tong</p>
                                            <p className="mt-1 text-earth-heading">{Number(history.jarak_konfirmasi_meter).toFixed(1)} m</p>
                                        </div>
                                    )}
                                    <a
                                        href={confirmationMapUrl(history)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex rounded-full bg-[#16a34a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803d]"
                                    >
                                        Buka Titik di Peta
                                    </a>
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-muted-earth">Belum ada koordinat konfirmasi.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
