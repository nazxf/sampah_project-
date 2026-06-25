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

export default function Show({ complaint }) {
    const { props } = usePage();
    const role = props.auth?.user?.role;
    const backRoute = role === 'siswa' ? 'siswa.aduan.index' : 'admin.complaints.index';

    return (
        <AppLayout header="Detail Aduan">
            <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-cloud-ash bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={complaint.status} type="complaint" />
                            <span className="text-xs text-muted-earth">{formatDate(complaint.created_at)}</span>
                        </div>
                        <h2 className="mt-2 text-lg font-semibold text-earth-heading">{complaint.judul}</h2>
                        <p className="mt-1 text-sm text-muted-earth">
                            {complaint.trash_bin?.kode || '-'} | {complaint.trash_bin?.unit?.nama || 'Unit tidak tersedia'}
                        </p>
                    </div>
                    <Link
                        href={route(backRoute)}
                        className="rounded-full border border-cloud-ash px-4 py-2 text-sm font-medium text-grounded-charcoal transition hover:bg-river-stone"
                    >
                        Kembali
                    </Link>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="rounded-lg border border-cloud-ash bg-white p-5">
                        <p className="text-xs font-medium text-muted-earth">Deskripsi</p>
                        <div className="mt-2 whitespace-pre-line text-sm leading-6 text-grounded-charcoal">
                            {complaint.deskripsi}
                        </div>

                        {complaint.foto_url && (
                            <div className="mt-5 border-t border-cloud-ash pt-5">
                                <p className="mb-2 text-xs font-medium text-muted-earth">Foto Aduan</p>
                                <a href={complaint.foto_url} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={complaint.foto_url}
                                        alt="Foto aduan"
                                        className="max-h-80 rounded-lg border border-cloud-ash object-cover"
                                    />
                                </a>
                            </div>
                        )}

                        <div className="mt-5 border-t border-cloud-ash pt-5">
                            <p className="text-xs font-medium text-muted-earth">Tanggapan</p>
                            {complaint.tanggapan ? (
                                <div className="mt-2 rounded-lg bg-river-stone p-4 text-sm leading-6 text-grounded-charcoal">
                                    <p className="whitespace-pre-line">{complaint.tanggapan}</p>
                                    <p className="mt-3 text-xs text-muted-earth">
                                        Oleh {complaint.ditanggapi_oleh?.name || '-'} pada {formatDate(complaint.ditanggapi_pada)}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-muted-earth">Belum ada tanggapan.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-cloud-ash bg-white p-5">
                        <h3 className="text-sm font-semibold text-earth-heading">Informasi Aduan</h3>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div>
                                <dt className="text-xs font-medium text-muted-earth">Pelapor</dt>
                                <dd className="mt-1 text-earth-heading">{complaint.user?.name || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-muted-earth">Tong</dt>
                                <dd className="mt-1 text-earth-heading">
                                    {complaint.trash_bin?.kode || '-'} - {complaint.trash_bin?.nama || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-muted-earth">Lokasi</dt>
                                <dd className="mt-1 text-earth-heading">{complaint.trash_bin?.lokasi || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-muted-earth">Unit</dt>
                                <dd className="mt-1 text-earth-heading">{complaint.trash_bin?.unit?.nama || '-'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
