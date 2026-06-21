'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AdminTabsProps {
    activeTab: string
}

export function AdminTabs({ activeTab }: AdminTabsProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleTabChange = (tab: string) => {
        if (tab === activeTab) return
        startTransition(() => {
            router.push(`?tab=${tab}`)
        })
    }

    return (
        <div className="relative">
            <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => handleTabChange('auditoria')}
                    disabled={isPending}
                    type="button"
                    className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'auditoria'
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    } disabled:opacity-80`}
                >
                    Auditorías y Disputas ⚖️
                </button>
                <button
                    onClick={() => handleTabChange('usuarios')}
                    disabled={isPending}
                    type="button"
                    className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'usuarios'
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    } disabled:opacity-80`}
                >
                    Usuarios y Reclamaciones 👥
                </button>
                <button
                    onClick={() => handleTabChange('campanas')}
                    disabled={isPending}
                    type="button"
                    className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'campanas'
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    } disabled:opacity-80`}
                >
                    Campañas y Alertas 📢
                </button>
                <button
                    onClick={() => handleTabChange('bitacora')}
                    disabled={isPending}
                    type="button"
                    className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'bitacora'
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    } disabled:opacity-80`}
                >
                    Bitácora del Sistema 📜
                </button>
            </div>

            {isPending && (
                <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-200">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-150 flex items-center justify-center shadow-lg">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">Cargando sección...</p>
                </div>
            )}
        </div>
    )
}
