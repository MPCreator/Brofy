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
        timeZone: 'America/Lima',
    });
}

/**
 * Formatea fecha y hora en zona horaria de Perú
 */
export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Lima',
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

/**
 * Determina si un servicio es de naturaleza no clínica (estética, paseo, cuidado, etc.)
 */
export function checkIfNonClinical(serviceType?: string): boolean {
    if (!serviceType) return false;
    const name = serviceType.toLowerCase();
    return (
        name.includes('grooming') ||
        name.includes('baño') ||
        name.includes('bañ') ||
        name.includes('corte') ||
        name.includes('paseo') ||
        name.includes('pasear') ||
        name.includes('hospedaje') ||
        name.includes('guardería') ||
        name.includes('peluquería') ||
        name.includes('esteti') ||
        name.includes('estéti') ||
        name.includes('aesthetic') ||
        name.includes('walk') ||
        name.includes('bath') ||
        name.includes('care')
    );
}

/**
 * Retorna la zona horaria (IANA) basada en el código de país.
 * Por defecto es 'America/Lima' (Perú).
 */
export function getTimezoneByCountry(countryCode?: string): string {
    const code = (countryCode || 'PE').toUpperCase();
    switch (code) {
        case 'CL':
            return 'America/Santiago';
        case 'MX':
            return 'America/Mexico_City';
        case 'CO':
            return 'America/Bogota';
        case 'AR':
            return 'America/Argentina/Buenos_Aires';
        case 'UY':
            return 'America/Montevideo';
        case 'EC':
            return 'America/Guayaquil';
        case 'PE':
        default:
            return 'America/Lima';
    }
}

/**
 * Obtiene el offset de zona horaria (ej: "-05:00", "+01:00", "Z") para una zona horaria IANA
 * en un momento específico (por defecto, ahora).
 */
export function getTimezoneOffsetString(timeZone: string, date: Date = new Date()): string {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            timeZoneName: 'longOffset',
        });
        const parts = formatter.formatToParts(date);
        const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || '';
        
        if (offsetPart === 'GMT') return 'Z';
        
        const match = offsetPart.match(/GMT([-+])(\d{1,2}):?(\d{2})?/);
        if (match) {
            const sign = match[1];
            const hours = match[2].padStart(2, '0');
            const minutes = match[3] || '00';
            return `${sign}${hours}:${minutes}`;
        }
        return '-05:00';
    } catch {
        return '-05:00';
    }
}

/**
 * Retorna la fecha local en formato "YYYY-MM-DD" según la zona horaria indicada (o la de Perú).
 */
export function getLocalLocalDateString(date?: Date | string, timeZone: string = 'America/Lima'): string {
    const d = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
    const parts = formatter.formatToParts(d);
    const year = parts.find(p => p.type === 'year')?.value || '0';
    const month = parts.find(p => p.type === 'month')?.value || '0';
    const day = parts.find(p => p.type === 'day')?.value || '0';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Retorna el inicio del día (00:00:00) de la fecha dada en la zona horaria indicada,
 * expresado como un objeto Date en UTC (listo para consultas en base de datos).
 */
export function getLocalStartOfDay(date?: Date | string, timeZone: string = 'America/Lima'): Date {
    const localDateStr = getLocalLocalDateString(date, timeZone);
    const offset = getTimezoneOffsetString(timeZone);
    return new Date(`${localDateStr}T00:00:00${offset}`);
}

/**
 * Retorna el final del día (23:59:59.999) en la zona horaria indicada,
 * expresado como un objeto Date en UTC.
 */
export function getLocalEndOfDay(date?: Date | string, timeZone: string = 'America/Lima'): Date {
    const localDateStr = getLocalLocalDateString(date, timeZone);
    const offset = getTimezoneOffsetString(timeZone);
    return new Date(`${localDateStr}T23:59:59.999${offset}`);
}

/**
 * Parsea una fecha local (ISO sin zona, ej. "2026-07-07T08:00")
 * y le añade el offset de la zona horaria indicada para resolverla en UTC.
 */
export function parseLocalTimeZoneDate(dateStr: string, timeZone: string = 'America/Lima'): Date {
    if (!dateStr) return new Date();
    if (dateStr.endsWith('Z') || /[-+]\d{2}:\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
    }
    const offset = getTimezoneOffsetString(timeZone);
    return new Date(`${dateStr}${offset}`);
}

// Wrappers compatibles para mantener compatibilidad con las vistas existentes que apuntan directamente a Perú
export function getPeruLocalDateString(date?: Date | string): string {
    return getLocalLocalDateString(date, 'America/Lima');
}

export function getPeruStartOfDay(date?: Date | string): Date {
    return getLocalStartOfDay(date, 'America/Lima');
}

export function getPeruEndOfDay(date?: Date | string): Date {
    return getLocalEndOfDay(date, 'America/Lima');
}

export function parsePeruDate(dateStr: string): Date {
    return parseLocalTimeZoneDate(dateStr, 'America/Lima');
}

