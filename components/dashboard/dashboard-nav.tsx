'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Zap, ClipboardList, Building2, Tag, DollarSign, Settings, ShieldCheck, Clock, PawPrint, MapPin, HelpCircle } from 'lucide-react'

interface NavItem {
    href: string
    icon: any
    label: string
}

interface DashboardNavProps {
    role: string
    isMobile?: boolean
}

export function DashboardNav({ role, isMobile = false }: DashboardNavProps) {
    const pathname = usePathname()
    const isAdmin = role === 'admin'
    const isVet = role === 'vet' || role === 'provider'

    const sidebarItems: NavItem[] = isAdmin
        ? [
            { href: '/dashboard/admin', icon: ShieldCheck, label: 'Panel Admin' },
            { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
        ]
        : isVet
            ? [
                { href: '/dashboard/vet', icon: Home, label: 'Inicio' },
                { href: '/dashboard/vet/validate', icon: Zap, label: 'Iniciar Atención' },
                { href: '/dashboard/vet/fast-entry', icon: ClipboardList, label: 'Ficha Rápida' },
                { href: '/dashboard/vet/establishment', icon: Building2, label: 'Mi Local' },
                { href: '/dashboard/vet/services', icon: Tag, label: 'Servicios y Tarifas' },
                { href: '/dashboard/vet/finances', icon: DollarSign, label: 'Finanzas' },
                { href: '/dashboard/help', icon: HelpCircle, label: 'Guía y Capacitación' },
                { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
            ]
            : [
                { href: '/dashboard/client', icon: Home, label: 'Inicio' },
                { href: '/dashboard/client/pending', icon: Clock, label: 'Citas Activas' },
                { href: '/dashboard/client/pets', icon: PawPrint, label: 'Mis Mascotas' },
                { href: '/dashboard/discover', icon: MapPin, label: 'Buscar Locales' },
                { href: '/dashboard/help', icon: HelpCircle, label: 'Ayuda y Novedades' },
                { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
            ]

    const bottomNavItems: NavItem[] = isAdmin
        ? [
            { href: '/dashboard/admin', icon: ShieldCheck, label: 'Admin' },
            { href: '/dashboard/settings', icon: Settings, label: 'Perfil' },
        ]
        : isVet
            ? [
                { href: '/dashboard/vet', icon: Home, label: 'Inicio' },
                { href: '/dashboard/vet/validate', icon: Zap, label: 'Atención' },
                { href: '/dashboard/vet/services', icon: Tag, label: 'Servicios' },
                { href: '/dashboard/help', icon: HelpCircle, label: 'Capacitación' },
                { href: '/dashboard/settings', icon: Settings, label: 'Perfil' },
            ]
            : [
                { href: '/dashboard/client', icon: Home, label: 'Inicio' },
                { href: '/dashboard/client/pending', icon: Clock, label: 'Citas' },
                { href: '/dashboard/discover', icon: MapPin, label: 'Buscar' },
                { href: '/dashboard/help', icon: HelpCircle, label: 'Ayuda' },
                { href: '/dashboard/settings', icon: Settings, label: 'Perfil' },
            ]

    const activeItems = sidebarItems

    if (isMobile) {
        return (
            <div className="flex items-center justify-start md:justify-around gap-1 overflow-x-auto scrollbar-hide px-3 py-1 h-16 w-full scroll-smooth select-none">
                {activeItems.map(item => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all shrink-0 ${
                                isActive 
                                    ? 'text-primary-600 scale-105 font-bold' 
                                    : 'text-slate-500 hover:text-primary-650'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : ''}`} />
                            <span className="text-[9px] font-medium tracking-tight">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        )
    }

    return (
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {activeItems.map(item => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                            isActive
                                ? 'bg-primary-50 text-primary-700 font-semibold border-l-4 border-primary-600 pl-2 shadow-sm shadow-primary-50/50'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <item.icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-primary-700 stroke-[2.2]' : 'text-slate-400'}`} />
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}
