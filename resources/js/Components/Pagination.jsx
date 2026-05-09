import { Link } from '@inertiajs/react';

export default function Pagination({ links, meta }) {
    if (!links || links.length <= 3) return null;

    return (
        <nav className="flex items-center justify-between border-t border-gray-200 pt-4">
            {/* Mobile: Previous / Next only */}
            <div className="flex flex-1 justify-between sm:hidden">
                {links.find((l) => l.label.includes('Previous'))?.url ? (
                    <Link
                        href={links.find((l) => l.label.includes('Previous')).url}
                        className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Sebelumnya
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">
                        Sebelumnya
                    </span>
                )}
                {links.find((l) => l.label.includes('Next'))?.url ? (
                    <Link
                        href={links.find((l) => l.label.includes('Next')).url}
                        className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Selanjutnya
                    </Link>
                ) : (
                    <span className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">
                        Selanjutnya
                    </span>
                )}
            </div>

            {/* Desktop: Full page numbers */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    {meta && (
                        <p className="text-sm text-gray-700">
                            Menampilkan{' '}
                            <span className="font-medium">{meta.from || 0}</span>
                            {' '}sampai{' '}
                            <span className="font-medium">{meta.to || 0}</span>
                            {' '}dari{' '}
                            <span className="font-medium">{meta.total || 0}</span>
                            {' '}hasil
                        </p>
                    )}
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                        {links.map((link, i) => {
                            if (link.label.includes('Previous') || link.label.includes('Next')) return null;

                            if (link.label === '...') {
                                return (
                                    <span
                                        key={i}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                                        link.active
                                            ? 'z-10 bg-green-600 border-green-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
                                            : !link.url
                                                ? 'bg-gray-50 border-gray-300 text-gray-300 cursor-not-allowed'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </nav>
                </div>
            </div>
        </nav>
    );
}
