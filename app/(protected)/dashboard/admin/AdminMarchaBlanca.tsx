'use client'

import { useState, useTransition } from 'react'
import { updateMarchaBlancaSetting } from '@/lib/actions'
import { toast } from 'sonner'
import { Settings, Calendar, AlertTriangle, Loader2 } from 'lucide-react'

interface AdminMarchaBlancaProps {
    initialSetting: {
        isActive: boolean
        startDate: string
        endDate: string
    }
}

export function AdminMarchaBlanca({ initialSetting }: AdminMarchaBlancaProps) {
    const [isActive, setIsActive] = useState(initialSetting.isActive)
    const [startDate, setStartDate] = useState(initialSetting.startDate)
    const [endDate, setEndDate] = useState(initialSetting.endDate)
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        if (!startDate || !endDate) {
            toast.error('Las fechas de inicio y fin son obligatorias')
            return
        }

        if (new Date(startDate) > new Date(endDate)) {
            toast.error('La fecha de inicio no puede ser posterior a la fecha de fin')
            return
        }

        startTransition(async () => {
            try {
                const res = await updateMarchaBlancaSetting(isActive, startDate, endDate)
                if (res.success) {
                    toast.success('Configuración de Marcha Blanca actualizada correctamente')
                } else {
                    toast.error('Error al actualizar la configuración')
                }
            } catch (err: any) {
                toast.error(err.message || 'Error de conexión al actualizar')
            }
        })
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Configuración de Marcha Blanca (Fase Gratuita)</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Controla la campaña de prueba gratis y la exoneración de cobros.</p>
                    </div>
                </div>
                
                {/* Active switch */}
                <button
                    onClick={() => setIsActive(!isActive)}
                    disabled={isPending}
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? 'bg-amber-500' : 'bg-slate-200'
                    }`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Fecha de Inicio:
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isPending}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Fecha de Fin:
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isPending}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
                    />
                </div>
            </div>

            {/* Note alert */}
            {isActive && (
                <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-normal font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                        <span className="font-bold block mb-0.5">La Marcha Blanca está ACTIVA:</span>
                        <span>Se omitirán los cobros de comisiones para clientes (S/ 5.00) y deudas para proveedores (S/ 6.00). Aparecerán banners informativos con la fecha límite especificada en el inicio de la app y del dashboard.</span>
                    </div>
                </div>
            )}

            {!isActive && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600 leading-normal font-medium">
                    <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold block mb-0.5">La Marcha Blanca está INACTIVA:</span>
                        <span>La plataforma cobrará comisiones regulares e inyectará recordatorios e indicaciones sobre tarifas en los dashboards de clientes y proveedores.</span>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    type="button"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-98 flex items-center gap-1.5 cursor-pointer"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        'Guardar Configuración'
                    )}
                </button>
            </div>
        </div>
    )
}
