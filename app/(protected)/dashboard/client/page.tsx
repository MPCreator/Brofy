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
import { formatDate, formatDateTime, formatPEN } from '@/lib/utils'
import { APPOINTMENT_STATUS_LABELS, SPECIES_LABELS } from '@/lib/types'
import { QuickRescheduleButton } from '@/components/dashboard/quick-reschedule'
import { ClientRemindersList } from '@/components/dashboard/client-reminders'
import { ClientPetsList } from '@/components/dashboard/ClientPetsList'
import { ClientOnboarding } from '@/components/dashboard/ClientOnboarding'

export default async function ClientDashboard() {
    const session = await requireRole(['client'])
    const [pets, appointments, reminders] = await Promise.all([
        getUserPets(),
        getClientAppointments(),
        getClientReminders()
    ])

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
            <ClientOnboarding initialNeedsOnboarding={pets.length === 0} />
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Hola, {session.fullName.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Gestiona el cuidado y citas de tus mascotas
                </p>
            </div>

            {/* Reminders section */}
            <ClientRemindersList initialReminders={reminders} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                    href="/dashboard/discover"
                    className="p-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl flex items-center justify-between shadow-lg shadow-primary-500/20 group transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <CalendarPlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Reservar Cita</p>
                            <p className="text-xs text-primary-100 mt-0.5">Encuentra veterinarios y servicios</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                    href="/dashboard/client/pets"
                    className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <PawPrint className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-900">Mis Mascotas ({pets.length})</p>
                            <p className="text-xs text-slate-500 mt-0.5">Ver perfiles y carnets</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Active / Upcoming Appointments */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-600" /> Próximas Citas ({activeAppointments.length})
                    </h2>
                    <Link
                        href="/dashboard/client/pending"
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                        Ver todas <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {activeAppointments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-600">No tienes citas programadas</p>
                        <p className="text-xs text-slate-400 mt-1">Busca un veterinario o servicio para agendar</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeAppointments.map((apt: any) => {
                            const statusInfo = APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS]
                            const isPaid = apt.status === 'paid' || apt.status === 'confirmed'
                            const isStale = isPaid && apt.scheduledAt && (now - new Date(apt.scheduledAt).getTime() > 48 * 60 * 60 * 1000)
                            const appointmentTime = apt.scheduledAt ? new Date(apt.scheduledAt).getTime() : 0
                            const isPastTolerance = appointmentTime > 0 && (now > appointmentTime + TOLERANCE_MS)
                            const canClientClaim = isPaid && isPastTolerance
                            const isRescheduleProposed = apt.rescheduledAt !== null && apt.rescheduleProposedBy !== null

                            return (
                                <div
                                    key={apt.id}
                                    className={`p-4 rounded-2xl border transition-all ${
                                        isStale
                                            ? 'bg-amber-50/50 border-amber-200'
                                            : isRescheduleProposed
                                                ? 'bg-amber-50 border-amber-300'
                                                : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-start sm:items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                isStale 
                                                    ? 'bg-amber-100 text-amber-700' 
                                                    : isRescheduleProposed 
                                                        ? 'bg-amber-100 text-amber-700' 
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
                                                    {apt.scheduledAt && ` · ${formatDateTime(apt.scheduledAt)}`}
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
                                    {(apt.status === 'paid' || apt.status === 'confirmed') && !isRescheduleProposed && apt.otpValidationCode && (
                                        <div className={`px-4 py-3 flex flex-col gap-2.5 border-t transition-all ${
                                            isStale 
                                                ? 'bg-white text-slate-800 border-amber-100' 
                                                : 'bg-primary-600 text-white border-primary-500'
                                        }`}>
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className={`text-xs font-semibold ${isStale ? 'text-slate-700' : 'text-white/95'}`}>Código de verificación</p>
                                                    <p className={`text-[10px] ${isStale ? 'text-slate-400' : 'text-white/80'}`}>Muéstraselo al especialista al llegar</p>
                                                </div>
                                                <span className={`font-mono text-xl font-black tracking-[0.2em] px-3 py-1.5 rounded-lg border ${
                                                    isStale 
                                                        ? 'bg-amber-50/50 border-amber-200 text-amber-900 shadow-sm' 
                                                        : 'bg-white/10 border-white/20 text-white'
                                                }`}>
                                                    {apt.otpValidationCode}
                                                </span>
                                            </div>
                                            {isStale && (
                                                <div className="border-t border-amber-100 pt-2.5 mt-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs bg-amber-50/50 -mx-4 -mb-3 p-3 mt-1.5 border-b-0 border-l-0 border-r-0 border">
                                                    <span className="text-[11px] text-amber-900 font-medium leading-normal flex-1">
                                                        ⚠️ El horario de tu cita ya pasó sin atención. Puedes iniciar un Reclamo por inasistencia.
                                                    </span>
                                                    <Link 
                                                        href={`/dashboard/client/pending?claim=${apt.id}`} 
                                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-sm text-center shrink-0 w-fit active:scale-95 border border-amber-550/20 transition-all"
                                                    >
                                                        Iniciar Reclamo
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
