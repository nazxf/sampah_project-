import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // === DESIGN.md Token Map ===
                // Primary green scale (nature-green #16a34a)
                primary: {
                    DEFAULT: '#16a34a',
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    950: '#052e16',
                },
                // Semantic neutral tokens (DESIGN.md named colors)
                'warm-chalk': '#f9fafb',      // Page background
                'river-stone': '#f3f4f6',     // Card/section alt bg
                'cloud-ash': '#d1d5db',       // Borders, dividers
                'muted-earth': '#6b7280',     // Secondary text
                'grounded-charcoal': '#374151', // Body text, labels
                'earth-heading': '#111827',   // Headings
                'field-indigo': '#6366f1',    // Focus rings, interactive signals
                'earth-red': '#dc2626',       // Danger, destructive actions
                // Status tong (sesuai spec geolocation)
                sipesa: {
                    green: '#16a34a',
                    'green-dark': '#15803d',
                    'green-light': '#22c55e',
                    empty: '#22c55e',   // hijau (0-40%)
                    medium: '#eab308',  // kuning (41-75%)
                    full: '#ef4444',    // merah (76-100%)
                    report: '#f97316',  // oranye (ikon !)
                },
            },
            boxShadow: {
                // DESIGN.md shadow vocabulary
                'ambient-sm': '0 1px 2px 0 rgba(0,0,0,0.05)',
                'ambient-md': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                'elevated-lg': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                'overlay-xl': '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                'green-glow': '0 4px 14px 0 rgba(22,163,74,0.25)',
            },
            animation: {
                'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'pulse-marker': 'pulse-marker 1.5s ease-in-out infinite',
                'fade-in': 'fade-in 0.7s ease-out both',
                'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
                'fade-in-down': 'fade-in-down 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float 9s ease-in-out infinite',
                'spin-slow': 'spin 26s linear infinite',
                'bounce-soft': 'bounce-soft 2.4s ease-in-out infinite',
            },
            keyframes: {
                'pulse-marker': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.15)', opacity: '0.8' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-down': {
                    '0%': { opacity: '0', transform: 'translateY(-24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-14px)' },
                },
                'bounce-soft': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },
        },
    },

    plugins: [forms],
};
