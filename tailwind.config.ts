import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eefbfe',
                    100: '#d0f4fc',
                    200: '#a1e9fa',
                    300: '#72def7',
                    400: '#43d3f5',
                    500: '#0ba7c8',
                    600: '#078EAD',
                    700: '#05728a',
                    800: '#045668',
                    900: '#033b47',
                    950: '#011e25',
                },
                emergency: {
                    500: '#ef4444', // Red-500
                    600: '#dc2626', // Red-600
                },
                surface: {
                    50: '#f8fafc', // Slate-50
                    100: '#f1f5f9', // Slate-100
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                'floating': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            }
        },
    },
    plugins: [],
};
export default config;
