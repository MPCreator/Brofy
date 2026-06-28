import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { OnboardingTour } from '@/components/dashboard/onboarding-tour'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import prisma from '@/lib/prisma'
import { getMarchaBlancaSetting } from '@/lib/actions'
import {
    User,
} from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    if (!session) redirect('/login?clear=true')

    let needsOnboarding = false
    if (session.role === 'client') {
        const pets = await prisma.pet.findMany({ where: { ownerId: session.sub, isActive: true } })
        needsOnboarding = pets.length === 0
    } else if (session.role === 'vet' || session.role === 'provider') {
        const establishments = await prisma.establishment.findMany({
            where: { ownerId: session.sub, isActive: true },
            include: { services: { where: { isActive: true } } }
        })
        needsOnboarding = establishments.length === 0 || establishments.every(est => !est.services || est.services.length === 0)
    }

    const isVet = session.role === 'vet' || session.role === 'provider'
    const isAdmin = session.role === 'admin'
    const basePath = isAdmin ? '/dashboard/admin' : (isVet ? '/dashboard/vet' : '/dashboard/client')

    const mb = await getMarchaBlancaSetting()
    const formattedEndDate = (() => {
        try {
            const parts = mb.endDate.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return mb.endDate;
        } catch {
            return mb.endDate;
        }
    })();

    const bannerText = (() => {
        if (mb.isActive) {
            if (isVet) {
                return `🎉 ¡Estamos en marcha blanca! Disfruta de Brofy 100% gratis hasta el ${formattedEndDate}. Luego, la comisión por Ficha Rápida (registro manual) será de S/ 6.00.`
            }
            if (session.role === 'client') {
                return `🎉 ¡Estamos en marcha blanca! Disfruta de Brofy 100% gratis hasta el ${formattedEndDate}. Luego, la tarifa regular será de S/ 5.00 por reserva web.`
            }
            return `🎉 ¡Estamos en marcha blanca! Disfruta del servicio 100% gratis hasta el ${formattedEndDate}.`
        } else {
            if (isVet) {
                return `📢 La marcha blanca ha finalizado. Se aplica la comisión de S/ 6.00 por Ficha Rápida (registro manual).`
            }
            if (session.role === 'client') {
                return `📢 La marcha blanca ha finalizado. Se aplica la tarifa regular de S/ 5.00 por reserva web.`
            }
            return null
        }
    })()

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Onboarding Tour Guide — wrapped in Suspense to prevent SSR hook errors */}
            <Suspense fallback={null}>
                <OnboardingTour role={session.role} userId={session.sub} needsOnboarding={needsOnboarding} />
            </Suspense>

            {/* Mobile top bar */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 lg:hidden">
                <div className="flex items-center justify-between px-4 h-20">
                    <Link href="/" className="flex items-center text-xl font-extrabold text-primary-600 tracking-tight">
                        <Image 
                            src="/logo.png" 
                            alt="Brofy Logo" 
                            width={160} 
                            height={87} 
                            className="object-contain w-[140px]" 
                            style={{ height: 'auto' }}
                            priority 
                        />
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {session.role === 'vet' ? '🩺 Vet' : session.role === 'provider' ? '🏪 Proveedor' : '🐾 Cliente'}
                        </span>
                        <LogoutButton isMobile />
                    </div>
                </div>
            </header>
 
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-slate-100">
                <div className="flex items-center px-6 h-24 border-b border-slate-100">
                    <Link href="/" className="flex items-center">
                        <Image 
                            src="/logo.png" 
                            alt="Brofy Logo" 
                            width={200} 
                            height={109} 
                            className="object-contain w-[180px]" 
                            style={{ height: 'auto' }}
                            priority 
                        />
                    </Link>
                </div>

                {/* Sidebar Navigation — wrapped in Suspense to prevent SSR hook errors from usePathname */}
                <Suspense fallback={<div className="flex-1 px-3 py-4" />}>
                    <DashboardNav role={session.role} />
                </Suspense>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{session.fullName}</p>
                            <p className="text-xs text-slate-555 truncate">{session.email}</p>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main content */}
            <main className="lg:pl-64">
                {bannerText && (
                    <div className={`w-full text-center py-3 px-4 text-[10px] sm:text-xs font-extrabold border-b shadow-sm animate-in slide-in-from-top duration-300 ${
                        mb.isActive 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-orange-500/20' 
                            : 'bg-slate-900 text-slate-100 border-slate-800'
                    }`}>
                        {bannerText}
                    </div>
                )}

                <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
                    {children}
                </div>
            </main>

            {/* Mobile bottom nav — with safe area for Safari */}
            {/* Wrapped in Suspense to prevent usePathname SSR hook errors */}
            <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-100 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                <Suspense fallback={<div className="h-16 w-full" />}>
                    <DashboardNav role={session.role} isMobile />
                </Suspense>
            </nav>
        </div>
    )
}
