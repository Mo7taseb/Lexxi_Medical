/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Medical theme colors
                'medical-blue': '#0066cc',
                'medical-green': '#00a86b',
                'medical-red': '#dc2626',
                'medical-amber': '#f59e0b',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
            },
            fontFamily: {
                'inter': ['Inter', 'system-ui', 'sans-serif'],
                'cairo': ['Cairo', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
