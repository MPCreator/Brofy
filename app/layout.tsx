import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Brofy | Servicios para Mascotas",
    description: "Reserva veterinarias, grooming y más en minutos. Atención de emergencias 24/7.",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#0284c7",
};

import { EmergencyLauncher } from "@/components/features/emergency/EmergencyLauncher";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${inter.variable} font-sans antialiased text-slate-900 bg-surface-50`}>
                {children}
                <EmergencyLauncher />
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
