'use client'

import { useState } from 'react'
import { resolveDenunciaAdmin } from '@/lib/actions'
import { AlertOctagon, CheckCircle2, XCircle, ShieldAlert, Sparkles, User, Shield, HelpCircle, Phone, Calendar, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { SPECIES_LABELS } from '@/lib/types'

export function AdminDisputesList({ initialAppointments }: { initialAppointments: any[] }) {
    const [appointments, setAppointments] = useState(initialAppointments)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [sanctionsMap, setSanctionsMap] = useState<Record<string, boolean>>({})

    async function handleResolve(appointmentId: string, status: 'resolved_refunded' | 'resolved_rejected') {
        const applySanction = !!sanctionsMap[appointmentId]
        setProcessingId(appointmentId)

        try {
            const res = await resolveDenunciaAdmin(appointmentId, status, applySanction)
            if (res.success) {
                toast.success(res.message)
                // Update local state to reflect resolution
                setAppointments(prev => prev.map(apt => {
                    if (apt.id === appointmentId) {
                        return {
                            ...apt,
                            status: 'cancelled',
                            denunciaStatus: status,
                            notes: (apt.notes || '') + `\n[Resolución: ${status === 'resolved_refunded' ? 'A favor del cliente' : 'A favor del proveedor'}${applySanction ? ' - Sancionado' : ''}]`
                        }
                    }
                    return apt
                }))
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error('Error al resolver la disputa')
            console.error(error)
        } finally {
            setProcessingId(null)
        }
    }

    const toggleSanction = (id: string) => {
        setSanctionsMap(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const activeDisputes = appointments.filter(apt => apt.denunciaStatus === 'pending')
    const resolvedDisputes = appointments.filter(apt => apt.denunciaStatus && apt.denunciaStatus !== 'pending')

    return (
        <div className="space-y-6">
            {/* Active Disputes Section */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Disputas Pendientes por Auditar ({activeDisputes.length})
                </h3>

                {activeDisputes.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">¡Excelente! No hay denuncias ni disputas pendientes de revisión administrativa.</p>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {activeDisputes.map(apt => {
                            const isSelectedSanction = !!sanctionsMap[apt.id]
                            return (
                                <div key={apt.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                    {/* Header Banner */}
                                    <div className="bg-amber-50 border-b border-amber-100 px-5 py-3.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-amber-800">
                                            <AlertOctagon className="w-4 h-4 text-amber-500 animate-pulse" />
                                            <span className="text-xs font-bold uppercase tracking-wide">Reporte de Inasistencia / No-Show</span>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono">
                                            ID Cita: {apt.id.slice(0, 8)}...
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 space-y-4">
                                        {/* Dispute Core Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Client details */}
                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cliente Reportante</span>
                                                <h4 className="text-sm font-bold text-slate-900">{apt.client?.fullName}</h4>
                                                <p className="text-xs text-slate-500">{apt.client?.email}</p>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {apt.client?.phone || 'Sin número'}
                                                </p>
                                            </div>

                                            {/* Pet details */}
                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mascota Afectada</span>
                                                <h4 className="text-sm font-bold text-slate-900">{apt.pet?.name}</h4>
                                                <p className="text-xs text-slate-500 capitalize">{apt.pet?.species === 'dog' ? '🐾 Perro' : apt.pet?.species === 'cat' ? '🐱 Gato' : '🐾 ' + (SPECIES_LABELS[apt.pet?.species as keyof typeof SPECIES_LABELS] || apt.pet?.species)}</p>
                                                <div className="mt-1.5">
                                                    <span className="text-[10px] bg-primary-100 text-primary-800 font-bold px-2 py-0.5 rounded font-mono">
                                                        {apt.pet?.cuh || 'Sin CUH'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Establishment & Provider details */}
                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Establecimiento / Proveedor</span>
                                                <h4 className="text-sm font-bold text-slate-900">{apt.establishment?.name}</h4>
                                                <p className="text-xs text-slate-500">Encargado: {apt.establishment?.owner?.fullName}</p>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {apt.establishment?.owner?.phone || 'Sin número'}
                                                </p>
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    <span className="text-[9px] text-slate-450 font-bold uppercase">Cód. Local:</span>
                                                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded font-mono">
                                                        {apt.establishment?.dni || 'Sin Código'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scheduled At & Booking Commision */}
                                        <div className="flex flex-wrap gap-4 text-xs bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Fecha Agendada:</span>
                                                <strong className="text-slate-800">
                                                    {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleString('es-PE', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : 'No agendada'}
                                                </strong>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-600 ml-auto">
                                                <span>Comisión de Reserva:</span>
                                                <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                                                    S/ {apt.commissionAmount.toFixed(2)} (Equiv. a {(apt.commissionAmount * 100).toFixed(0)} Huellitas 🐾)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Claim Reason */}
                                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1">Motivo de Denuncia (Cliente)</span>
                                            <p className="text-sm font-medium text-slate-800">&quot;{apt.denunciaReason || 'Sin motivo especificado'}&quot;</p>
                                        </div>

                                        {/* OTP Verification Code & Status */}
                                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Código de Verificación OTP</span>
                                            </div>
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-mono font-bold bg-white border border-slate-300 px-2.5 py-1 rounded text-slate-800 tracking-wider shadow-sm">
                                                        {apt.otpValidationCode || 'No generado'}
                                                    </span>
                                                    {apt.otpValidationCode ? (
                                                        (() => {
                                                            const isExpired = apt.otpExpiresAt ? new Date(apt.otpExpiresAt) < new Date() : true;
                                                            return isExpired ? (
                                                                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">
                                                                    🔴 OTP Expirado
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100 animate-pulse">
                                                                    🟢 OTP Activo / Válido
                                                                </span>
                                                            );
                                                        })()
                                                    ) : null}
                                                </div>
                                                {apt.otpExpiresAt && (
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        Vencimiento: {new Date(apt.otpExpiresAt).toLocaleString('es-PE', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit'
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reconciliation / Sanction Control */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                                            {/* Administrative Sanction Toggle */}
                                            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelectedSanction}
                                                    onChange={() => toggleSanction(apt.id)}
                                                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                                                />
                                                <div className="flex items-center gap-1 text-slate-700">
                                                    <ShieldAlert className={`w-4 h-4 ${isSelectedSanction ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
                                                    <span className={`text-xs font-bold ${isSelectedSanction ? 'text-red-600 font-extrabold' : 'text-slate-600'}`}>
                                                        Aplicar sanción administrativa al proveedor
                                                    </span>
                                                </div>
                                            </label>

                                            {/* Resolution Buttons */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    disabled={processingId !== null}
                                                    onClick={() => handleResolve(apt.id, 'resolved_rejected')}
                                                    className="px-3.5 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50"
                                                >
                                                    A favor del Proveedor (Rechazar)
                                                </button>
                                                <button
                                                    disabled={processingId !== null}
                                                    onClick={() => handleResolve(apt.id, 'resolved_refunded')}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-100 disabled:opacity-50"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" /> A favor del Cliente (Reembolsar Huellitas)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Resolved Disputes Section */}
            {resolvedDisputes.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Historial de Resoluciones ({resolvedDisputes.length})
                    </h3>
                    <div className="grid gap-3">
                        {resolvedDisputes.map(apt => {
                            const isRefunded = apt.denunciaStatus === 'resolved_refunded'
                            return (
                                <div key={apt.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs transition-colors hover:bg-slate-100/50">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800">{apt.client?.fullName}</span>
                                            <span className="text-slate-400">vs</span>
                                            <span className="font-bold text-slate-800">{apt.establishment?.name}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-medium">
                                            Mascota: <strong className="text-slate-700">{apt.pet?.name} ({apt.pet?.cuh || 'N/A'})</strong> · Cód. Local: <strong className="text-slate-700">{apt.establishment?.dni || 'N/A'}</strong>
                                        </div>
                                        <div className="text-[11px] bg-white rounded border border-slate-200 p-2 text-slate-600 max-w-lg font-normal whitespace-pre-line leading-relaxed">
                                            <strong>Motivo:</strong> &quot;{apt.denunciaReason || 'Sin motivo'}&quot;
                                            {apt.notes && (
                                                <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-slate-500">
                                                    <strong>Notas Internas:</strong> {apt.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-right space-y-2">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                                            isRefunded 
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                : 'bg-slate-200 text-slate-700 border border-slate-300'
                                        }`}>
                                            {isRefunded ? (
                                                <>
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reembolsado A Cliente
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3 text-slate-500" /> Rechazado / Proveedor
                                                </>
                                            )}
                                        </span>
                                        <p className="text-[10px] text-slate-400">Resolución finalizada</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
