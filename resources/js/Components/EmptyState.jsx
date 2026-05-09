import { Link } from '@inertiajs/react';

export default function EmptyState({ icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            {icon && (
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
                <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
            )}
            {action && action.label && action.url && (
                <div className="mt-6">
                    <Link
                        href={action.url}
                        className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        {action.label}
                    </Link>
                </div>
            )}
        </div>
    );
}
