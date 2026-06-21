import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Brofy | Todo lo que tu mascota necesita, en un solo lugar",
    description: "Desde veterinarias y spas hasta hospedajes y entrenadores. Olvídate de los papeles perdidos y las colas: reserva citas al instante con especialistas reales y lleva el historial médico digital de tu mascota siempre en tu celular.",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Brofy",
    },
    icons: {
        icon: [
            { url: "/brofy1.png", type: "image/png" },
            { url: "/favicon.ico", sizes: "any" }
        ],
        shortcut: "/favicon.ico",
        apple: "/brofy1.png",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#078EAD",
};

import { EmergencyLauncher } from "@/components/features/emergency/EmergencyLauncher";
import { I18nProvider } from "@/lib/i18n-context";
import { cookies } from "next/headers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let locale: "es" | "en" = "es";
    try {
        const cookieStore = cookies();
        const nextLocale = cookieStore.get("NEXT_LOCALE")?.value;
        if (nextLocale === "es" || nextLocale === "en") {
            locale = nextLocale as "es" | "en";
        }
    } catch (e) {
        // Fallback for static rendering
    }

    return (
        <html lang={locale}>
            <body className={`${inter.variable} font-sans antialiased text-slate-900 bg-surface-50`}>
                <I18nProvider initialLocale={locale}>
                    {children}
                    <EmergencyLauncher />
                    <Toaster position="top-center" richColors />
                </I18nProvider>
            </body>
        </html>
    );
}
