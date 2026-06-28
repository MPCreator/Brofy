'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import DiscoverCatalog from '@/components/discover/DiscoverCatalog'
import { LogoutButton } from '@/components/dashboard/LogoutButton'

export default function DiscoverPage() {
    const [session, setSession] = useState<any>(null)
    const [loadingSession, setLoadingSession] = useState(true)

    useEffect(() => {
        getSession().then(sess => {
            setSession(sess)
            setLoadingSession(false)
        })
    }, [])

    return (
        <main className="min-h-screen flex flex-col bg-slate-50">
            {/* Public Header / Navbar */}
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm w-full">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center">
                            <Image 
                                src="/logo.png" 
                                alt="Brofy Logo" 
                                width={240} 
                                height={131} 
                                className="object-contain h-[48px] sm:h-[64px]" 
                                style={{ width: 'auto' }}
                                priority 
                            />
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {!loadingSession && (
                            session ? (
                                <div className="flex items-center gap-3">
                                    <Link 
                                        href={
                                            session.role === 'admin' 
                                                ? '/dashboard/admin' 
                                                : session.role === 'vet' || session.role === 'provider' 
                                                    ? '/dashboard/vet' 
                                                    : '/dashboard/client'
                                        } 
                                        className="bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        Mi Panel 🐾
                                    </Link>
                                    <LogoutButton isMobile />
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className="text-sm font-semibold text-slate-650 hover:text-primary-600 transition-colors">
                                        Ingresar
                                    </Link>
                                    <Link href="/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                                        Crear cuenta
                                    </Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            </header>

            {/* Centralized Catalog Search Content */}
            <DiscoverCatalog isDashboard={false} />
        </main>
    )
}
