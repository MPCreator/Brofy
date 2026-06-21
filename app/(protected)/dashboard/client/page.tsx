import { requireRole } from '@/lib/auth'
import { getUserPets, getClientAppointments, getClientReminders } from '@/lib/actions'
import Link from 'next/link'
import {
    PawPrint,
    Calendar,
    MapPin,
    ChevronRight,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    CalendarPlus,
    ShieldCheck,
} from 'lucide-react'
import { formatDate, formatPEN } from '@/lib/utils'
import { APPOINTMENT_STATUS_LABELS, SPECIES_LABELS } from '@/lib/types'
import { QuickRescheduleButton } from '@/components/dashboard/quick-reschedule'
import { ClientRemindersList } from '@/components/dashboard/client-reminders'
import { ClientPetsList } from '@/components/dashboard/ClientPetsList'

export default async function ClientDashboard() {
    const session = await requireRole(['client'])
    const pets = await getUserPets()
    const appointments = await getClientAppointments()
    const reminders = await getClientReminders()

    const now = Date.now();
    const TOLERANCE_MS = 30 * 60 * 1000; // 30 minutos de tolerancia

    // Citas activas o futuras (pagadas, confirmadas, pendientes, en atención)
    const activeAppointments = appointments.filter((apt: any) => {
        if (apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'disputed') return false;
        // Excluir citas vencidas sin atender con más de 48 horas
        if ((apt.status === 'paid' || apt.status === 'confirmed') && apt.scheduledAt) {
            const diff = Date.now() - new Date(apt.scheduledAt).getTime();
            if (diff > 48 * 60 * 60 * 1000) return false;
        }
        return true;
    });

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Hola, {session.fullName.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Gestiona la salud de tus mascotas
                </p>
            </div>

            {/* Quick Actions */}
            <Link
                href="/dashboard/discover"
                className="flex items-center gap-4 p-5 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarPlus className="w-7 h-7" />
                </div>
                <div>
                    <p className="font-bold text-base">Descubrir</p>
                    <p className="text-sm opacity-80">Encuentra veterinarias y servicios cercanos</p>
                </div>
            </Link>
            {/* Quick rebook — if user has a previous establishment */}
            <QuickRescheduleButton />

            {/* My Pets Preview */}
            {pets.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-slate-900">Mis Mascotas</h2>
                        <Link href="/dashboard/client/pets" className="text-xs text-primary-600 font-medium flex items-center gap-1">
                            Ver todas <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <ClientPetsList pets={pets} speciesLabels={SPECIES_LABELS} />
                </section>
            )}

            {/* Recordatorios y Controles */}
            <ClientRemindersList initialReminders={reminders} />

            {/* Citas Activas y Próximas */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Tus Próximas Citas
                </h2>

                {activeAppointments.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-sm">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-800">No tienes citas programadas</p>
                        <p className="text-xs text-slate-400 mt-1">Busca y reserva servicios veterinarios para tus mascotas.</p>
                        <Link
                            href="/dashboard/discover"
                            className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold rounded-xl transition-all"
                        >
                            Buscar locales cercanos →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeAppointments.map((apt: any) => {
                            const statusInfo = APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS]
                            const isPaid = apt.status === 'paid'
                            const appointmentTime = apt.scheduledAt ? new Date(apt.scheduledAt).getTime() : 0
                            const LIMIT_MS = 48 * 60 * 60 * 1000 // 48 horas de límite
                            const isStale = (apt.status === 'paid' || apt.status === 'confirmed') && (now - appointmentTime >= TOLERANCE_MS) && (now - appointmentTime <= LIMIT_MS)
                            const isRescheduleProposed = apt.rescheduledAt !== null && apt.rescheduleProposedBy !== null

                            return (
                                <div
                                    key={apt.id}
                                    className={`rounded-2xl border overflow-hidden transition-all bg-white hover:shadow-card hover:border-slate-200 ${
                                        isStale 
                                            ? 'border-amber-200 bg-amber-50/10 shadow-sm' 
                                            : isRescheduleProposed
                                                ? 'border-indigo-200 bg-indigo-50/10'
                                                : isPaid 
                                                    ? 'border-primary-100 shadow-sm shadow-primary-50/50' 
                                                    : 'border-slate-100'
                                    }`}
                                >
                                    {/* Card header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                isStale
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : isRescheduleProposed
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : isPaid 
                                                            ? 'bg-primary-50 text-primary-600' 
                                                            : 'bg-slate-50 text-slate-500'
                                            }`}>
                                                {isStale ? (
                                                    <AlertCircle className="w-5 h-5" />
                                                ) : isRescheduleProposed ? (
                                                    <Clock className="w-5 h-5 text-indigo-600" />
                                                ) : isPaid ? (
                                                    <ShieldCheck className="w-5 h-5 text-primary-600" />
                                                ) : (
                                                    <Clock className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate text-slate-900">
                                                    {(apt.establishment as { name: string })?.name || 'Establecimiento'}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {(apt.pet as { name: string })?.name} · {apt.serviceType}
                                                    {apt.scheduledAt && ` · ${new Date(apt.scheduledAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                                                </p>
                                                {apt.establishment?.address && (
                                                    <a 
                                                        href={`https://www.google.com/maps/search/?api=1&query=${apt.establishment.latitude && apt.establishment.longitude ? `${apt.establishment.latitude},${apt.establishment.longitude}` : encodeURIComponent(`${apt.establishment.name}, ${apt.establishment.address}, ${apt.establishment.city || 'Lima'}`)}`}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] flex items-center gap-1 mt-1 font-semibold text-primary-600 hover:text-primary-750 hover:underline w-fit"
                                                    >
                                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="truncate max-w-full sm:max-w-[280px]">
                                                            {apt.establishment.address}
                                                        </span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center sm:flex-col sm:items-end gap-1.5 shrink-0 w-fit self-start sm:self-auto ml-13 sm:ml-0">
                                            {isStale ? (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                    Sin Atender
                                                </span>
                                            ) : isRescheduleProposed ? (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                                    Reprogramada
                                                </span>
                                            ) : (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${statusInfo?.color || 'text-slate-600 bg-slate-100'}`}>
                                                    {statusInfo?.label || apt.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stale/Expired Alert Banner */}
                                    {isStale && (
                                        <div className="px-4 py-3 bg-amber-50/70 border-t border-amber-200 text-xs text-amber-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 leading-relaxed font-medium">
                                            <span>La hora de tu cita ya pasó sin atención. Puedes denunciar inasistencia para recuperar tu comisión.</span>
                                            <Link 
                                                href="/dashboard/client/pending" 
                                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm text-center shrink-0 w-fit"
                                            >
                                                Iniciar Reclamo
                                            </Link>
                                        </div>
                                    )}

                                    {/* Reschedule Proposed Banner */}
                                    {isRescheduleProposed && (
                                        <div className="px-4 py-3 bg-indigo-50/70 border-t border-indigo-200 text-xs text-indigo-855 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 leading-relaxed font-medium">
                                            <span>El veterinario propuso reprogramar tu cita. Revisa y aprueba el nuevo horario.</span>
                                            <Link 
                                                href="/dashboard/client/pending" 
                                                className="px-3 py-1 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm text-center shrink-0 w-fit"
                                            >
                                                Ver Propuesta
                                            </Link>
                                        </div>
                                    )}

                                    {/* OTP Banner */}
                                    {isPaid && !isStale && !isRescheduleProposed && apt.otpValidationCode && (
                                        <div className="px-4 py-3 bg-primary-600 flex items-center justify-between gap-3 text-white">
                                            <div>
                                                <p className="text-xs text-primary-200 font-medium">Código de atención</p>
                                                <p className="text-[10px] text-primary-300">Muéstraselo al veterinario al llegar</p>
                                            </div>
                                            <span className="font-mono text-xl font-black tracking-[0.2em] bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                                                {apt.otpValidationCode}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
