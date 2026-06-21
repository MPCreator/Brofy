'use client'

import { updateClaimStatus } from '@/lib/actions'
import { ShieldAlert, CheckCircle2, Clock, MapPin, User, FileText, Fingerprint } from 'lucide-react'
import { toast } from 'sonner'

export function AdminArcoList({ claims }: { claims: any[] }) {
    async function handleResolve(claimId: string) {
        await updateClaimStatus(claimId, 'resolved')
        toast.success('Solicitud ARCO marcada como resuelta')
    }

    // Helper to calculate business days (excluding weekends)
    function calculateBusinessDaysElapsed(startDateStr: string): number {
        const startDate = new Date(startDateStr)
        const endDate = new Date()
        
        // Normalize times to midnight for accurate day calculations
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(0, 0, 0, 0)
        
        if (startDate > endDate) return 0
        
        let count = 0
        const curDate = new Date(startDate.getTime())
        while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay()
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
                count++
            }
            curDate.setDate(curDate.getDate() + 1)
        }
        return count
    }

    if (claims.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <ShieldAlert className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No hay solicitudes de derechos ARCO pendientes.</p>
            </div>
        )
    }

    const typeLabels: Record<string, string> = {
        arco_acceso: 'Acceso',
        arco_rectificacion: 'Rectificación',
        arco_cancelacion: 'Cancelación',
        arco_oposicion: 'Oposición'
    }

    return (
        <div className="grid gap-4">
            {claims.map(claim => {
                const isAccess = claim.claimType === 'arco_acceso'
                const limit = isAccess ? 20 : 10
                const daysElapsed = calculateBusinessDaysElapsed(claim.createdAt)
                const daysLeft = limit - daysElapsed
                const isOverdue = daysLeft <= 0

                let badgeColor = 'bg-emerald-100 text-emerald-700 border-emerald-200'
                let deadlineText = `${daysLeft} días hábiles restantes`
                
                if (isOverdue) {
                    badgeColor = 'bg-red-100 text-red-700 border-red-200 animate-pulse font-extrabold'
                    deadlineText = `¡PLAZO VENCIDO! (${Math.abs(daysLeft)} días de retraso) RIESGO MULTA ANPD`
                } else if (daysLeft <= 3) {
                    badgeColor = 'bg-amber-100 text-amber-700 border-amber-200 font-bold'
                    deadlineText = `¡URGENTE! ${daysLeft} días hábiles restantes`
                }

                return (
                    <div key={claim.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                                        Derecho de {typeLabels[claim.claimType] || claim.claimType}
                                    </span>
                                    {claim.status !== 'resolved' && (
                                        <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                                            {deadlineText}
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400">
                                        Recibido: {new Date(claim.createdAt).toLocaleDateString('es-PE')}
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5 pt-0.5">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {claim.fullName}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {claim.email} · {claim.phone}
                                </p>
                            </div>
                            
                            <div className="shrink-0 self-start">
                                {claim.status === 'resolved' ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4" /> Solicitud Atendida
                                    </span>
                                ) : (
                                    <button 
                                        onClick={() => handleResolve(claim.id)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-100 px-3 py-2 rounded-xl transition-all active:scale-[0.98]"
                                    >
                                        <Clock className="w-4 h-4 animate-spin-slow" />
                                        Marcar como Resuelto
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Customer Identification Data */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-xs font-medium text-slate-650">
                            <div className="flex items-center gap-1.5">
                                <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                                <span><strong>Documento Identidad (DNI/CE):</strong> {claim.documentId || 'No proporcionado'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate"><strong>Domicilio:</strong> {claim.address || 'No proporcionado'}</span>
                            </div>
                        </div>
                        
                        {/* Request Details */}
                        <div className="bg-slate-50 rounded-xl p-4 text-xs leading-relaxed text-slate-700 space-y-3">
                            <div>
                                <span className="font-extrabold block text-slate-500 uppercase tracking-wider text-[10px] mb-1">Detalle del Requerimiento / Datos Implicados:</span>
                                <p className="font-medium whitespace-pre-wrap">{claim.description}</p>
                            </div>
                            <div className="border-t border-slate-200/60 pt-2.5">
                                <span className="font-extrabold block text-slate-500 uppercase tracking-wider text-[10px] mb-1">Pedido Concreto del Usuario:</span>
                                <p className="font-bold text-slate-900 whitespace-pre-wrap">{claim.request}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
