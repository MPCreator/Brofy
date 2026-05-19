import { requireRole } from '@/lib/auth'
import { getVetAppointments, getVetStats } from '@/lib/actions'
import Link from 'next/link'
import {
    Zap,
    ClipboardList,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Users,
    Tag,
    DollarSign,
    PawPrint,
} from 'lucide-react'
import { formatPEN } from '@/lib/utils'
import { APPOINTMENT_STATUS_LABELS } from '@/lib/types'

export default async function VetDashboard() {
    const session = await requireRole(['vet', 'provider'])
    const [stats, appointments] = await Promise.all([
        getVetStats(),
        getVetAppointments(),
    ])

    const pendingValidation = appointments.filter(a => a.status === 'paid')
    
    // Filtramos las citas programadas futuras que están pendientes de atención
    const upcomingAppointments = appointments.filter(a => {
        if (!a.scheduledAt || a.status === 'cancelled' || a.status === 'completed' || a.status === 'validated') return false
        return new Date(a.scheduledAt) >= new Date(new Date().setHours(0,0,0,0))
    }).sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Dr. {session.fullName.split(' ')[0]} 🩺
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Panel de control veterinario
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span className="text-xs font-medium text-slate-500">Hoy</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.todayCount}</p>
                    <p className="text-xs text-slate-500">citas programadas</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-medium text-slate-500">Este mes</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{formatPEN(stats.monthRevenue)}</p>
                    <p className="text-xs text-slate-500">ingresos</p>
                </div>

                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 opacity-80" />
                        <span className="text-xs font-medium opacity-80">Pendientes OTP</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.pendingOtp}</p>
                    <p className="text-xs opacity-80">esperando validación</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium text-slate-500">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.completedTotal}</p>
                    <p className="text-xs text-slate-500">atenciones</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <Link
                    href="/dashboard/vet/validate"
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                >
                    <Zap className="w-7 h-7 opacity-80" />
                    <div>
                        <p className="font-semibold text-sm">Validar OTP</p>
                        <p className="text-xs opacity-80">Desbloquear ficha</p>
                    </div>
                </Link>
                <Link
                    href="/dashboard/vet/fast-entry"
                    className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                >
                    <ClipboardList className="w-7 h-7 text-primary-600" />
                    <div>
                        <p className="font-semibold text-sm text-slate-900">Fast Entry</p>
                        <p className="text-xs text-slate-500">Ficha rápida</p>
                    </div>
                </Link>
                <Link
                    href="/dashboard/vet/services"
                    className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                >
                    <Tag className="w-7 h-7 text-emerald-600" />
                    <div>
                        <p className="font-semibold text-sm text-slate-900">Servicios</p>
                        <p className="text-xs text-slate-500">Tarifario</p>
                    </div>
                </Link>
                <Link
                    href="/dashboard/vet/finances"
                    className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                >
                    <DollarSign className="w-7 h-7 text-blue-600" />
                    <div>
                        <p className="font-semibold text-sm text-slate-900">Finanzas</p>
                        <p className="text-xs text-slate-500">Ingresos y gastos</p>
                    </div>
                </Link>
                <Link
                    href="/dashboard/vet/patients"
                    className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                >
                    <PawPrint className="w-7 h-7 text-violet-600" />
                    <div>
                        <p className="font-semibold text-sm text-slate-900">Mis Pacientes</p>
                        <p className="text-xs text-slate-500">Historial por mascota</p>
                    </div>
                </Link>
            </div>

            {/* Pending OTP Validation */}
            {pendingValidation.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Esperando Validación OTP
                    </h2>
                    <div className="space-y-2">
                        {pendingValidation.map(apt => (
                            <Link
                                key={apt.id}
                                href={`/dashboard/vet/validate?appointmentId=${apt.id}`}
                                className="block bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {(apt.client as { fullName: string })?.fullName || 'Cliente'}
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            {(apt.pet as { name: string })?.name} · {apt.serviceType}
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-1 rounded-full">
                                        PAGADO → Validar
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Agenda / Citas Programadas */}
            {upcomingAppointments.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-600" />
                            Agenda de Citas
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {upcomingAppointments.map(apt => (
                            <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                                <div className="text-center px-3 border-r border-slate-100">
                                    <div className="text-xs font-bold text-primary-600 uppercase">
                                        {new Date(apt.scheduledAt!).toLocaleDateString('es-ES', { month: 'short' })}
                                    </div>
                                    <div className="text-xl font-black text-slate-900">
                                        {new Date(apt.scheduledAt!).getDate()}
                                    </div>
                                    <div className="text-xs font-medium text-slate-500 mt-1">
                                        {new Date(apt.scheduledAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900">
                                        {(apt.client as { fullName: string })?.fullName || 'Cliente'} 
                                        <span className="text-slate-400 font-normal ml-1">con {(apt.pet as { name: string })?.name}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                                            {apt.serviceType}
                                        </span>
                                        {apt.notes && (
                                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md truncate max-w-[150px]" title={apt.notes}>
                                                Nota: {apt.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {apt.status === 'confirmed' || apt.status === 'paid' ? (
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> {apt.status === 'paid' ? 'Pagada / Confirmada' : 'Confirmada'}
                                        </span>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <form action={async () => {
                                                'use server'
                                                const { updateAppointmentStatus } = await import('@/lib/actions')
                                                await updateAppointmentStatus(apt.id, 'confirmed')
                                            }}>
                                                <button type="submit" className="w-full text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                                                    Confirmar
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Appointments */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Atenciones Recientes</h2>
                {appointments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No hay atenciones registradas</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {appointments.slice(0, 8).map(apt => {
                            const statusInfo = APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS]
                            return (
                                <div
                                    key={apt.id}
                                    className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                                        {apt.status === 'completed' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        ) : apt.status === 'validated' ? (
                                            <ClipboardList className="w-5 h-5 text-primary-500" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-amber-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {(apt.client as { fullName: string })?.fullName || 'Cliente'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {(apt.pet as { name: string })?.name} · {apt.serviceType}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo?.color || 'text-slate-600 bg-slate-100'}`}>
                                        {statusInfo?.label || apt.status}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
