'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { 
    Home, Zap, ClipboardList, Building2, Tag, DollarSign, Settings, 
    ShieldCheck, Clock, PawPrint, MapPin, HelpCircle, MoreHorizontal, X,
    Users, Bell
} from 'lucide-react'
import { useTranslation } from '../../lib/i18n-context'

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
    const searchParams = useSearchParams()
    const [showMore, setShowMore] = useState(false)
    const { t } = useTranslation()
    const isAdmin = role === 'admin'
    const isVet = role === 'vet' || role === 'provider'

    const activeTab = searchParams.get('tab') || 'auditoria'

    const checkActive = (href: string) => {
        if (href.includes('?tab=')) {
            const tabParam = href.split('?tab=')[1]
            return pathname.startsWith('/dashboard/admin') && activeTab === tabParam
        }
        return pathname === href
    }

    const sidebarItems: NavItem[] = isAdmin
        ? [
            { href: '/dashboard/admin?tab=auditoria', icon: ShieldCheck, label: 'Auditorías y Disputas ⚖️' },
            { href: '/dashboard/admin?tab=usuarios', icon: Users, label: 'Usuarios y Reclamos 👥' },
            { href: '/dashboard/admin?tab=finanzas', icon: DollarSign, label: 'Finanzas y Liquidación 💰' },
            { href: '/dashboard/admin?tab=campanas', icon: Bell, label: 'Campañas y Alertas 📢' },
            { href: '/dashboard/admin?tab=bitacora', icon: ClipboardList, label: 'Bitácora del Sistema 📜' },
            { href: '/dashboard/settings', icon: Settings, label: t('nav.settings') },
        ]
        : isVet
            ? [
                { href: '/dashboard/vet', icon: Home, label: t('nav.home') },
                { href: '/dashboard/vet/validate', icon: Zap, label: t('nav.startAttention') },
                { href: '/dashboard/vet/fast-entry', icon: ClipboardList, label: t('nav.fastEntry') },
                { href: '/dashboard/vet/establishment', icon: Building2, label: t('nav.myLocal') },
                { href: '/dashboard/vet/services', icon: Tag, label: t('nav.servicesAndTariffs') },
                { href: '/dashboard/vet/finances', icon: DollarSign, label: t('nav.finances') },
                { href: '/dashboard/help', icon: HelpCircle, label: t('nav.guideAndTraining') },
                { href: '/dashboard/settings', icon: Settings, label: t('nav.settings') },
            ]
            : [
                { href: '/dashboard/client', icon: Home, label: t('nav.home') },
                { href: '/dashboard/client/pending', icon: Clock, label: t('nav.activeAppointments') },
                { href: '/dashboard/client/pets', icon: PawPrint, label: t('nav.myPets') },
                { href: '/dashboard/discover', icon: MapPin, label: t('nav.searchLocales') },
                { href: '/dashboard/help', icon: HelpCircle, label: t('nav.helpAndNews') },
                { href: '/dashboard/settings', icon: Settings, label: t('nav.settings') },
            ]

    const mobileMainItems: NavItem[] = isAdmin
        ? [
            { href: '/dashboard/admin?tab=auditoria', icon: ShieldCheck, label: 'Auditorías' },
            { href: '/dashboard/admin?tab=finanzas', icon: DollarSign, label: 'Finanzas' },
            { href: '/dashboard/settings', icon: Settings, label: 'Perfil' },
        ]
        : isVet
            ? [
                { href: '/dashboard/vet', icon: Home, label: t('nav.home') },
                { href: '/dashboard/vet/validate', icon: Zap, label: t('nav.attention') },
                { href: '/dashboard/vet/services', icon: Tag, label: t('nav.services') },
                { href: '/dashboard/help', icon: HelpCircle, label: t('nav.help') },
            ]
            : [
                { href: '/dashboard/client', icon: Home, label: t('nav.home') },
                { href: '/dashboard/client/pending', icon: Clock, label: t('nav.appointments') },
                { href: '/discover', icon: MapPin, label: t('nav.search') },
                { href: '/dashboard/help', icon: HelpCircle, label: t('nav.help') },
            ]

    const mobileMoreItems: NavItem[] = isAdmin
        ? [
            { href: '/dashboard/admin?tab=usuarios', icon: Users, label: 'Usuarios' },
            { href: '/dashboard/admin?tab=campanas', icon: Bell, label: 'Campañas' },
            { href: '/dashboard/admin?tab=bitacora', icon: ClipboardList, label: 'Bitácora' },
        ]
        : isVet
            ? [
                { href: '/dashboard/vet/fast-entry', icon: ClipboardList, label: t('nav.fastEntry') },
                { href: '/dashboard/vet/establishment', icon: Building2, label: t('nav.myLocal') },
                { href: '/dashboard/vet/finances', icon: DollarSign, label: t('nav.finances') },
                { href: '/dashboard/settings', icon: Settings, label: t('nav.profile') },
            ]
            : [
                { href: '/dashboard/client/pets', icon: PawPrint, label: t('nav.myPets') },
                { href: '/dashboard/settings', icon: Settings, label: t('nav.profile') },
            ]

    const activeItems = sidebarItems

    if (isMobile) {
        const hasMore = mobileMoreItems.length > 0
        const gridCols = hasMore ? 'grid-cols-5' : `grid-cols-${mobileMainItems.length}`

        return (
            <div className="relative w-full">
                {showMore && hasMore && (
                    <>
                        <div 
                            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150"
                            onClick={() => setShowMore(false)}
                        />
                        <div className="fixed bottom-20 inset-x-4 z-50 bg-white/95 backdrop-blur-md border border-slate-150 rounded-[2rem] p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                                <h3 className="font-extrabold text-[11px] text-slate-800 uppercase tracking-widest">{t('nav.moreOptions')}</h3>
                                <button 
                                    onClick={() => setShowMore(false)}
                                    className="p-1 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                {mobileMoreItems.map(item => {
                                    const isActive = checkActive(item.href)
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowMore(false)}
                                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                                isActive
                                                    ? 'bg-primary-50 border-primary-200 text-primary-750 font-bold scale-[1.01]'
                                                    : 'bg-slate-50 border-slate-100 text-slate-650 hover:bg-white hover:border-primary-100'
                                            }`}
                                        >
                                            <item.icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                                            <span className="text-[11px] font-bold">{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}

                <div className={`grid ${gridCols} items-center px-1.5 py-1 h-16 w-full select-none bg-white/95 backdrop-blur-md`}>
                    {mobileMainItems.map(item => {
                        const isActive = checkActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all ${
                                    isActive 
                                        ? 'text-primary-600 scale-105 font-bold' 
                                        : 'text-slate-500 hover:text-primary-650'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : ''}`} />
                                <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
                            </Link>
                        )
                    })}

                    {hasMore && (
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all cursor-pointer ${
                                showMore 
                                    ? 'text-primary-600 scale-105 font-bold' 
                                    : 'text-slate-500 hover:text-primary-650'
                            }`}
                        >
                            <MoreHorizontal className={`w-5 h-5 transition-transform ${showMore ? 'stroke-[2.5]' : ''}`} />
                            <span className="text-[9px] font-semibold tracking-tight">{t('nav.more')}</span>
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {activeItems.map(item => {
                const isActive = checkActive(item.href)
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
