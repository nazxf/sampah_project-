import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ units = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        no_telepon: '',
        unit_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <div className="px-6 py-8 sm:px-8">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-earth-heading">Buat Akun Baru</h2>
                    <p className="mt-2 text-sm text-muted-earth">Daftar sebagai siswa untuk mulai melapor</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-2 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nama Anda"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-2 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="no_telepon" value="No. Telepon (Opsional)" />
                        <TextInput
                            id="no_telepon"
                            name="no_telepon"
                            value={data.no_telepon}
                            className="mt-2 block w-full"
                            autoComplete="tel"
                            onChange={(e) => setData('no_telepon', e.target.value)}
                            placeholder="0812-3456-7890"
                        />
                        <InputError message={errors.no_telepon} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="unit_id" value="Unit / Sekolah" />
                        <select
                            id="unit_id"
                            name="unit_id"
                            value={data.unit_id}
                            onChange={(e) => setData('unit_id', e.target.value)}
                            className="mt-2 block w-full rounded-lg border-cloud-ash bg-white px-4 py-3 text-grounded-charcoal shadow-sm transition focus:border-primary-500 focus:ring-primary-500"
                            required
                        >
                            <option value="">Pilih unit</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.nama}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.unit_id} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="password" value="Kata Sandi" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Min. 8 karakter"
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-2 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Ulangi kata sandi"
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                    </div>

                    <PrimaryButton className="w-full justify-center py-3 text-base" disabled={processing}>
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Mendaftar...
                            </span>
                        ) : 'Daftar'}
                    </PrimaryButton>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-earth">
                        Sudah punya akun?{' '}
                        <Link href={route('login')} className="font-semibold text-green-600 hover:text-green-700 transition">
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
