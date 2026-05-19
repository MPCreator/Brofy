import { getSession, logout } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
} from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    if (!session) redirect('/login')

    const isVet = session.role === 'vet' || session.role === 'provider'
    const isAdmin = session.role === 'admin'
    const basePath = isAdmin ? '/dashboard/admin' : (isVet ? '/dashboard/vet' : '/dashboard/client')

    // Full sidebar navigation (desktop)
    const sidebarItems = isAdmin 
        ? [
            { href: '/dashboard/admin', icon: ShieldCheck, label: 'Admin Panel' },
            { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
        ]
        : isVet
            ? [
                { href: '/dashboard/vet', icon: Home, label: 'Inicio' },
                { href: '/dashboard/vet/validate', icon: Zap, label: 'Validar OTP' },
                { href: '/dashboard/vet/fast-entry', icon: ClipboardList, label: 'Fast Entry' },
                { href: '/dashboard/vet/establishment', icon: Building2, label: 'Mi Local' },
                { href: '/dashboard/vet/services', icon: Tag, label: 'Servicios' },
                { href: '/dashboard/vet/finances', icon: DollarSign, label: 'Finanzas' },
                { href: '/dashboard/discover', icon: MapPin, label: 'Descubrir' },
                { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
            ]
            : [
                { href: '/dashboard/client', icon: Home, label: 'Inicio' },
                { href: '/dashboard/client/pets', icon: PawPrint, label: 'Mascotas' },
                { href: '/dashboard/discover', icon: MapPin, label: 'Descubrir' },
                { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
            ]

    // Bottom nav (mobile) — limited to 5 items max
    const bottomNavItems = isAdmin
        ? [
            { href: '/dashboard/admin', icon: ShieldCheck, label: 'Admin' },
            { href: '/dashboard/settings', icon: User, label: 'Perfil' },
        ]
        : isVet
            ? [
                { href: '/dashboard/vet', icon: Home, label: 'Inicio' },
                { href: '/dashboard/vet/validate', icon: Zap, label: 'OTP' },
                { href: '/dashboard/vet/services', icon: Tag, label: 'Servicios' },
                { href: '/dashboard/vet/finances', icon: DollarSign, label: 'Finanzas' },
                { href: '/dashboard/settings', icon: User, label: 'Perfil' },
            ]
            : [
                { href: '/dashboard/client', icon: Home, label: 'Inicio' },
                { href: '/dashboard/client/pets', icon: PawPrint, label: 'Mascotas' },
                { href: '/dashboard/discover', icon: MapPin, label: 'Descubrir' },
                { href: '/dashboard/settings', icon: User, label: 'Perfil' },
            ]

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Mobile top bar */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 lg:hidden">
                <div className="flex items-center justify-between px-4 h-14">
                    <Link href={basePath} className="text-xl font-bold text-primary-600 tracking-tight">
                        Brofy
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
                <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-100">
                    <span className="text-2xl font-bold text-primary-600 tracking-tight">Brofy</span>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

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
                <div className="flex items-center justify-around h-16 px-2">
                    {bottomNavItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-slate-500 hover:text-primary-600 transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}

