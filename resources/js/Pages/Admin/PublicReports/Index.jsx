import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link } from '@inertiajs/react';

export default function Index({ reports }) {
    const jenisLabels = {
        penuh: 'Tong Penuh',
        rusak: 'Tong Rusak',
        bau: 'Bau Menyengat',
        hama: 'Hama/Serangga',
        pemilahan: 'Salah Pemilahan',
        lainnya: 'Lainnya',
    };

    return (
        <AppLayout>
            <Head title="Laporan Warga" />

            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-earth-heading">Laporan Warga (QR)</h1>
                    <p className="mt-1 text-sm text-muted-earth">
                        Laporan dari scan QR pada tong sampah. Bukti foto dapat digunakan untuk verifikasi.
                    </p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-cloud-ash bg-white">
                    <table className="min-w-full divide-y divide-cloud-ash text-sm">
                        <thead className="bg-cloud-ash/40 text-left text-xs uppercase tracking-wide text-muted-earth">
                            <tr>
                                <th className="px-4 py-3">Tiket</th>
                                <th className="px-4 py-3">Tong</th>
                                <th className="px-4 py-3">Jenis</th>
                                <th className="px-4 py-3">Pelapor</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Bukti</th>
                                <th className="px-4 py-3">Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cloud-ash">
                            {reports.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-earth">
                                        Belum ada laporan warga.
                                    </td>
                                </tr>
                            )}
                            {reports.data.map((r) => (
                                <tr key={r.id} className="hover:bg-cloud-ash/20">
                                    <td className="px-4 py-3 font-mono text-xs font-semibold text-earth-heading">
                                        {r.nomor_tiket}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-earth-heading">{r.trash_bin?.kode}</div>
                                        <div className="text-xs text-muted-earth">
                                            {r.trash_bin?.unit?.nama || '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-earth-heading">
                                        {jenisLabels[r.jenis_masalah] || r.jenis_masalah}
                                    </td>
                                    <td className="px-4 py-3 text-earth-heading">
                                        {r.nama_pelapor || <span className="text-muted-earth">Anonim</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={r.status} type="report" />
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.foto_url ? (
                                            <a href={r.foto_url} target="_blank" rel="noreferrer">
                                                <img
                                                    src={r.foto_url}
                                                    alt="Bukti"
                                                    className="h-14 w-14 rounded-md border border-cloud-ash object-cover"
                                                />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-muted-earth">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-earth">
                                        {new Date(r.created_at).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <Pagination links={reports.links} />
                </div>
            </div>
        </AppLayout>
    );
}
