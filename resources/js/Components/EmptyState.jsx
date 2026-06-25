import { Link } from '@inertiajs/react';

export default function EmptyState({ icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            {icon && (
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-river-stone text-muted-earth">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-earth-heading">{title}</h3>
            {description && (
                <p className="mt-2 max-w-sm text-sm text-muted-earth">{description}</p>
            )}
            {action && action.label && action.url && (
                <div className="mt-6">
                    <Link
                        href={action.url}
                        className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition duration-150 ease-out hover:bg-primary-700 hover:shadow-green-glow focus:outline-none focus:ring-2 focus:ring-field-indigo focus:ring-offset-2"
                    >
                        {action.label}
                    </Link>
                </div>
            )}
        </div>
    );
}
