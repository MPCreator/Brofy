import { requireRole } from '@/lib/auth'
import { getVetAppointments, getVetStats, getOpenFichas, getVetReminders } from '@/lib/actions'
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
    FileWarning,
    Building2,
} from 'lucide-react'
import { formatPEN } from '@/lib/utils'
import { APPOINTMENT_STATUS_LABELS } from '@/lib/types'
import { VetRemindersList } from '@/components/dashboard/vet-reminders'
import { VetAppointmentCard } from '@/components/dashboard/vet-appointment-card'

export default async function VetDashboard({
    searchParams
}: {
    searchParams?: { tab?: string }
}) {
    const activeTab = searchParams?.tab || 'agenda'
    const session = await requireRole(['vet', 'provider'])
    const [stats, appointments, openFichas, reminders] = await Promise.all([
        getVetStats(),
        getVetAppointments(),
        getOpenFichas(),
        getVetReminders(),
    ])

    const pendingValidation = appointments.filter((a:any) => a.status === 'paid')

    // Build unique patients list for the notification dropdown
    const patientsMap = new Map<string, { petId: string; petName: string; clientId: string; clientName: string }>()
    for (const apt of appointments) {
        const pet = apt.pet as any
        const client = apt.client as any
        if (pet && client) {
            patientsMap.set(pet.id, {
                petId: pet.id,
                petName: pet.name,
                clientId: client.id,
                clientName: client.fullName
            })
        }
    }
    const patientsList = Array.from(patientsMap.values())
    
    // Filtramos las citas programadas futuras que están pendientes de atención
    const upcomingAppointments = appointments
    .filter((a: any) => {
        if (
            !a.scheduledAt ||
            a.status === 'cancelled' ||
            a.status === 'completed' ||
            a.status === 'validated'
        ) return false

        return new Date(a.scheduledAt) >= new Date(new Date().setHours(0,0,0,0))
    })
    .sort((a: any, b: any) =>
        new Date(a.scheduledAt!).getTime() -
        new Date(b.scheduledAt!).getTime()
    )

    return (
        <div className="space-y-6 pb-20 lg:pb-0 font-sans">
            {/* Welcome */}
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        {session.role === 'vet' ? `Dr. ${session.fullName.split(' ')[0]} 🩺` : `${session.fullName.split(' ')[0]} 🏪`}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        {session.role === 'vet' ? 'Panel de control veterinario' : 'Panel de control de servicios'}
                    </p>
                </div>
            </div>

            {/* Tabs Navigation Selector */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1.5 w-fit">
                <Link
                    href="?tab=agenda"
                    className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                        activeTab === 'agenda'
                            ? 'bg-white text-primary-700 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                    Agenda y Atención 🩺
                </Link>
                <Link
                    href="?tab=stats"
                    className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                        activeTab === 'stats'
                            ? 'bg-white text-primary-700 shadow-sm border border-slate-200/30'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                    Estadísticas y Operaciones 📊
                </Link>
            </div>

            {/* TAB CONTENT: AGENDA Y ATENCION */}
            {activeTab === 'agenda' && (
                <div className="space-y-6 animate-in fade-in">
                    {/* Operational Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-primary-600" />
                                <span className="text-xs font-semibold text-slate-500">Agenda Hoy</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{stats.todayCount}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">citas programadas</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-semibold text-slate-500">Esperando</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{stats.pendingOtp}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">clientes con código activo</p>
                        </div>
                    </div>

                    {/* Operational Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            href="/dashboard/vet/validate"
                            className="flex items-center gap-4 p-5 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Zap className="w-7 h-7 stroke-[2.5]" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-base leading-tight">Iniciar Atención</p>
                                <p className="text-xs opacity-90 mt-1">Ingresar código de cliente</p>
                            </div>
                        </Link>
                        <Link
                            href="/dashboard/vet/fast-entry"
                            className="flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <ClipboardList className="w-7 h-7 stroke-[2.5]" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-base leading-tight">
                                    {session.role === 'vet' ? 'Ficha Rápida' : 'Registro Rápido'}
                                </p>
                                <p className="text-xs opacity-90 mt-1">
                                    {session.role === 'vet' ? 'Registrar consulta clínica' : 'Registrar servicio realizado'}
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Pending OTP Validation Alerts */}
                    {pendingValidation.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                Clientes esperando atención ({pendingValidation.length})
                            </h2>
                            <div className="space-y-2">
                                {pendingValidation.map((apt: any) => (
                                    <Link
                                        key={apt.id}
                                        href={`/dashboard/vet/validate?appointmentId=${apt.id}`}
                                        className="block bg-white border border-slate-100 hover:border-amber-250 rounded-2xl p-4 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                                                    <Zap className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {(apt.client as { fullName: string })?.fullName || 'Cliente'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                                        🐶 {(apt.pet as { name: string })?.name} · {apt.serviceType}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 rounded-xl uppercase tracking-wider shrink-0 transition-colors shadow-sm">
                                                Atender ahora →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Fichas abiertas sin completar */}
                    {openFichas.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <FileWarning className="w-4 h-4 text-rose-500" />
                                Fichas clínicas pendientes ({openFichas.length})
                            </h2>
                            <div className="space-y-2">
                                {openFichas.map((apt: any) => (
                                    <Link
                                        key={apt.id}
                                        href={`/dashboard/vet/fast-entry?appointmentId=${apt.id}`}
                                        className="block bg-white border border-slate-100 hover:border-rose-250 rounded-2xl p-4 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                                                    <FileWarning className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {(apt.client as { fullName: string })?.fullName || 'Cliente'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                                        🐶 {(apt.pet as { name: string })?.name} · {apt.serviceType}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-xl uppercase tracking-wider shrink-0 transition-colors shadow-sm">
                                                Completar Ficha →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Agenda de Citas Programadas */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-650" />
                            Agenda de Citas Programadas
                        </h2>
                        {upcomingAppointments.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No tienes citas programadas pendientes hoy</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {upcomingAppointments.map((apt: any) => (
                                    <VetAppointmentCard key={apt.id} apt={apt} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Reminders Zones */}
                    <VetRemindersList initialReminders={reminders} patients={patientsList} />
                </div>
            )}

            {/* TAB CONTENT: ESTADISTICAS Y OPERACIONES */}
            {activeTab === 'stats' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Performance Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-semibold text-slate-500">Ingresos del Mes</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{formatPEN(stats.monthRevenue)}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">facturado en la plataforma</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-semibold text-slate-550">Atenciones Realizadas</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{stats.completedTotal}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">atenciones completadas</p>
                        </div>
                    </div>

                    {/* Secondary Management Quick Actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Link
                            href="/dashboard/vet/establishment"
                            className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-100 rounded-2xl hover:border-amber-250 hover:bg-amber-50/20 transition-all shadow-sm"
                        >
                            <Building2 className="w-6 h-6 text-amber-600 mb-1" />
                            <span className="font-bold text-xs text-slate-800">Mi Local</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">Sedes y Horarios</span>
                        </Link>
                        <Link
                            href="/dashboard/vet/services"
                            className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-100 rounded-2xl hover:border-emerald-250 hover:bg-emerald-50/20 transition-all shadow-sm"
                        >
                            <Tag className="w-6 h-6 text-emerald-600 mb-1" />
                            <span className="font-bold text-xs text-slate-800">Servicios</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">Tarifas</span>
                        </Link>
                        <Link
                            href="/dashboard/vet/finances"
                            className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-100 rounded-2xl hover:border-blue-250 hover:bg-blue-50/20 transition-all shadow-sm"
                        >
                            <DollarSign className="w-6 h-6 text-blue-600 mb-1" />
                            <span className="font-bold text-xs text-slate-800">Finanzas</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">Gastos</span>
                        </Link>
                        <Link
                            href="/dashboard/vet/patients"
                            className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-100 rounded-2xl hover:border-violet-250 hover:bg-violet-50/20 transition-all shadow-sm"
                        >
                            <PawPrint className="w-6 h-6 text-violet-600 mb-1" />
                            <span className="font-bold text-xs text-slate-800">Pacientes</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">Historial</span>
                        </Link>
                    </div>

                    {/* Visor de Atenciones por Sede y Especialistas */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                📊 Visor de Operaciones y Rendimiento
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">Control de atenciones acumuladas por local y especialista médico</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 pt-2">
                            {/* Sedes stats */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    🏪 Desglose por Local (Sedes)
                                </h3>
                                {stats.estStats?.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No tienes locales registrados</p>
                                ) : (
                                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                        {stats.estStats?.map((est: any) => (
                                            <div key={est.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-xs text-slate-800 truncate max-w-[170px]">{est.name}</span>
                                                    <span className="text-[10px] bg-slate-200/80 text-slate-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Total: {est.total}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-bold">
                                                    <span className="text-amber-600 flex items-center gap-1">⏰ Pendientes: {est.pending}</span>
                                                    <span className="text-slate-400">|</span>
                                                    <span className="text-emerald-600 flex items-center gap-1">✓ Completadas: {est.completed}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Specialists stats */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    🩺 Rendimiento de Especialistas
                                </h3>
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {stats.specStats?.map((spec: any, idx: number) => (
                                        <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                                            <div className="min-w-0 pr-2">
                                                <p className="font-bold text-xs text-slate-800 truncate">{spec.name}</p>
                                                <p className="text-[9px] font-mono text-slate-400 mt-0.5">CMVP: {spec.cmvpId}</p>
                                            </div>
                                            <span className="shrink-0 text-xs font-bold bg-primary-100 text-primary-850 px-2.5 py-1 rounded-lg">
                                                {spec.count} {spec.count === 1 ? 'atención' : 'atenciones'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Appointments History */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-900">Historial Reciente de Atenciones</h2>
                        {appointments.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No hay atenciones registradas</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {appointments.slice(0, 8).map((apt: any) => {
                                    const statusInfo = APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS]
                                    return (
                                        <div
                                            key={apt.id}
                                            className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm"
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
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    🐶 {(apt.pet as { name: string })?.name} · {apt.serviceType}
                                                </p>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo?.color || 'text-slate-700 bg-slate-100'} shrink-0`}>
                                                {statusInfo?.label || apt.status}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    )
}
