'use client'

import { useState } from 'react'
import { toggleAccountStatus, updateRevisionMessage, deleteAccount, validateVetCmvp } from '@/lib/actions'
import { ShieldCheck, ShieldAlert, Ban, Trash2, MessageSquare, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function AdminUserList({ users }: { users: any[] }) {
    const [promptingRev, setPromptingRev] = useState<string | null>(null)
    const [revMsg, setRevMsg] = useState('')

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
                                    <div className="text-xs mt-1">
                                        CMVP: {u.cmvpId || 'No provisto'}
                                        {u.cmvpId && (
                                            <button 
                                                onClick={() => handleValidateCmvp(u.id, u.cmvpValidated)}
                                                className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                                                    u.cmvpValidated ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                }`}
                                            >
                                                {u.cmvpValidated ? '✅ Aprobado (Revocar)' : '⚠️ Pendiente (Aprobar)'}
                                            </button>
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
                                {promptingRev === u.id ? (
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
                                            onClick={() => setPromptingRev(u.id)}
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
