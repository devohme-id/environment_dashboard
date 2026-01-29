/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#be185d',
                'status-safe': '#22c55e',
                'status-warning': '#f59e0b',
                'status-danger': '#ef4444',
                'status-anomaly': '#a855f7',
                'brand-bg': '#f1f5f9',
            },
            fontFamily: {
                sans: ['"LGEI Text"', 'sans-serif'],
                headline: ['"LGEI Headline"', 'sans-serif'],
            },
            keyframes: {
                'flash-warning': {
                    '0%, 100%': { backgroundColor: '#fef3c7' }, // amber-100
                    '50%': { backgroundColor: '#fbbf24' },      // amber-400 - Deeper User Request
                },
                'flash-danger': {
                    '0%, 100%': { backgroundColor: '#fee2e2' }, // red-100
                    '50%': { backgroundColor: '#f87171' },      // red-400
                },
                'flash-anomaly': {
                    '0%, 100%': { backgroundColor: '#f3e8ff' }, // purple-100
                    '50%': { backgroundColor: '#c084fc' },      // purple-400
                },
                'flow': {
                    '0%': { opacity: '0.3', transform: 'translateX(-2px)' },
                    '50%': { opacity: '1', transform: 'translateX(0)' },
                    '100%': { opacity: '0.3', transform: 'translateX(2px)' },
                },
                'shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-2px)' },
                    '75%': { transform: 'translateX(2px)' },
                }
            },
            animation: {
                'flash-warning': 'flash-warning 3s infinite',
                'flash-danger': 'flash-danger 3s infinite',
                'flash-anomaly': 'flash-anomaly 3s infinite',
                'flow': 'flow 1.5s ease-in-out infinite',
                'shake': 'shake 0.5s ease-in-out infinite',
            }
        },
    },
    plugins: [],
}
