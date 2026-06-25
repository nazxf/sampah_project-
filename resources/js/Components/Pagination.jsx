import { Link } from '@inertiajs/react';

export default function Pagination({ links, meta }) {
    if (!links || links.length <= 3) return null;

    return (
        <nav className="flex items-center justify-between border-t border-cloud-ash pt-4">
            {/* Mobile: Previous / Next only */}
            <div className="flex flex-1 justify-between sm:hidden">
                {links.find((l) => l.label.includes('Previous'))?.url ? (
                    <Link
                        href={links.find((l) => l.label.includes('Previous')).url}
                        className="relative inline-flex items-center rounded-full border border-cloud-ash bg-white px-4 py-2 text-sm font-medium text-grounded-charcoal hover:bg-river-stone"
                    >
                        Sebelumnya
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center rounded-full border border-cloud-ash bg-river-stone px-4 py-2 text-sm font-medium text-cloud-ash cursor-not-allowed">
                        Sebelumnya
                    </span>
                )}
                {links.find((l) => l.label.includes('Next'))?.url ? (
                    <Link
                        href={links.find((l) => l.label.includes('Next')).url}
                        className="relative ml-3 inline-flex items-center rounded-full border border-cloud-ash bg-white px-4 py-2 text-sm font-medium text-grounded-charcoal hover:bg-river-stone"
                    >
                        Selanjutnya
                    </Link>
                ) : (
                    <span className="relative ml-3 inline-flex items-center rounded-full border border-cloud-ash bg-river-stone px-4 py-2 text-sm font-medium text-cloud-ash cursor-not-allowed">
                        Selanjutnya
                    </span>
                )}
            </div>

            {/* Desktop: Full page numbers */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    {meta && (
                        <p className="text-sm text-muted-earth">
                            Menampilkan{' '}
                            <span className="font-medium text-earth-heading">{meta.from || 0}</span>
                            {' '}sampai{' '}
                            <span className="font-medium text-earth-heading">{meta.to || 0}</span>
                            {' '}dari{' '}
                            <span className="font-medium text-earth-heading">{meta.total || 0}</span>
                            {' '}hasil
                        </p>
                    )}
                </div>
                <div>
                    <nav className="isolate inline-flex gap-1" aria-label="Pagination">
                        {links.map((link, i) => {
                            if (link.label.includes('Previous') || link.label.includes('Next')) return null;

                            if (link.label === '...') {
                                return (
                                    <span
                                        key={i}
                                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-muted-earth"
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
                                    className={`relative inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition duration-150 ease-out ${
                                        link.active
                                            ? 'z-10 bg-primary-600 text-white'
                                            : !link.url
                                                ? 'bg-river-stone text-cloud-ash cursor-not-allowed'
                                                : 'text-grounded-charcoal hover:bg-river-stone'
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
