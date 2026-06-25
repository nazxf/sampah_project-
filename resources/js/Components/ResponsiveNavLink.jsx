import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-field-indigo bg-field-indigo/10 text-primary-700 focus:border-field-indigo focus:bg-field-indigo/20 focus:text-primary-800'
                    : 'border-transparent text-grounded-charcoal hover:border-cloud-ash hover:bg-river-stone hover:text-earth-heading focus:border-cloud-ash focus:bg-river-stone focus:text-earth-heading'
            } text-base font-medium transition duration-150 ease-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
