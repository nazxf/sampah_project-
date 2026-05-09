import Dropdown from '@/Components/Dropdown';
import { Link, usePage, router } from '@inertiajs/react';
import { Menu, Transition } from '@headlessui/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const roleNavConfig = {
    super_admin: [
        { label: 'Dasbor', route: 'dashboard', icon: 'dashboard' },
        { label: 'Unit', route: 'super-admin.units.index', icon: 'unit' },
        { label: 'Tong Sampah', route: 'admin.trash-bins.index', icon: 'trash' },
        { label: 'Monitoring', route: 'admin.monitoring', icon: 'monitoring' },
        { label: 'Pengangkutan', route: 'admin.trash-histories.index', icon: 'truck' },
        { label: 'Aduan', route: 'admin.complaints.index', icon: 'complaint' },
        { label: 'Laporan', route: 'admin.reports.index', icon: 'report' },
        { label: 'Pengguna', route: 'admin.users.index', icon: 'users' },
    ],
    admin_unit: [
        { label: 'Dasbor', route: 'dashboard', icon: 'dashboard' },
        { label: 'Tong Sampah', route: 'admin.trash-bins.index', icon: 'trash' },
        { label: 'Monitoring', route: 'admin.monitoring', icon: 'monitoring' },
        { label: 'Pengangkutan', route: 'admin.trash-histories.index', icon: 'truck' },
        { label: 'Aduan', route: 'admin.complaints.index', icon: 'complaint' },
        { label: 'Laporan', route: 'admin.reports.index', icon: 'report' },
        { label: 'Pengguna', route: 'admin.users.index', icon: 'users' },
    ],
    petugas: [
        { label: 'Dasbor', route: 'dashboard', icon: 'dashboard' },
        { label: 'Monitoring', route: 'petugas.monitoring', icon: 'monitoring' },
        { label: 'Pengangkutan', route: 'petugas.pengangkutan.index', icon: 'truck' },
    ],
    siswa: [
        { label: 'Dasbor', route: 'dashboard', icon: 'dashboard' },
        { label: 'Monitoring', route: 'siswa.monitoring', icon: 'monitoring' },
        { label: 'Aduan Saya', route: 'siswa.aduan.index', icon: 'complaint' },
    ],
};

function getMobileBottomNav(role) {
    const base = [
        { label: 'Dasbor', route: 'dashboard', icon: 'dashboard' },
    ];

    if (role === 'super_admin' || role === 'admin_unit') {
        base.push({ label: 'Monitoring', route: 'admin.monitoring', icon: 'monitoring' });
        base.push({ label: 'Tong', route: 'admin.trash-bins.index', icon: 'trash' });
        base.push({ label: 'Aduan', route: 'admin.complaints.index', icon: 'complaint' });
        base.push({ label: 'Laporan', route: 'admin.reports.index', icon: 'report' });
    } else if (role === 'petugas') {
        base.push({ label: 'Monitoring', route: 'petugas.monitoring', icon: 'monitoring' });
        base.push({ label: 'Angkut', route: 'petugas.pengangkutan.index', icon: 'truck' });
        base.push({ label: 'Profil', route: 'profile.edit', icon: 'profile' });
    } else {
        base.push({ label: 'Monitoring', route: 'siswa.monitoring', icon: 'monitoring' });
        base.push({ label: 'Aduan', route: 'siswa.aduan.index', icon: 'complaint' });
        base.push({ label: 'Profil', route: 'profile.edit', icon: 'profile' });
    }

    if (base.length < 5 && role === 'petugas') {
        base.push({ label: 'Dasbor', route: 'dashboard', icon: 'dashboard' });
    }

    return base;
}

const iconMap = {
    dashboard: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
    ),
    unit: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-5.25 0v15m3-12h.75M16.5 15.75h.75" />
        </svg>
    ),
    trash: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
    ),
    monitoring: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Zm0 0V3m0 0a9 9 0 0 1 9 9m-9-9a9 9 0 0 0-9 9" />
        </svg>
    ),
    truck: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
    ),
    complaint: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
    ),
    report: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
    ),
    users: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
    ),
    profile: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
    ),
    logout: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
        </svg>
    ),
};

export default function AppLayout({ header, children }) {
    const { url, props } = usePage();
    const user = props.auth.user;
    const role = user.role;
    const navItems = roleNavConfig[role] || roleNavConfig.siswa;
    const bottomNavItems = getMobileBottomNav(role);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const cleanup = router.on('navigate', () => {
            setSidebarOpen(false);
        });
        return cleanup;
    }, []);

    useEffect(() => {
        const flash = props.flash;
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: flash.success,
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        }
        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: flash.error,
                timer: 4000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        }
    }, [props.flash]);

    const isActive = (routeName) => {
        if (!routeName) return false;
        try {
            return route().current(routeName);
        } catch {
            return url.startsWith(route(routeName));
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop: fixed, Mobile: slide over */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-green-700 to-green-900 text-white transition-transform duration-300 ease-out lg:sticky lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand */}
                <div className="flex h-16 shrink-0 items-center gap-3 border-b border-green-600 px-4">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                            </svg>
                        </div>
                    </Link>
                    <div>
                        <p className="text-sm font-semibold">SiPeSa</p>
                        <p className="text-xs text-green-200 capitalize">{role.replace('_', ' ')}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-green-300">Menu Utama</p>
                    <ul className="space-y-0.5">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={route(item.route)}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                        isActive(item.route)
                                            ? 'bg-green-800 text-white'
                                            : 'text-green-100 hover:bg-green-700'
                                    }`}
                                >
                                    <span className="shrink-0">{iconMap[item.icon]}</span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="shrink-0 border-t border-green-600 p-3">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-green-100 transition-all duration-150 hover:bg-green-700"
                    >
                        <span className="shrink-0">{iconMap.logout}</span>
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Top header bar */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    <div className="flex-1 min-w-0">
                        {header ? (
                            <h1 className="truncate text-base font-semibold text-gray-900">{header}</h1>
                        ) : (
                            <h1 className="truncate text-base font-semibold text-gray-900">Dasbor</h1>
                        )}
                    </div>

                    {/* User dropdown */}
                    <div className="relative">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden sm:inline font-medium">{user.name}</span>
                                    <svg className="hidden sm:block h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profil
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Keluar
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile bottom navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 lg:hidden">
                <div className="flex h-16">
                    {bottomNavItems.slice(0, 5).map((item, index) => (
                        <Link
                            key={index}
                            href={route(item.route)}
                            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
                                isActive(item.route)
                                    ? 'text-green-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="h-5 w-5">{iconMap[item.icon]}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}
