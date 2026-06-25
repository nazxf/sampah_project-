// Brand mark for SiPeSa: a circular eco badge with three recycling arrows.
// Self-contained fills so it renders consistently regardless of parent color.
//   tone="green" (default) -> green badge + white arrows  (use on light/dark bg)
//   tone="light"           -> white badge + green arrows  (use on green/solid bg)
export default function BrandMark({ className = '', tone = 'green', ...rest }) {
    const isLight = tone === 'light';
    const badge = isLight ? '#ffffff' : '#16a34a';
    const badgeEdge = isLight ? '#dcfce7' : '#15803d';
    const arrow = isLight ? '#16a34a' : '#ffffff';

    return (
        <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SiPeSa" {...rest}>
            <circle cx="24" cy="24" r="22" fill={badge} />
            <path d="M24 3 A21 21 0 0 1 45 24 L41 24 A17 17 0 0 0 24 7 Z" fill={badgeEdge} opacity="0.55" />
            <circle cx="24" cy="24" r="22" fill="none" stroke={badgeEdge} strokeWidth="1" opacity="0.5" />
            <g transform="translate(24 24)">
                {[0, 120, 240].map((a) => (
                    <g key={a} transform={`rotate(${a})`}>
                        <path d="M -10 -4 Q 0 -13 9 -6" stroke={arrow} strokeWidth="3.2" fill="none" strokeLinecap="round" />
                        <path d="M 9 -6 L 14.5 -9 L 11 -1.5 Z" fill={arrow} />
                    </g>
                ))}
            </g>
        </svg>
    );
}
