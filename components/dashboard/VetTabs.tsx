'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface VetTabsProps {
    activeTab: string
}

export function VetTabs({ activeTab }: VetTabsProps) {
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
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1.5 w-fit">
                <button
                    onClick={() => handleTabChange('agenda')}
                    disabled={isPending}
                    type="button"
                    className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                        activeTab === 'agenda'
                            ? 'bg-white text-primary-700 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    } disabled:opacity-80`}
                >
                    Agenda y Atención 🩺
                </button>
                <button
                    onClick={() => handleTabChange('stats')}
                    disabled={isPending}
                    type="button"
                    className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                        activeTab === 'stats'
                            ? 'bg-white text-primary-700 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    } disabled:opacity-80`}
                >
                    Estadísticas y Operaciones 📊
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
