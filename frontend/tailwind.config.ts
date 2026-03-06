/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#050C1F',
                    50: '#0F1A33',
                    100: '#0D162C',
                    200: '#0A1225',
                    300: '#080D1E',
                    400: '#060917',
                    500: '#050C1F',
                    600: '#030810',
                    700: '#020408',
                    800: '#010204',
                    900: '#000000',
                },
                accent: {
                    DEFAULT: '#00F0FF',
                    50: '#E6FCFF',
                    100: '#B3F5FF',
                    200: '#80EFFF',
                    300: '#4DE8FF',
                    400: '#1AE1FF',
                    500: '#00F0FF',
                    600: '#00C0CC',
                    700: '#009099',
                    800: '#006066',
                    900: '#003033',
                },
                navy: {
                    DEFAULT: '#050C1F',
                    light: '#0A1428',
                    dark: '#020408',
                },
                background: '#000000',
                surface: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    hover: 'rgba(255, 255, 255, 0.1)',
                },
            },
            fontFamily: {
                heading: ['Satoshi Black', 'Neue Haas Grotesk', 'Satoshi', 'General Sans', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(0, 240, 255, 0.3)',
                'glow-lg': '0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.2)',
                'glow-sm': '0 0 10px rgba(0, 240, 255, 0.2)',
                'inner-glow': 'inset 0 0 20px rgba(0, 240, 255, 0.1)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(180deg, #000000 0%, #020408 50%, #050C1F 100%)',
                'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1)' },
                    '100%': { boxShadow: '0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.2)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            borderRadius: {
                'DEFAULT': '8px',
                'lg': '12px',
                'xl': '16px',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
        },
    },
    plugins: [],
}
