'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import es from '../locales/es.json'
import en from '../locales/en.json'

type Dictionary = typeof es
type Locale = 'es' | 'en'

const dictionaries: Record<Locale, any> = {
    es,
    en
}

interface I18nContextType {
    locale: Locale
    t: (path: string) => string
    changeLocale: (newLocale: Locale) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

// Helper function to resolve nested translation keys (e.g., "nav.home")
const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split('.')
    let current = obj
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key]
        } else {
            return path // Fallback to path key itself if not found
        }
    }
    return typeof current === 'string' ? current : path
}

export function I18nProvider({ 
    children, 
    initialLocale = 'es' 
}: { 
    children: React.ReactNode
    initialLocale?: Locale 
}) {
    const [locale, setLocale] = useState<Locale>(initialLocale)

    // Sync state with cookie on client side if cookie is already set
    useEffect(() => {
        const match = document.cookie.match(/(^|;)\s*NEXT_LOCALE\s*=\s*([^;]+)/)
        if (match && (match[2] === 'es' || match[2] === 'en')) {
            setLocale(match[2] as Locale)
        }
    }, [])

    const changeLocale = (newLocale: Locale) => {
        setLocale(newLocale)
        // Set cookie with 1 year expiration
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
        // Refresh routing to apply changes to Server Components
        window.location.reload()
    }

    const t = (path: string): string => {
        const dict = dictionaries[locale] || dictionaries.es
        const val = getNestedValue(dict, path)
        if (val === path && locale !== 'es') {
            // Fallback to spanish
            return getNestedValue(dictionaries.es, path)
        }
        return val
    }

    return (
        <I18nContext.Provider value={{ locale, t, changeLocale }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(I18nContext)
    if (!context) {
        // Fallback context in case it's used outside provider
        return {
            locale: 'es' as Locale,
            t: (path: string) => {
                const keys = path.split('.')
                let current: any = es
                for (const key of keys) {
                    if (current && typeof current === 'object' && key in current) {
                        current = current[key]
                    } else {
                        return path
                    }
                }
                return typeof current === 'string' ? current : path
            },
            changeLocale: () => {}
        }
    }
    return context
}
