import { useState } from 'react';
import QRCode from '@/Components/QRCode';
import StatusBadge from '@/Components/StatusBadge';
import { Head, useForm, usePage } from '@inertiajs/react';

const statusHelp = {
    penuh: 'Petugas akan melihat tong ini sebagai prioritas penuh.',
    setengah_penuh: 'Status tong diperbarui menjadi setengah penuh.',
    kosong: 'Status tong diperbarui menjadi belum penuh atau kosong.',
};

export default function Create({ trashBin, jenisMasalahLabels, statusOptions }) {
    const { props } = usePage();
    const flashSuccess = props.flash?.success;
    const flashError = props.flash?.error;
    const flashFotoUrl = props.flash?.foto_url;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const [preview, setPreview] = useState(null);

    const form = useForm({
        status_tong: 'penuh',
        jenis_masalah: '',
        nama_pelapor: '',
        deskripsi: '',
        foto: null,
    });

    const onFotoChange = (event) => {
        const file = event.target.files?.[0] || null;
        form.setData('foto', file);
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const selectedStatus = form.data.status_tong;
    const showIssueType = selectedStatus !== 'penuh';

    const submit = (event) => {
        event.preventDefault();
        form.post(route('public-reports.store', trashBin.kode), {
            preserveScroll: true,
            onSuccess: () => {
                if (preview) {
                    URL.revokeObjectURL(preview);
                }
                setPreview(null);
                form.setData({
                    status_tong: 'penuh',
                    jenis_masalah: '',
                    nama_pelapor: '',
                    deskripsi: '',
                    foto: null,
                });
            },
        });
    };

    return (
        <div className="min-h-screen bg-warm-chalk text-grounded-charcoal">
            <Head title={`Lapor ${trashBin.kode}`} />

            <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:py-10">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">SiPeSa QR</p>
                        <h1 className="mt-1 text-2xl font-bold text-earth-heading">Lapor Kondisi Tong</h1>
                    </div>
                    <div className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm sm:block">
                        Tanpa login
                    </div>
                </div>

                {flashSuccess && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                        {flashSuccess}
                    </div>
                )}
                {flashFotoUrl && (
                    <div className="mb-4 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
                        <p className="text-sm font-semibold text-primary-700">Bukti foto laporan Anda:</p>
                        <img
                            src={flashFotoUrl}
                            alt="Bukti laporan"
                            className="mt-2 max-h-56 rounded-lg border border-primary-200 object-contain"
                        />
                    </div>
                )}
                {flashError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                        {flashError}
                    </div>
                )}

                <section className="grid gap-4 lg:grid-cols-[260px,1fr]">
                    <div className="rounded-lg border border-cloud-ash bg-white p-5">
                        <div className="flex justify-center">
                            <QRCode value={currentUrl} size={188} title={`QR ${trashBin.kode}`} />
                        </div>
                        <div className="mt-4 text-center">
                            <p className="font-mono text-sm font-semibold text-earth-heading">{trashBin.kode}</p>
                            <p className="mt-1 text-sm font-semibold text-earth-heading">{trashBin.nama}</p>
                            <p className="mt-1 text-xs text-muted-earth">{trashBin.unit?.nama || '-'}</p>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <StatusBadge status={trashBin.status} type="trash" />
                        </div>
                    </div>

                    <form onSubmit={submit} className="rounded-lg border border-cloud-ash bg-white p-5">
                        <div className="border-b border-cloud-ash pb-4">
                            <h2 className="text-base font-semibold text-earth-heading">{trashBin.lokasi}</h2>
                            <p className="mt-1 text-sm text-muted-earth">
                                Pilih kondisi tong sesuai yang terlihat saat ini. Laporan langsung masuk ke data tong ini.
                            </p>
                        </div>

                        <div className="mt-5 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-earth-heading">Kondisi tong</label>
                                <div className="mt-2 grid gap-2">
                                    {statusOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                                                selectedStatus === option.value
                                                    ? 'border-primary-600 bg-green-50'
                                                    : 'border-cloud-ash bg-white hover:border-primary-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="status_tong"
                                                value={option.value}
                                                checked={selectedStatus === option.value}
                                                onChange={(event) => form.setData('status_tong', event.target.value)}
                                                className="mt-1 border-gray-300 text-primary-600 focus:ring-primary-600"
                                            />
                                            <span>
                                                <span className="block text-sm font-semibold text-earth-heading">{option.label}</span>
                                                <span className="mt-0.5 block text-xs text-muted-earth">{statusHelp[option.value]}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {form.errors.status_tong && <p className="mt-1 text-xs text-earth-red">{form.errors.status_tong}</p>}
                            </div>

                            {showIssueType && (
                                <div>
                                    <label className="block text-sm font-semibold text-earth-heading">Catatan kondisi</label>
                                    <select
                                        value={form.data.jenis_masalah}
                                        onChange={(event) => form.setData('jenis_masalah', event.target.value)}
                                        className="mt-2 w-full rounded-md border border-cloud-ash px-3 py-2 text-sm text-earth-heading focus:border-primary-600 focus:ring-primary-600"
                                    >
                                        <option value="">Tidak ada masalah lain</option>
                                        {Object.entries(jenisMasalahLabels)
                                            .filter(([value]) => value !== 'penuh')
                                            .map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                    </select>
                                    {form.errors.jenis_masalah && <p className="mt-1 text-xs text-earth-red">{form.errors.jenis_masalah}</p>}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-earth-heading">Nama pelapor</label>
                                <input
                                    type="text"
                                    value={form.data.nama_pelapor}
                                    onChange={(event) => form.setData('nama_pelapor', event.target.value)}
                                    placeholder="Opsional"
                                    className="mt-2 w-full rounded-md border border-cloud-ash px-3 py-2 text-sm text-earth-heading placeholder:text-muted-earth/60 focus:border-primary-600 focus:ring-primary-600"
                                />
                                {form.errors.nama_pelapor && <p className="mt-1 text-xs text-earth-red">{form.errors.nama_pelapor}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-earth-heading">Deskripsi tambahan</label>
                                <textarea
                                    value={form.data.deskripsi}
                                    onChange={(event) => form.setData('deskripsi', event.target.value)}
                                    rows={3}
                                    maxLength={300}
                                    placeholder="Contoh: tong sudah meluber, area depan kelas..."
                                    className="mt-2 w-full rounded-md border border-cloud-ash px-3 py-2 text-sm text-earth-heading placeholder:text-muted-earth/60 focus:border-primary-600 focus:ring-primary-600"
                                />
                                <div className="mt-1 flex justify-between text-xs text-muted-earth">
                                    <span>{form.errors.deskripsi || 'Opsional, maksimal 300 karakter.'}</span>
                                    <span>{form.data.deskripsi.length}/300</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-earth-heading">Bukti foto (opsional)</label>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={onFotoChange}
                                    className="mt-2 block w-full text-sm text-earth-heading file:mr-3 file:rounded-md file:border-0 file:bg-primary-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700"
                                />
                                <p className="mt-1 text-xs text-muted-earth">JPG/PNG/WebP, maksimal 5 MB. Foto menjadi bukti valid laporan Anda.</p>
                                {preview && (
                                    <img
                                        src={preview}
                                        alt="Preview bukti"
                                        className="mt-3 max-h-56 rounded-lg border border-cloud-ash object-contain"
                                    />
                                )}
                                {form.errors.foto && <p className="mt-1 text-xs text-earth-red">{form.errors.foto}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                        >
                            {form.processing ? 'Mengirim laporan...' : 'Kirim Laporan'}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}
