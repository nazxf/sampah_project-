export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-full bg-transparent px-6 py-3 text-sm font-medium text-grounded-charcoal transition duration-150 ease-out hover:bg-river-stone focus:outline-none focus:ring-2 focus:ring-field-indigo focus:ring-offset-2 disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
