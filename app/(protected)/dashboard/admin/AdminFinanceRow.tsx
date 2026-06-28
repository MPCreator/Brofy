'use client'

import { useState, useTransition } from 'react'
import { formatPEN } from '@/lib/utils'
import { Copy, Check, MessageSquare, Mail, Phone, FileSpreadsheet, FileText, CheckSquare, Loader2, Slash, Bell, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { markProviderCommissionsInvoiced, toggleProviderPenalty, sendSystemNotification } from '@/lib/actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface AdminFinanceRowProps {
    provider: {
        id: string
        fullName: string
        email: string
        phone: string | null
        role: string
        pendingDebt: number
        paidDebt: number
        toBillDebt: number
        invoicedDebt: number
        isPenalized: boolean
        establishments: string
    }
}

export function AdminFinanceRow({ provider: p }: AdminFinanceRowProps) {
    const [copiedEmail, setCopiedEmail] = useState(false)
    const [copiedPhone, setCopiedPhone] = useState(false)
    const [copiedBoleta, setCopiedBoleta] = useState(false)
    const [copiedFactura, setCopiedFactura] = useState(false)
    const [copiedReminder, setCopiedReminder] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [notifTitle, setNotifTitle] = useState('Aviso de Comisiones Pendientes 💰')
    const [notifMsg, setNotifMsg] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const openNotificationModal = () => {
        setNotifTitle('Aviso de Comisiones Pendientes 💰')
        setNotifMsg(`Hola ${p.fullName},\n\nTienes un saldo pendiente de comisiones acumuladas de S/ ${p.pendingDebt.toFixed(2)} por uso de Fichas Clínicas Rápidas en ${p.establishments || 'tu local'}. Por favor regularízalo en la sección de Finanzas de tu panel.\n\nAtentamente,\nBrofy Admin 🐾`)
        setIsNotifOpen(true)
    }

    function handleSendNotification() {
        if (!notifTitle.trim() || !notifMsg.trim()) {
            toast.error('El título y el mensaje son obligatorios')
            return
        }
        startTransition(async () => {
            try {
                const res = await sendSystemNotification(p.id, notifTitle, notifMsg)
                if (res.success) {
                    toast.success('Notificación enviada al panel del proveedor')
                    setIsNotifOpen(false)
                } else {
                    toast.error('Error al enviar la notificación')
                }
            } catch {
                toast.error('Error de conexión')
            }
        })
    }

    const wspMsg = `Hola ${p.fullName}, te saludamos de Brofy. Tienes un saldo pendiente de comisiones acumuladas por liquidar de S/ ${p.pendingDebt.toFixed(2)} por uso de Fichas Rápidas en ${p.establishments || 'tu establecimiento'}. Por favor, regularízalo en la sección de Finanzas de tu panel de control para mantener tu cuenta activa y al día. ¡Gracias!`;
    const wspUrl = `https://wa.me/${p.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(wspMsg)}`;

    const copyText = (text: string, setCopiedState: (v: boolean) => void) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text)
            setCopiedState(true)
            toast.success('Copiado al portapapeles')
            setTimeout(() => setCopiedState(false), 2000)
        }
    }

    // Templates for manual billing notifications
    const getBoletaTemplate = () => {
        const totalPaid = p.toBillDebt > 0 ? p.toBillDebt : p.paidDebt;
        return `Estimado/a ${p.fullName},\n\nTe saludamos del equipo de Brofy. Adjuntamos la Boleta de Venta Electrónica correspondiente a la liquidación de comisiones acumuladas por uso de Fichas Rápidas por el monto total de S/ ${totalPaid.toFixed(2)}.\n\nAgradecemos mucho tu puntual pago y preferencia.\n\nAtentamente,\nBrofy App 🐾`;
    }

    const getFacturaTemplate = () => {
        const totalPaid = p.toBillDebt > 0 ? p.toBillDebt : p.paidDebt;
        return `Estimado/a ${p.fullName},\n\nTe saludamos del equipo de Brofy. Adjuntamos la Factura Electrónica correspondiente a la liquidación de comisiones acumuladas por uso de Fichas Rápidas por el monto total de S/ ${totalPaid.toFixed(2)}.\n\nAgradecemos mucho tu puntual pago y preferencia.\n\nAtentamente,\nBrofy App 🐾`;
    }

    function handleMarkAllInvoiced() {
        startTransition(async () => {
            try {
                const res = await markProviderCommissionsInvoiced(p.id)
                if (res.success) {
                    toast.success('Estado de facturación actualizado para todas las comisiones del proveedor')
                } else {
                    toast.error('Error al actualizar')
                }
            } catch {
                toast.error('Error de conexión')
            }
        })
    }

    function handleTogglePenalty() {
        startTransition(async () => {
            try {
                const res = await toggleProviderPenalty(p.id)
                if (res.success) {
                    toast.success(p.isPenalized ? 'Penalización revocada' : 'Proveedor penalizado con éxito')
                } else {
                    toast.error('Error al actualizar')
                }
            } catch {
                toast.error('Error de conexión')
            }
        })
    }

    return (
        <tr className="hover:bg-slate-50/40 transition-colors">
            {/* Name and Establishment */}
            <td className="py-3.5 pr-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-bold text-slate-900">{p.fullName}</p>
                    {p.isPenalized && (
                        <span className="bg-rose-100 border border-rose-200 text-rose-800 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                            ⚠️ Penalizado
                        </span>
                    )}
                </div>
                <p className="text-slate-455 text-[10px] truncate max-w-[220px]" title={p.establishments}>
                    {p.establishments}
                </p>
            </td>

            {/* Email and Phone with copy actions */}
            <td className="py-3.5 pr-3 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${p.email}`} className="hover:underline hover:text-primary-600 font-semibold truncate max-w-[150px]" title={p.email}>
                        {p.email}
                    </a>
                    <button
                        onClick={() => copyText(p.email, setCopiedEmail)}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-650 rounded transition-colors"
                        title="Copiar correo"
                    >
                        {copiedEmail ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                </div>
                {p.phone && (
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{p.phone}</span>
                        <button
                            onClick={() => copyText(p.phone || '', setCopiedPhone)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-650 rounded transition-colors"
                            title="Copiar celular"
                        >
                            {copiedPhone ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                )}
            </td>

            {/* Pending Debt */}
            <td className="py-3.5 pr-3 text-right font-black text-rose-600 text-sm">
                {formatPEN(p.pendingDebt)}
            </td>

            {/* Paid - To Bill */}
            <td className="py-3.5 pr-3 text-right font-bold text-amber-600 text-sm">
                {formatPEN(p.toBillDebt)}
            </td>

            {/* Paid - Invoiced */}
            <td className="py-3.5 pr-3 text-right font-semibold text-slate-500 text-sm">
                {formatPEN(p.invoicedDebt)}
            </td>

            <td className="py-3.5 text-center relative">
                <div className="relative inline-block text-left font-sans">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-xs"
                    >
                        <span>Cobrar/Facturar ⚙️</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-250 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <>
                            {/* Backdrop click blocker to close the menu */}
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setIsMenuOpen(false)}
                            />
                            
                            {/* Floating Dropdown Card */}
                            <div className="absolute right-0 bottom-full mb-1 w-60 bg-white border border-slate-150 rounded-2xl shadow-xl z-20 py-2.5 text-xs text-left divide-y divide-slate-100 font-sans animate-in fade-in slide-in-from-bottom-2 duration-150">
                                
                                {/* Section 1: Contact & Notifications */}
                                <div className="py-1 px-1.5 space-y-0.5">
                                    <p className="px-2 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contacto y Alertas</p>
                                    
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false)
                                            openNotificationModal()
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Enviar Notificación Web</span>
                                    </button>

                                    {p.pendingDebt > 0 && p.phone && (
                                        <a 
                                            href={wspUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                                            <span>Enviar WhatsApp</span>
                                        </a>
                                    )}

                                    {p.pendingDebt > 0 && (
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false)
                                                copyText(wspMsg, setCopiedReminder)
                                            }}
                                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-amber-600" />
                                            <span>{copiedReminder ? '¡Copiado!' : 'Copiar Recordatorio'}</span>
                                        </button>
                                    )}
                                </div>

                                {/* Section 2: Billing & Invoicing (only if toBillDebt > 0) */}
                                {p.toBillDebt > 0 && (
                                    <div className="py-1 px-1.5 space-y-0.5">
                                        <p className="px-2 pt-1.5 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Facturación</p>
                                        
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false)
                                                copyText(getBoletaTemplate(), setCopiedBoleta)
                                            }}
                                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                                            <span>{copiedBoleta ? '¡Boleta Copiada!' : 'Copiar Plantilla Boleta'}</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false)
                                                copyText(getFacturaTemplate(), setCopiedFactura)
                                            }}
                                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>{copiedFactura ? '¡Factura Copiada!' : 'Copiar Plantilla Factura'}</span>
                                        </button>

                                        <button
                                            disabled={isPending}
                                            onClick={() => {
                                                setIsMenuOpen(false)
                                                handleMarkAllInvoiced()
                                            }}
                                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5 text-primary-600" />}
                                            <span>Marcar Facturado</span>
                                        </button>
                                    </div>
                                )}

                                {/* Section 3: Status & Admin Control */}
                                <div className="py-1 px-1.5 space-y-0.5">
                                    <p className="px-2 pt-1.5 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estado y Control</p>
                                    
                                    <button
                                        disabled={isPending}
                                        onClick={() => {
                                            setIsMenuOpen(false)
                                            handleTogglePenalty()
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 hover:bg-slate-50 font-bold rounded-lg flex items-center gap-2 transition-colors ${
                                            p.isPenalized ? 'text-emerald-705 hover:text-emerald-800' : 'text-rose-705 hover:text-rose-800'
                                        } disabled:opacity-50`}
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : p.isPenalized ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                            <Slash className="w-3.5 h-3.5 text-rose-600" />
                                        )}
                                        <span>{p.isPenalized ? 'Habilitar Cuenta' : 'Penalizar Cuenta'}</span>
                                    </button>
                                </div>

                            </div>
                        </>
                    )}
                </div>

                {isNotifOpen && (
                    <Dialog open={isNotifOpen} onOpenChange={setIsNotifOpen}>
                        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6">
                            <DialogHeader>
                                <DialogTitle className="text-slate-900 font-black text-base flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-blue-600 animate-bounce" />
                                    Enviar Notificación a {p.fullName}
                                </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4 text-xs font-sans">
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block">Título de la Notificación</label>
                                    <input
                                        type="text"
                                        value={notifTitle}
                                        onChange={e => setNotifTitle(e.target.value)}
                                        placeholder="Ej: Aviso de comisión"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 animate-in fade-in"
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block">Mensaje / Detalle</label>
                                    <textarea
                                        value={notifMsg}
                                        onChange={e => setNotifMsg(e.target.value)}
                                        placeholder="Escribe el mensaje aquí..."
                                        rows={5}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none animate-in fade-in"
                                    />
                                </div>
                                
                                <p className="text-[10px] text-slate-400 leading-normal">
                                    * Esta notificación aparecerá de forma inmediata en el panel de control del proveedor bajo la sección de alertas de su Dashboard.
                                </p>
                            </div>
                            
                            <DialogFooter className="flex gap-2 sm:justify-end font-sans">
                                <button
                                    type="button"
                                    onClick={() => setIsNotifOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 font-semibold text-xs rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={handleSendNotification}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-750 disabled:bg-blue-400 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        'Enviar Notificación'
                                    )}
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </td>
        </tr>
    )
}
