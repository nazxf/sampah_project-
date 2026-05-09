export default function StatCard({ title, value, icon, color = 'green', subtext, trend }) {
    const colorMap = {
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        indigo: 'bg-indigo-100 text-indigo-600',
    };

    const trendColor = trend > 0 ? 'text-green-600' : 'text-red-600';
    const trendArrow = trend > 0 ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
    ) : trend < 0 ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
    ) : null;

    return (
        <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${colorMap[color] || colorMap.green}`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">{title}</p>
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-2xl font-bold text-gray-900">
                            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
                        </p>
                        {trend !== undefined && trend !== null && trend !== 0 && (
                            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                                {trendArrow}
                                {Math.abs(trend)}%
                            </span>
                        )}
                    </div>
                    {subtext && (
                        <p className="mt-0.5 text-xs text-gray-400">{subtext}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
