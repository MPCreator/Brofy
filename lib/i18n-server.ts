import { cookies, headers } from 'next/headers'
import es from '../locales/es.json'
import en from '../locales/en.json'

type Locale = 'es' | 'en'

const dictionaries: Record<Locale, any> = {
    es,
    en
}

const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split('.')
    let current = obj
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key]
        } else {
            return path
        }
    }
    return typeof current === 'string' ? current : path
}

export function getTranslation() {
    let locale: Locale = 'es'

    try {
        const cookieStore = cookies()
        const nextLocale = cookieStore.get('NEXT_LOCALE')?.value
        if (nextLocale === 'es' || nextLocale === 'en') {
            locale = nextLocale as Locale
        } else {
            const reqHeaders = headers()
            const xLocale = xLocaleHeader(reqHeaders)
            if (xLocale === 'es' || xLocale === 'en') {
                locale = xLocale as Locale
            }
        }
    } catch (e) {
        // Fallback en compilación estática o entornos sin request context
    }

    const t = (path: string): string => {
        const dict = dictionaries[locale] || dictionaries.es
        const val = getNestedValue(dict, path)
        if (val === path && locale !== 'es') {
            return getNestedValue(dictionaries.es, path)
        }
        return val
    }

    return { locale, t }
}

function xLocaleHeader(headersList: Headers): string | null {
    return headersList.get('x-locale')
}
