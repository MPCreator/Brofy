import { getSession, logout } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { OnboardingTour } from '@/components/dashboard/onboarding-tour'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import {
    Home,
    PawPrint,
    MapPin,
    ClipboardList,
    LogOut,
    User,
    Zap,
    Building2,
    DollarSign,
    Tag,
    Settings,
    ShieldCheck,
    Clock,
} from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    if (!session) redirect('/login?clear=true')

    const isVet = session.role === 'vet' || session.role === 'provider'
    const isAdmin = session.role === 'admin'
    const basePath = isAdmin ? '/dashboard/admin' : (isVet ? '/dashboard/vet' : '/dashboard/client')

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Onboarding Tour Guide */}
            <OnboardingTour role={session.role} />

            {/* Mobile top bar */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 lg:hidden">
                <div className="flex items-center justify-between px-4 h-20">
                    <Link href={basePath} className="flex items-center text-xl font-extrabold text-primary-600 tracking-tight">
                        <Image 
                            src="/logo.png" 
                            alt="Brofy Logo" 
                            width={160} 
                            height={87} 
                            className="object-contain w-[140px] h-auto" 
                            priority 
                        />
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {session.role === 'vet' ? '🩺 Vet' : session.role === 'provider' ? '🏪 Proveedor' : '🐾 Cliente'}
                        </span>
                        <form action={logout}>
                            <button
                                type="submit"
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-slate-100">
                <div className="flex items-center px-6 h-24 border-b border-slate-100">
                    <Image 
                        src="/logo.png" 
                        alt="Brofy Logo" 
                        width={200} 
                        height={109} 
                        className="object-contain w-[180px] h-auto" 
                        priority 
                    />
                </div>

                {/* Sidebar Navigation */}
                <DashboardNav role={session.role} />

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{session.fullName}</p>
                            <p className="text-xs text-slate-500 truncate">{session.email}</p>
                        </div>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <main className="lg:pl-64">
                <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
                    {children}
                </div>
            </main>

            {/* Mobile bottom nav — with safe area for Safari */}
            <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-100 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                <DashboardNav role={session.role} isMobile />
            </nav>
        </div>
    )
}
