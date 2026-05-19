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
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9', // Sky blue-ish
                    600: '#0284c7', // Brand Color
                    700: '#0369a1',
                    900: '#0c4a6e',
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
