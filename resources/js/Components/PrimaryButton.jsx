export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition duration-150 ease-out hover:bg-primary-700 hover:shadow-green-glow focus:outline-none focus:ring-2 focus:ring-field-indigo focus:ring-offset-2 active:bg-primary-900 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
