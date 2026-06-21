'use client'

import { useState } from 'react'
import { Calendar, Shield, Search, User, Filter, AlertCircle, FileText } from 'lucide-react'

interface AuditLog {
    id: string
    actorId: string
    actorName: string
    actorEmail: string
    action: string
    targetId: string | null
    details: string
    createdAt: string | Date
}

interface AdminAuditLogProps {
    logs: AuditLog[]
}

const ACTION_LABELS: Record<string, { label: string; colorClass: string }> = {
    SUSPEND_USER: { label: 'Usuario Suspendido 🚫', colorClass: 'bg-red-50 text-red-750 border-red-100' },
    REACTIVATE_USER: { label: 'Usuario Reactivado ✅', colorClass: 'bg-emerald-50 text-emerald-750 border-emerald-100' },
    VALIDATE_CMVP: { label: 'CMVP Aprobado 🩺', colorClass: 'bg-green-50 text-green-750 border-green-100' },
    REVOKE_CMVP: { label: 'CMVP Revocado ⚠️', colorClass: 'bg-amber-50 text-amber-750 border-amber-100' },
    DELETE_USER: { label: 'Usuario Eliminado 🗑️', colorClass: 'bg-slate-100 text-slate-700 border-slate-200' },
    CANCEL_APPOINTMENT: { label: 'Reserva Cancelada 🐾', colorClass: 'bg-orange-50 text-orange-750 border-orange-100' },
    REPORT_NO_SHOW: { label: 'Inasistencia (No-Show) 🚨', colorClass: 'bg-rose-50 text-rose-750 border-rose-100' },
    RESOLVE_DISPUTE: { label: 'Disputa Resuelta ⚖️', colorClass: 'bg-blue-50 text-blue-750 border-blue-100' },
    SEND_CUSTOM_EMAIL: { label: 'Email Custom ✉️', colorClass: 'bg-indigo-50 text-indigo-750 border-indigo-100' },
    SEND_REVISION_MESSAGE: { label: 'Mensaje Revisión 💬', colorClass: 'bg-violet-50 text-violet-750 border-violet-100' },
}

export function AdminAuditLog({ logs }: AdminAuditLogProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [actionFilter, setActionFilter] = useState('ALL')

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.targetId && log.targetId.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesFilter = actionFilter === 'ALL' || log.action === actionFilter

        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por operador, detalle o ID de recurso..."
                        className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 shrink-0">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value)}
                        className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:outline-none text-slate-650 font-semibold cursor-pointer"
                    >
                        <option value="ALL">Todas las acciones</option>
                        <option value="SUSPEND_USER">Usuarios Suspendidos</option>
                        <option value="REACTIVATE_USER">Usuarios Reactivados</option>
                        <option value="VALIDATE_CMVP">CMVP Aprobados</option>
                        <option value="REVOKE_CMVP">CMVP Revocados</option>
                        <option value="DELETE_USER">Usuarios Eliminados</option>
                        <option value="CANCEL_APPOINTMENT">Reservas Canceladas</option>
                        <option value="REPORT_NO_SHOW">Inasistencias Reportadas</option>
                        <option value="RESOLVE_DISPUTE">Disputas Resueltas</option>
                        <option value="SEND_CUSTOM_EMAIL">Correos Enviados</option>
                        <option value="SEND_REVISION_MESSAGE">Mensajes de Revisión</option>
                    </select>
                </div>
            </div>

            {/* Logs Table / List */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[600px] scrollbar-hide">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Fecha y Hora</th>
                                <th className="px-6 py-4">Operador / Actor</th>
                                <th className="px-6 py-4">Acción</th>
                                <th className="px-6 py-4">Detalles y Recurso</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.map(log => {
                                const actionMeta = ACTION_LABELS[log.action] || { label: log.action, colorClass: 'bg-slate-100 text-slate-700 border-slate-250' }
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>
                                                    {new Date(log.createdAt).toLocaleString('es-PE', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        hour12: true
                                                    })}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actor */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs shrink-0 text-slate-550 border border-slate-200">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-900 text-xs truncate max-w-[150px]">{log.actorName}</div>
                                                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{log.actorEmail}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Action Badge */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wide shadow-2xs ${actionMeta.colorClass}`}>
                                                {actionMeta.label}
                                            </span>
                                        </td>

                                        {/* Resource and details */}
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-800 font-medium leading-relaxed">{log.details}</p>
                                            {log.targetId && (
                                                <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold font-mono bg-slate-100 hover:bg-slate-200 text-slate-650 px-2 py-0.5 rounded border border-slate-200 transition-colors select-all">
                                                    ID Recurso: {log.targetId}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}

                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <AlertCircle className="w-8 h-8 text-slate-300" />
                                            <p className="text-slate-500 font-medium text-xs">No se encontraron registros de auditoría que coincidan con la búsqueda.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer details */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Seguridad y Control</span>
                    <span>Mostrando {filteredLogs.length} de {logs.length} eventos</span>
                </div>
            </div>
        </div>
    )
}
