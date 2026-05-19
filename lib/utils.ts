import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with clsx + tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Calcula la distancia en km entre dos puntos usando la fórmula de Haversine.
 * Emula ST_Distance de PostGIS para desarrollo local con SQLite.
 */
export function calculateDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // 2 decimales
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Genera un código OTP de 6 dígitos
 */
export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Formatea un precio en Soles peruanos
 */
export function formatPEN(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
}

/**
 * Formatea una fecha legible en español
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Formatea fecha y hora
 */
export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Genera una URL de Google Maps para navegación
 */
export function getGoogleMapsDirectionsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Parsea un JSON string de forma segura, retornando el valor por defecto si falla
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
    try {
        return JSON.parse(json);
    } catch {
        return defaultValue;
    }
}

/**
 * Trunca un string a N caracteres con ellipsis
 */
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}
