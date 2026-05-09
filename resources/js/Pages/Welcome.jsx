import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ canLogin, canRegister }) {
    return (
        <>
            <Head title="Selamat Datang" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="h-9 w-9" />
                                <span className="text-xl font-bold text-gray-900">SiPeSa</span>
                            </div>
                            <nav className="flex items-center gap-4">
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-green-700 transition-all duration-200 shadow-sm"
                                    >
                                        Daftar
                                    </Link>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Sistem Informasi Pengelolaan Sampah
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Kelola Sampah{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                                Lebih Cerdas
                            </span>
                        </h1>

                        <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            Platform monitoring dan pengelolaan sampah terintegrasi untuk Kampus B.
                            Pantau status tong sampah, laporkan aduan, dan kelola pengangkutan dalam satu sistem.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            {canRegister && (
                                <Link
                                    href={route('register')}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-green-600 border border-transparent rounded-xl text-base font-semibold text-white hover:bg-green-700 transition-all duration-200 shadow-lg shadow-green-200"
                                >
                                    Mulai Sekarang
                                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            )}
                            {canLogin && (
                                <Link
                                    href={route('login')}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-700 hover:border-green-300 hover:text-green-700 transition-all duration-200"
                                >
                                    Masuk Akun
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: (
                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                ),
                                title: 'Monitoring Real-time',
                                desc: 'Pantau status tong sampah di seluruh unit kampus secara real-time.',
                            },
                            {
                                icon: (
                                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                ),
                                title: 'Jadwal Pengangkutan',
                                desc: 'Kelola jadwal dan catat setiap aktivitas pengangkutan sampah.',
                            },
                            {
                                icon: (
                                    <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                                    </svg>
                                ),
                                title: 'Aduan Cepat',
                                desc: 'Laporkan tong sampah penuh dengan foto dan deskripsi secara instan.',
                            },
                            {
                                icon: (
                                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                ),
                                title: 'Laporan Lengkap',
                                desc: 'Generate laporan harian, mingguan, bulanan dalam format PDF dan Excel.',
                            },
                        ].map((feature, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Units Section */}
                    <div className="mt-20 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Unit Kampus B</h2>
                        <p className="text-gray-600 mb-8">7 unit yang terintegrasi dalam sistem</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['SD', 'SMP', 'SMA', 'TK', 'BTM', 'Sumart', 'UMCI'].map((unit) => (
                                <span key={unit} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200">
                                    {unit}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-20 text-center text-sm text-gray-500 pb-8">
                        &copy; {new Date().getFullYear()} SiPeSa &mdash; Sistem Informasi Pengelolaan Sampah Kampus B
                    </footer>
                </main>
            </div>
        </>
    );
}
