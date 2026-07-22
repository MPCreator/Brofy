import { requireRole } from '@/lib/auth'
import { getVetAppointments, getVetStats, getOpenFichas, getVetReminders, getMyEstablishments, getVetDebt, getVetAgendaStats } from '@/lib/actions'
import { ProviderOnboarding } from '@/components/dashboard/ProviderOnboarding'
import Link from 'next/link'
import prisma from '@/lib/prisma'
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
    Building2,
    X,
    Plus,
    Edit,
    ShieldAlert,
} from 'lucide-react'
import { formatPEN, getPeruStartOfDay, getPeruEndOfDay } from '@/lib/utils'
import { APPOINTMENT_STATUS_LABELS } from '@/lib/types'
import { VetRemindersList } from '@/components/dashboard/vet-reminders'
import { VetAppointmentCard } from '@/components/dashboard/vet-appointment-card'
import SafeImage from '@/components/ui/SafeImage'
import { VetTabs } from '@/components/dashboard/VetTabs'

export default async function VetDashboard({
    searchParams
}: {
    searchParams?: { tab?: string }
}) {
    const activeTab = searchParams?.tab || 'agenda'
    const session = await requireRole(['vet', 'provider'])

    // Base profile and establishments data
    const [profile, debt, establishments] = await Promise.all([
        prisma.profile.findUnique({
            where: { id: session.sub },
            select: { isPenalized: true, cmvpValidated: true, role: true }
        }),
        getVetDebt(),
        getMyEstablishments()
    ])

    let stats: any = { todayCount: 0, monthRevenue: 0, pendingOtp: 0, completedTotal: 0, estStats: [], specStats: [] }
    let appointments: any[] = []
    let openFichas: any[] = []
    let reminders: any[] = []

    if (activeTab === 'agenda') {
        const [agendaStats, appointmentsData, openFichasData, remindersData] = await Promise.all([
            getVetAgendaStats(),
            getVetAppointments(),
            getOpenFichas(),
            getVetReminders()
        ])
        stats = { ...stats, ...agendaStats }
        appointments = appointmentsData
        openFichas = openFichasData
        reminders = remindersData
    } else if (activeTab === 'stats') {
        stats = await getVetStats()
    }

    const isPenalized = profile?.isPenalized || false
    const isBlocked = isPenalized || debt >= 120
    const isPendingCmvp = profile?.role === 'vet' && !profile?.cmvpValidated

    const needsOnboarding = establishments.length === 0 || establishments.every((est: any) => !est.services || est.services.length === 0)

    const endOfToday = getPeruEndOfDay()

    const pendingValidation = appointments
        .filter((a:any) => {
            if (a.status !== 'paid') return false

            // Age filter: must be <= 48 hours to match validation page
            const aptTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : new Date(a.createdAt).getTime()
            const ageMs = Date.now() - aptTime
            if (ageMs > 48 * 60 * 60 * 1000) return false

            if (!a.scheduledAt) return true // walk-in
            return (new Date(a.scheduledAt).getTime() - Date.now()) <= 15 * 60 * 1000
        })
        .sort((a: any, b: any) => {
            const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : new Date(a.createdAt).getTime();
            const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : new Date(b.createdAt).getTime();
            return timeA - timeB;
        })

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

        return new Date(a.scheduledAt) >= getPeruStartOfDay()
    })
    .sort((a: any, b: any) =>
        new Date(a.scheduledAt!).getTime() -
        new Date(b.scheduledAt!).getTime()
    )

    return (
        <div className="space-y-6 pb-20 lg:pb-0 font-sans">
            <ProviderOnboarding 
                initialNeedsOnboarding={needsOnboarding}
                userRole={session.role} 
                initialEstablishmentId={establishments[0]?.id} 
            />
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

            {/* Pending CMVP Validation Warning Banner */}
            {isPendingCmvp && (
                <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/70 border border-amber-250 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 shadow-inner">
                            <ShieldAlert className="w-6 h-6 text-amber-600 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                                Colegiatura (CMVP) en Proceso de Aprobación ⚠️
                            </h2>
                            <p className="text-xs text-amber-800 mt-1 max-w-2xl font-medium leading-relaxed">
                                Tu número de colegiatura veterinaria está siendo verificado por el administrador. Mientras tanto, tu establecimiento <strong className="text-amber-950">no será visible</strong> en las búsquedas ni en la página de reservas públicas de los clientes. Podrás gestionar tu local de forma privada. <strong className="text-amber-950">Nos comunicaremos contigo en un plazo aproximado de 24 horas útiles (días hábiles) para validar tu colegiatura.</strong>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Banner */}
            {isBlocked && (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600 shadow-inner animate-pulse">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-rose-950 flex items-center gap-1.5">
                                Acceso Restringido para Atenciones Presenciales 🚫
                            </h2>
                            <p className="text-xs text-rose-750 mt-1 max-w-2xl font-medium leading-relaxed">
                                Tu cuenta se encuentra temporalmente restringida para realizar Fichas Clínicas Rápidas y atenciones manuales presenciales, ya sea por penalización manual o por acumulación de comisiones pendientes (monto actual: <strong className="text-rose-950 font-bold">{formatPEN(debt)}</strong>). Las reservas en línea vía web siguen funcionando con normalidad.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/vet/finances"
                        className="shrink-0 w-full md:w-auto text-center px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                    >
                        Liquidar Deuda en Finanzas
                    </Link>
                </div>
            )}

            {/* Tabs Navigation Selector */}
            <VetTabs activeTab={activeTab} />

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
                            <p className="text-2xl font-black text-slate-900">{pendingValidation.length}</p>
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
                            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                    Clientes esperando atención ({pendingValidation.length})
                                </span>
                                <Link href="/dashboard/vet/validate" className="text-xs text-primary-600 hover:text-primary-700 font-bold transition-colors">
                                    Ver todos (sala de espera) →
                                </Link>
                            </h2>
                            <div className="space-y-2">
                                {pendingValidation.map((apt: any, index: number) => {
                                    const timeToCompare = apt.scheduledAt ? new Date(apt.scheduledAt) : new Date(apt.createdAt);
                                    const diffMs = Date.now() - timeToCompare.getTime();
                                    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
                                    const isOverdue = (() => {
                                        if (diffMins > 30) return true
                                        if (apt.scheduledAt) {
                                            const scheduledTime = new Date(apt.scheduledAt).getTime()
                                            if (Date.now() - scheduledTime > 15 * 60 * 1000) {
                                                return true
                                            }
                                        }
                                        return false
                                    })()

                                    const isNoShowWindow = (() => {
                                        if (!apt.scheduledAt) return false;
                                        const scheduledTime = new Date(apt.scheduledAt).getTime();
                                        const diff = Date.now() - scheduledTime;
                                        return diff >= 24 * 60 * 60 * 1000 && diff <= 48 * 60 * 60 * 1000;
                                    })();

                                    const waitText = diffMins < 60 ? `${diffMins} min` : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
                                    
                                    const scheduledText = apt.scheduledAt 
                                        ? new Date(apt.scheduledAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })
                                        : "—";

                                    return (
                                        <Link
                                            key={apt.id}
                                            href={isNoShowWindow
                                                ? `/dashboard/vet/validate?appointmentId=${apt.id}&action=report`
                                                : `/dashboard/vet/validate?appointmentId=${apt.id}`
                                            }
                                            className={`block bg-white border rounded-2xl p-4 transition-all shadow-sm ${
                                                isOverdue 
                                                    ? 'border-red-100 hover:border-red-250 bg-red-50/10'
                                                    : 'border-slate-100 hover:border-amber-250'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {/* Turno index badge */}
                                                    <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                                                        isOverdue 
                                                            ? 'bg-red-50 text-red-650 animate-pulse'
                                                            : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        <span className={`text-[9px] font-extrabold uppercase leading-none ${isOverdue ? 'text-red-500' : 'text-amber-500'}`}>Turno</span>
                                                        <span className="text-sm font-black leading-none mt-0.5">#{index + 1}</span>
                                                    </div>
                                                    
                                                    {/* Pet Avatar */}
                                                    <div className="relative w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-xl overflow-hidden shrink-0">
                                                        <SafeImage
                                                            src={apt.pet?.photoUrl || ''}
                                                            alt={apt.pet?.name || 'Mascota'}
                                                            className="w-full h-full object-cover"
                                                            fallback={
                                                                <span>
                                                                    {apt.pet?.species === 'dog' ? '🐕' : apt.pet?.species === 'cat' ? '🐈' : '🐾'}
                                                                </span>
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate">
                                                            {(apt.client as { fullName: string })?.fullName || 'Cliente'}
                                                        </p>
                                                        <p className="text-xs text-slate-555 mt-0.5 font-medium flex flex-wrap items-center gap-1.5 truncate">
                                                            <span className="font-bold text-slate-700">{apt.pet?.name}</span>
                                                            <span className="text-slate-355 font-normal">·</span>
                                                            <span 
                                                                className="text-primary-650 bg-primary-50 px-1.5 py-0.5 rounded text-[10px] font-semibold truncate max-w-[120px] sm:max-w-[200px] inline-block align-bottom"
                                                                title={apt.serviceType}
                                                            >
                                                                {apt.serviceType}
                                                            </span>
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 mt-1 font-medium flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                            <span className={`font-bold flex items-center gap-0.5 ${isOverdue ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}>
                                                                <Clock className="w-3 h-3" /> Espera: {waitText} {isOverdue && '⚠️'}
                                                            </span>
                                                            <span className="text-slate-300 font-normal">•</span>
                                                            <span className={isOverdue ? 'text-red-700 font-bold' : ''}>Pactado: {scheduledText}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold text-white px-3.5 py-1.5 rounded-xl uppercase tracking-wider shrink-0 transition-colors shadow-sm ${
                                                    isNoShowWindow
                                                        ? 'bg-red-600 hover:bg-red-700'
                                                        : isOverdue
                                                            ? 'bg-red-600 hover:bg-red-700'
                                                            : 'bg-amber-600 hover:bg-amber-700'
                                                }`}>
                                                    {isNoShowWindow ? 'Reportar inasistencia →' : 'Atender ahora →'}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Fichas abiertas sin completar */}
                    {openFichas.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-rose-500" />
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
                                                    <ClipboardList className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {(apt.client as { fullName: string })?.fullName || 'Cliente'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5 font-medium truncate max-w-[180px] sm:max-w-[280px]" title={`🐶 ${(apt.pet as { name: string })?.name} · ${apt.serviceType}`}>
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

                    {/* Fichas modificables (últimas 24 horas) */}
                    {(() => {
                        const editableRecords = appointments.filter((apt: any) => {
                            if (!apt.medicalRecord) return false
                            const recordCreatedAt = new Date(apt.medicalRecord.createdAt)
                            const diffHours = (Date.now() - recordCreatedAt.getTime()) / (1000 * 60 * 60)
                            return diffHours <= 24
                        }).sort((a: any, b: any) => new Date(b.medicalRecord.createdAt).getTime() - new Date(a.medicalRecord.createdAt).getTime())

                        if (editableRecords.length === 0) return null

                        return (
                            <section className="space-y-3">
                                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-violet-500 animate-pulse" />
                                    Atenciones recientes modificables ({editableRecords.length})
                                </h2>
                                <div className="space-y-2">
                                    {editableRecords.map((apt: any) => {
                                        const record = apt.medicalRecord
                                        const createdAtDate = new Date(record.createdAt)
                                        const expiresAt = new Date(createdAtDate.getTime() + 24 * 60 * 60 * 1000)
                                        const diffMs = expiresAt.getTime() - Date.now()
                                        const hoursLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)))
                                        const minutesLeft = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)))
                                        const timeLeftText = diffMs <= 0 
                                            ? 'Cerrado' 
                                            : `Quedan ${hoursLeft}h y ${minutesLeft}m para editar`;

                                        return (
                                            <div
                                                key={apt.id}
                                                className="bg-white border border-slate-100 rounded-2xl p-4 transition-all shadow-sm hover:border-violet-250 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Pet photo/avatar */}
                                                    <div className="relative w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-xl overflow-hidden shrink-0">
                                                        <SafeImage
                                                            src={apt.pet?.photoUrl || ''}
                                                            alt={apt.pet?.name || 'Mascota'}
                                                            className="w-full h-full object-cover"
                                                            fallback={
                                                                <span>
                                                                    {apt.pet?.species === 'dog' ? '🐕' : apt.pet?.species === 'cat' ? '🐈' : '🐾'}
                                                                </span>
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {apt.client?.fullName || 'Cliente'} con <span className="text-primary-700 font-extrabold">{apt.pet?.name}</span>
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5 font-semibold flex items-center gap-1.5">
                                                            <span>{apt.serviceType}</span>
                                                            {record.diagnosis && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-slate-705 italic truncate max-w-[150px] sm:max-w-[200px]" title={record.diagnosis}>{record.diagnosis}</span>
                                                                </>
                                                            )}
                                                        </p>
                                                        <p className="text-[10px] text-violet-650 bg-violet-50 px-2 py-0.5 rounded-md font-bold mt-1.5 w-fit flex items-center gap-1 border border-violet-100/50">
                                                            <Clock className="w-3 h-3 text-violet-500" /> {timeLeftText} (Creación: {createdAtDate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })})
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/dashboard/vet/fast-entry?appointmentId=${apt.id}`}
                                                    className="flex items-center justify-center gap-1 px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm active:scale-98 self-end sm:self-auto cursor-pointer"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    Editar Ficha
                                                </Link>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })()}

                    {/* Agenda de Citas Programadas */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-650" />
                                Agenda de Citas Programadas
                            </h2>
                            <Link
                                href="/dashboard/vet/create-turn"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
                            >
                                <Plus className="w-3.5 h-3.5 text-primary-600" />
                                Agendar Turno
                            </Link>
                        </div>
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
                            <span className="text-[10px] text-slate-500 mt-0.5">Local y Horarios</span>
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

                    {/* Visor de Atenciones por Especialistas */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                📊 Visor de Operaciones y Rendimiento
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">Control de atenciones acumuladas por especialista médico</p>
                        </div>
                        
                        <div className="pt-2 max-w-2xl">
                            {/* Specialists stats */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                    🩺 Rendimiento de Especialistas
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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

                    {(() => {
                        const historyAppointments = appointments.filter((apt: any) => {
                            if (apt.status === 'completed' || apt.status === 'cancelled') return true;
                            if (apt.status === 'paid' && apt.scheduledAt) {
                                const diff = Date.now() - new Date(apt.scheduledAt).getTime();
                                if (diff > 48 * 60 * 60 * 1000) return true;
                            }
                            return false;
                        })
                        return (
                            <section className="space-y-3">
                                <h2 className="text-lg font-semibold text-slate-900">Historial de Atenciones</h2>
                                {historyAppointments.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500">No hay atenciones finalizadas registradas</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                                        {historyAppointments.map((apt: any) => {
                                            const isNoAtendido = apt.status === 'paid' && apt.scheduledAt && (Date.now() - new Date(apt.scheduledAt).getTime() > 48 * 60 * 60 * 1000);
                                            const statusInfo = isNoAtendido
                                                ? { label: 'No atendido', color: 'text-slate-500 bg-slate-100' }
                                                : (APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS] || { label: apt.status, color: 'text-slate-700 bg-slate-100' });
                                            return (
                                                <div
                                                    key={apt.id}
                                                    className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm hover:border-slate-200 transition-all duration-200"
                                                >
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isNoAtendido ? 'bg-slate-50' : 'bg-primary-50'}`}>
                                                        {apt.status === 'completed' ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        ) : apt.status === 'cancelled' ? (
                                                            <X className="w-5 h-5 text-red-500" />
                                                        ) : (
                                                            <AlertCircle className="w-5 h-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate">
                                                            {(apt.client as { fullName: string })?.fullName || 'Cliente'}
                                                        </p>
                                                        <p className="text-xs text-slate-555 mt-0.5 font-semibold truncate max-w-[185px] sm:max-w-[280px]" title={`🐶 ${(apt.pet as { name: string })?.name} · ${apt.serviceType}`}>
                                                            🐶 {(apt.pet as { name: string })?.name} · {apt.serviceType}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusInfo?.color || 'text-slate-700 bg-slate-100'} shrink-0 uppercase tracking-wider`}>
                                                        {statusInfo?.label || apt.status}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </section>
                        )
                    })()}
                </div>
            )}
        </div>
    )
}
