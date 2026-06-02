'use client'

import { useState } from 'react'
import { toggleAccountStatus, updateRevisionMessage, deleteAccount, validateVetCmvp } from '@/lib/actions'
import { ShieldCheck, ShieldAlert, Ban, Trash2, MessageSquare, CheckCircle2, Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AdminUserList({ users }: { users: any[] }) {
    const [promptingRev, setPromptingRev] = useState<string | null>(null)
    const [revMsg, setRevMsg] = useState('')
    const [schedulingAudit, setSchedulingAudit] = useState<string | null>(null)
    const [auditDate, setAuditDate] = useState('')
    const [sendingEmail, setSendingEmail] = useState<string | null>(null)
    const [emailSubject, setEmailSubject] = useState('')
    const [emailBody, setEmailBody] = useState('')
    const [emailing, setEmailing] = useState(false)

    async function handleToggleStatus(userId: string, currentStatus: boolean) {
        await toggleAccountStatus(userId, !currentStatus)
        toast.success(currentStatus ? 'Cuenta suspendida' : 'Cuenta reactivada')
    }

    async function handleDelete(userId: string) {
        if (!confirm('¿Estás seguro de eliminar esta cuenta permanentemente?')) return
        await deleteAccount(userId)
        toast.success('Cuenta eliminada')
    }

    async function handleSendRev(userId: string) {
        await updateRevisionMessage(userId, revMsg)
        toast.success('Mensaje de revisión enviado')
        setPromptingRev(null)
        setRevMsg('')
    }

    async function handleValidateCmvp(userId: string, currentValid: boolean) {
        await validateVetCmvp(userId, !currentValid)
        toast.success(currentValid ? 'CMVP revocado' : 'CMVP aprobado')
    }

    async function handleScheduleAudit(vetId: string, vetName: string) {
        if (!auditDate) {
            toast.error('Selecciona una fecha para la revisión.')
            return
        }
        const { createAdminAuditReminder } = await import('@/lib/actions')
        const res = await createAdminAuditReminder({ vetId, vetName, dueDate: auditDate })
        if (res.success) {
            toast.success(`Recordatorio programado para el ${new Date(auditDate).toLocaleDateString('es-PE')}`)
            setSchedulingAudit(null)
            setAuditDate('')
        }
    }

    async function handleSendEmail(userId: string) {
        if (!emailSubject || !emailBody) {
            toast.error('El asunto y el cuerpo del correo son requeridos.')
            return
        }
        setEmailing(true)
        const { sendCustomEmailFromAdmin } = await import('@/lib/actions')
        const res = await sendCustomEmailFromAdmin({ userId, subject: emailSubject, body: emailBody })
        setEmailing(false)
        if (res.success) {
            toast.success('Correo electrónico enviado correctamente.')
            setSendingEmail(null)
            setEmailSubject('')
            setEmailBody('')
        } else {
            toast.error(`Error al enviar: ${res.error || 'Inténtalo de nuevo.'}`)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Rol / Info</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                        <tr key={u.id} className={`hover:bg-slate-50/50 ${!u.isActive ? 'opacity-50' : ''}`}>
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{u.fullName}</div>
                                <div className="text-slate-400">{u.email}</div>
                                {u.revisionMsg && (
                                    <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> Revisión enviada
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className="capitalize font-medium text-slate-700">{u.role}</span>
                                {u.role === 'vet' && (
                                    <div className="text-xs mt-1 space-y-1">
                                        <div>
                                            CMVP: <span className="font-mono font-bold text-slate-850">{u.cmvpId || 'No provisto'}</span>
                                        </div>
                                        {u.cmvpId && (
                                            <div className="space-y-1.5 mt-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <button 
                                                        onClick={() => handleValidateCmvp(u.id, u.cmvpValidated)}
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                                                            u.cmvpValidated ? 'bg-emerald-100 text-emerald-750 hover:bg-emerald-200' : 'bg-amber-100 text-amber-750 hover:bg-amber-200'
                                                        }`}
                                                    >
                                                        {u.cmvpValidated ? '✅ Aprobado (Revocar)' : '⚠️ Pendiente (Aprobar)'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setSchedulingAudit(schedulingAudit === u.id ? null : u.id)}
                                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
                                                    >
                                                        📅 Programar Auditoría
                                                    </button>
                                                </div>
                                                {schedulingAudit === u.id && (
                                                    <div className="flex items-center gap-1.5 mt-1 bg-slate-50 p-2 rounded-xl border border-slate-200 animate-in">
                                                        <input 
                                                            type="date"
                                                            value={auditDate}
                                                            onChange={e => setAuditDate(e.target.value)}
                                                            className="px-2 py-1 text-[11px] border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                                                        />
                                                        <button 
                                                            onClick={() => handleScheduleAudit(u.id, u.fullName)}
                                                            className="px-2 py-1 text-[10px] bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded shadow-sm"
                                                        >
                                                            Guardar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {u.isActive ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Activo
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                        Suspendido
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {sendingEmail === u.id ? (
                                    <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-xs ml-auto animate-in text-left">
                                        <div className="text-[11px] font-bold text-slate-700">Enviar correo a {u.fullName}</div>
                                        <input 
                                            type="text" 
                                            value={emailSubject} 
                                            onChange={e => setEmailSubject(e.target.value)} 
                                            placeholder="Asunto del correo..."
                                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                        />
                                        <textarea
                                            value={emailBody} 
                                            onChange={e => setEmailBody(e.target.value)} 
                                            placeholder="Escribe el mensaje..."
                                            rows={3}
                                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white resize-none"
                                        />
                                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                            <button 
                                                onClick={() => setSendingEmail(null)} 
                                                disabled={emailing}
                                                className="text-[10px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                onClick={() => handleSendEmail(u.id)} 
                                                disabled={emailing}
                                                className="text-[10px] font-bold bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-2.5 py-1 rounded flex items-center gap-1 shadow-sm transition-colors"
                                            >
                                                {emailing && <Loader2 className="w-3 h-3 animate-spin" />}
                                                {emailing ? 'Enviando...' : 'Enviar'}
                                            </button>
                                        </div>
                                    </div>
                                ) : promptingRev === u.id ? (
                                    <div className="flex items-center gap-2 justify-end">
                                        <input 
                                            type="text" 
                                            value={revMsg} 
                                            onChange={e => setRevMsg(e.target.value)} 
                                            placeholder="Motivo de revisión..."
                                            className="px-2 py-1 text-xs border rounded"
                                        />
                                        <button onClick={() => handleSendRev(u.id)} className="text-xs bg-primary-600 text-white px-2 py-1 rounded">Enviar</button>
                                        <button onClick={() => setPromptingRev(null)} className="text-xs text-slate-500">Cancel</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => {
                                                setSendingEmail(u.id)
                                                setPromptingRev(null)
                                                setSchedulingAudit(null)
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                                            title="Enviar correo personalizado"
                                        >
                                            <Mail className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setPromptingRev(u.id)
                                                setSendingEmail(null)
                                                setSchedulingAudit(null)
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                                            title="Enviar mensaje de revisión"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                                            className={`p-1.5 transition-colors ${u.isActive ? 'text-slate-400 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'}`}
                                            title={u.isActive ? 'Suspender cuenta' : 'Reactivar cuenta'}
                                        >
                                            {u.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(u.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Eliminar cuenta"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                No hay usuarios registrados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
