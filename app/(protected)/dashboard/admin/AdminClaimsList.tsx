'use client'

import { updateClaimStatus } from '@/lib/actions'
import { FileText, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'

export function AdminClaimsList({ claims }: { claims: any[] }) {
    async function handleResolve(claimId: string) {
        await updateClaimStatus(claimId, 'resolved')
        toast.success('Reclamo marcado como resuelto')
    }

    if (claims.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No hay sugerencias ni reclamos en el libro.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {claims.map(claim => (
                <div key={claim.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                    claim.claimType === 'queja' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {claim.claimType}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(claim.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 mt-1">{claim.fullName}</h3>
                            <p className="text-xs text-slate-500">{claim.email} · {claim.phone}</p>
                        </div>
                        {claim.status === 'resolved' ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                <CheckCircle2 className="w-4 h-4" /> Resuelto
                            </span>
                        ) : (
                            <button 
                                onClick={() => handleResolve(claim.id)}
                                className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Clock className="w-4 h-4" /> Marcar resuelto
                            </button>
                        )}
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 space-y-2">
                        <div>
                            <span className="font-semibold block text-xs text-slate-500 uppercase">Detalle</span>
                            <p>{claim.description}</p>
                        </div>
                        <div>
                            <span className="font-semibold block text-xs text-slate-500 uppercase">Pedido</span>
                            <p>{claim.request}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
