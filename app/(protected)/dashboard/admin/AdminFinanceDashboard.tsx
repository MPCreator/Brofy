'use client'

import { useState, useTransition } from 'react'
import { toggleAppointmentInvoiceStatus } from '@/lib/actions'
import { toast } from 'sonner'
import { 
    ChevronDown, ChevronUp, Search, Calendar, FileText, CheckCircle2, 
    XCircle, Clock, RotateCcw, Check, Sparkles, Filter 
} from 'lucide-react'

interface AdminFinanceDashboardProps {
    appointments: any[]
}

export function AdminFinanceDashboard({ appointments: initialAppointments }: AdminFinanceDashboardProps) {
    const [appointments, setAppointments] = useState(initialAppointments)
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [processingId, setProcessingId] = useState<string | null>(null)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [commissionType, setCommissionType] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [billingFilter, setBillingFilter] = useState('all')

    async function handleToggleInvoice(appointmentId: string) {
        setProcessingId(appointmentId)
        try {
            const res = await toggleAppointmentInvoiceStatus(appointmentId)
            if (res.success) {
                toast.success('Estado de facturación actualizado')
                setAppointments(prev => prev.map(apt => {
                    if (apt.id === appointmentId) {
                        const currentPaymentId = apt.paymentId || ''
                        const newPaymentId = currentPaymentId.endsWith('_INVOICED') 
                            ? currentPaymentId.replace('_INVOICED', '')
                            : `${currentPaymentId}_INVOICED`
                        return { ...apt, paymentId: newPaymentId }
                    }
                    return apt
                }))
            } else {
                toast.error(res.message || 'Error al actualizar')
            }
        } catch {
            toast.error('Error de conexión')
        } finally {
            setProcessingId(null)
        }
    }

    // Filter logic
    const filteredAppointments = appointments.filter(apt => {
        // 1. Text Search
        const clientName = apt.client?.fullName?.toLowerCase() || ''
        const petName = apt.pet?.name?.toLowerCase() || ''
        const estName = apt.establishment?.name?.toLowerCase() || ''
        const term = searchTerm.toLowerCase()
        if (term && !clientName.includes(term) && !petName.includes(term) && !estName.includes(term)) {
            return false
        }

        // 2. Date Range Search
        if (apt.scheduledAt) {
            const aptDate = new Date(apt.scheduledAt).toISOString().split('T')[0]
            if (startDate && aptDate < startDate) return false
            if (endDate && aptDate > endDate) return false
        } else if (startDate || endDate) {
            return false
        }

        // 3. Commission Type
        if (commissionType !== 'all' && apt.commissionType !== commissionType) {
            return false
        }

        // 4. Status
        if (statusFilter !== 'all' && apt.status !== statusFilter) {
            return false
        }

        // 5. Billing/Invoice status
        const payId = apt.paymentId || ''
        const isPending = payId === 'DEBT'
        const isToBill = payId.startsWith('PAID-') || (payId !== '' && payId !== 'DEBT' && !payId.endsWith('_INVOICED'))
        const isSent = payId.endsWith('_INVOICED')

        if (billingFilter === 'pending' && !isPending) return false
        if (billingFilter === 'tobill' && !isToBill) return false
        if (billingFilter === 'sent' && !isSent) return false

        return true
    })

    return (
        <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            {/* Header / Collapse Toggle */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-550" />
                        Últimos Agendamientos del Sistema ({filteredAppointments.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Historial de las últimas 100 citas del sistema. Filtra y controla el estado de cobros y emisión de boletas/facturas.</p>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                    {isCollapsed ? (
                        <>
                            Expandir <ChevronDown className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            Colapsar <ChevronUp className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>

            {/* Collapsible Content */}
            {!isCollapsed && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Filters Dashboard */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        {/* Search Term */}
                        <div className="space-y-1">
                            <label className="font-bold text-slate-555 flex items-center gap-1"><Search className="w-3.5 h-3.5" /> Buscar</label>
                            <input
                                type="text"
                                placeholder="Cliente, mascota o establecimiento..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>

                        {/* Date Range Start */}
                        <div className="space-y-1">
                            <label className="font-bold text-slate-555 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Fecha Inicio</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>

                        {/* Date Range End */}
                        <div className="space-y-1">
                            <label className="font-bold text-slate-555 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Fecha Fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>

                        {/* Commission Type */}
                        <div className="space-y-1">
                            <label className="font-bold text-slate-555 flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Comisión</label>
                            <select
                                value={commissionType}
                                onChange={e => setCommissionType(e.target.value)}
                                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                                <option value="all">Todas</option>
                                <option value="booking">Reserva Online (S/ 5.00)</option>
                                <option value="walkin">Registro Manual (S/ 6.00)</option>
                            </select>
                        </div>

                        {/* Appointment Status */}
                        <div className="space-y-1">
                            <label className="font-bold text-slate-555 flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Estado Cita</label>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                                <option value="all">Todos</option>
                                <option value="completed">Completado (Completed)</option>
                                <option value="paid">Pagado (Paid)</option>
                                <option value="validated">Validado (Validated)</option>
                                <option value="cancelled">Cancelado (Cancelled)</option>
                                <option value="pending">Pendiente (Pending)</option>
                            </select>
                        </div>

                        {/* Billing Status */}
                        <div className="space-y-1">
                            <label className="font-bold text-slate-555 flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Facturación</label>
                            <select
                                value={billingFilter}
                                onChange={e => setBillingFilter(e.target.value)}
                                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="pending">Pendiente de Pago (DEBT)</option>
                                <option value="tobill">Por Facturar (Cobrado)</option>
                                <option value="sent">Enviado (Boleta/Factura emitida)</option>
                            </select>
                        </div>
                    </div>

                    {/* Bookings List Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                                    <th className="pb-3">Fecha</th>
                                    <th className="pb-3">Cliente / Mascota</th>
                                    <th className="pb-3">Establecimiento</th>
                                    <th className="pb-3">Comisión</th>
                                    <th className="pb-3">Estado Cita</th>
                                    <th className="pb-3">Facturación</th>
                                    <th className="pb-3 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-750">
                                {filteredAppointments.map((apt) => {
                                    const payId = apt.paymentId || ''
                                    const isPending = payId === 'DEBT'
                                    const isSent = payId.endsWith('_INVOICED')
                                    const isToBill = payId !== '' && payId !== 'DEBT' && !isSent

                                    return (
                                        <tr key={apt.id} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="py-3 pr-3 font-medium whitespace-nowrap">
                                                {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString('es-PE', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'N/A'}
                                            </td>
                                            <td className="py-3 pr-3">
                                                <p className="font-bold text-slate-800">{apt.client?.fullName}</p>
                                                <p className="text-slate-400 text-[10px]">Mascota: {apt.pet?.name}</p>
                                            </td>
                                            <td className="py-3 pr-3 font-semibold text-slate-800">
                                                {apt.establishment?.name}
                                            </td>
                                            <td className="py-3 pr-3">
                                                {apt.commissionType === 'walkin' ? (
                                                    <span className="inline-block bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-100">
                                                        Manual S/ 6.00
                                                    </span>
                                                ) : (
                                                    <span className="inline-block bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-100">
                                                        Online S/ 5.00
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-3">
                                                <span className={`inline-block font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                                    apt.status === 'completed' 
                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                        : apt.status === 'cancelled' 
                                                            ? 'bg-red-50 text-red-750' 
                                                            : 'bg-slate-100 text-slate-650'
                                                }`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-3">
                                                {isPending && (
                                                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-750 px-2 py-0.5 rounded-full font-bold">
                                                        <Clock className="w-3 h-3" /> Pendiente
                                                    </span>
                                                )}
                                                {isToBill && (
                                                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                                                        <Clock className="w-3 h-3 animate-pulse" /> Por Facturar
                                                    </span>
                                                )}
                                                {isSent && (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enviado
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-center">
                                                {isPending ? (
                                                    <span className="text-[10px] text-slate-400 font-medium">Requiere Pago</span>
                                                ) : (
                                                    <button
                                                        disabled={processingId === apt.id}
                                                        onClick={() => handleToggleInvoice(apt.id)}
                                                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] shadow-xs active:scale-95 transition-all flex items-center gap-1 mx-auto ${
                                                            isSent 
                                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                                                                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-100'
                                                        }`}
                                                    >
                                                        {isSent ? (
                                                            <>
                                                                <RotateCcw className="w-3 h-3" /> Revertir
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="w-3 h-3" /> Marcar Enviado
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredAppointments.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-slate-400">Ningún agendamiento coincide con los filtros aplicados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    )
}
