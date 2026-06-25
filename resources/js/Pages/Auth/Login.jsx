import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="px-6 py-8 sm:px-8">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-earth-heading">Selamat Datang</h2>
                    <p className="mt-2 text-sm text-muted-earth">Masuk ke akun Anda untuk melanjutkan</p>
                </div>

                {status && (
                    <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 border border-green-200">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-2 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel htmlFor="password" value="Kata Sandi" />
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-medium text-green-600 hover:text-green-700 transition"
                                >
                                    Lupa?
                                </Link>
                            )}
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-2 block w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-muted-earth">Ingat saya</span>
                    </div>

                    <PrimaryButton className="w-full justify-center py-3 text-base" disabled={processing}>
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Memproses...
                            </span>
                        ) : 'Masuk'}
                    </PrimaryButton>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-earth">
                        Belum punya akun?{' '}
                        <Link href={route('register')} className="font-semibold text-green-600 hover:text-green-700 transition">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
