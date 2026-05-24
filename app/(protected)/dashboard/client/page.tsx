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
import { APPOINTMENT_STATUS_LABELS } from '@/lib/types'
import { ReviewForm } from '@/components/ui/review-form'
import { QuickRescheduleButton } from '@/components/dashboard/quick-reschedule'
import { ClientRemindersList } from '@/components/dashboard/client-reminders'

export default async function ClientDashboard() {
    const session = await requireRole(['client'])
    const [pets, appointments, reminders] = await Promise.all([
        getUserPets(),
        getClientAppointments(),
        getClientReminders(),
    ])

    const recentAppointments = appointments.slice(0, 5)

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
                    <p className="font-bold text-base">Solicitar Turno Digital</p>
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
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                        {pets.slice(0, 4).map(pet => (
                            <Link
                                key={pet.id}
                                href={`/dashboard/client/carnet/${pet.id}`}
                                className="flex-shrink-0 w-36 bg-white rounded-2xl border border-slate-100 p-4 hover:border-primary-200 hover:shadow-card transition-all"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-3 text-2xl">
                                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                                </div>
                                <p className="font-semibold text-sm text-slate-900 truncate">{pet.name}</p>
                                <p className="text-xs text-slate-500 capitalize">{pet.species}</p>
                            </Link>
                        ))}
                        <Link
                            href="/dashboard/client/pets"
                            className="flex-shrink-0 w-36 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
                        >
                            <Plus className="w-8 h-8 mb-1" />
                            <span className="text-xs font-medium">Agregar</span>
                        </Link>
                    </div>
                </section>
            )}

            {/* Recordatorios y Controles */}
            <ClientRemindersList initialReminders={reminders} />

            {/* Recent Appointments */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Citas Recientes</h2>
                {recentAppointments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No tienes citas aún</p>
                        <Link
                            href="/dashboard/discover"
                            className="mt-3 inline-block text-sm text-primary-600 font-medium hover:underline"
                        >
                            Buscar servicios cercanos →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentAppointments.map(apt => {
                            const statusInfo = APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS]
                            const isPaid = apt.status === 'paid'
                            return (
                                <div
                                    key={apt.id}
                                    className={`rounded-2xl border overflow-hidden ${
                                        isPaid ? 'border-primary-300 shadow-md shadow-primary-100' : 'bg-white border-slate-100'
                                    }`}
                                >
                                    {/* Card header */}
                                    <div className={`flex items-center gap-3 p-4 ${
                                        isPaid ? 'bg-gradient-to-r from-primary-50 to-primary-100/50' : ''
                                    }`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            isPaid ? 'bg-primary-600' : 'bg-white border border-slate-200'
                                        }`}>
                                            {apt.status === 'completed' ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : isPaid ? (
                                                <ShieldCheck className="w-5 h-5 text-white" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-amber-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate ${
                                                isPaid ? 'text-primary-900' : 'text-slate-900'
                                            }`}>
                                                {(apt.establishment as { name: string })?.name || 'Establecimiento'}
                                            </p>
                                            <p className={`text-xs ${ isPaid ? 'text-primary-700' : 'text-slate-500'}` }>
                                                {(apt.pet as { name: string })?.name} · {apt.serviceType}
                                                {apt.scheduledAt && ` · ${new Date(apt.scheduledAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo?.color || 'text-slate-600 bg-slate-100'}`}>
                                            {statusInfo?.label || apt.status}
                                        </span>
                                    </div>

                                    {/* OTP Banner — only for paid */}
                                    {isPaid && apt.otpValidationCode && (
                                        <div className="px-4 py-3 bg-primary-600 flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs text-primary-200 font-medium">Código de atención</p>
                                                <p className="text-[10px] text-primary-300">Muéstraselo al veterinario al llegar</p>
                                            </div>
                                            <span className="font-mono text-2xl font-black tracking-[0.3em] text-white bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                                                {apt.otpValidationCode}
                                            </span>
                                        </div>
                                    )}

                                    {/* Review — only for completed */}
                                    {apt.status === 'completed' && (
                                        <div className="px-4 pb-3 space-y-3">
                                            {/* Expandable Consultation Details */}
                                            {apt.medicalRecord && (
                                                <details className="border-t border-slate-100 pt-3 group">
                                                    <summary className="text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer list-none flex items-center justify-between focus:outline-none">
                                                        <span className="flex items-center gap-1">📋 Ver receta e indicaciones médicas</span>
                                                        <span className="text-[10px] transition-transform duration-200 group-open:rotate-180">▼</span>
                                                    </summary>
                                                    <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-2.5 text-slate-700 animate-in fade-in slide-in-from-top-1">
                                                        {apt.medicalRecord.diagnosis && (
                                                            <div>
                                                                <span className="font-bold block text-slate-400 uppercase text-[9px] tracking-wider">Diagnóstico</span>
                                                                <p className="font-medium text-slate-900 mt-0.5">{apt.medicalRecord.diagnosis}</p>
                                                            </div>
                                                        )}
                                                        {apt.medicalRecord.prescription && (
                                                            <div>
                                                                <span className="font-bold block text-slate-400 uppercase text-[9px] tracking-wider">Receta / Prescripción</span>
                                                                <p className="font-medium text-slate-900 bg-white border border-slate-200/60 rounded-lg p-2.5 mt-1 whitespace-pre-line leading-relaxed shadow-sm">
                                                                    {apt.medicalRecord.prescription}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {apt.medicalRecord.treatment && (
                                                            <div>
                                                                <span className="font-bold block text-slate-400 uppercase text-[9px] tracking-wider">Notas de Tratamiento</span>
                                                                <p className="font-medium text-slate-850 mt-0.5 leading-relaxed">{apt.medicalRecord.treatment}</p>
                                                            </div>
                                                        )}
                                                        {apt.medicalRecord.symptoms && Array.isArray(apt.medicalRecord.symptoms) && apt.medicalRecord.symptoms.length > 0 && (
                                                            <div>
                                                                <span className="font-bold block text-slate-400 uppercase text-[9px] tracking-wider">Síntomas reportados</span>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {apt.medicalRecord.symptoms.map((s: string) => (
                                                                        <span key={s} className="px-2 py-0.5 bg-slate-200/60 text-slate-700 rounded-full text-[10px] font-medium">
                                                                            {s}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {(apt.medicalRecord.weight || apt.medicalRecord.temperature || apt.medicalRecord.heartRate) && (
                                                            <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-200/60 text-[10px]">
                                                                {apt.medicalRecord.weight && (
                                                                    <div>
                                                                        <span className="text-slate-400">Peso:</span> <strong className="text-slate-700">{apt.medicalRecord.weight} kg</strong>
                                                                    </div>
                                                                )}
                                                                {apt.medicalRecord.temperature && (
                                                                    <div>
                                                                        <span className="text-slate-400">Temp:</span> <strong className="text-slate-700">{apt.medicalRecord.temperature} °C</strong>
                                                                    </div>
                                                                )}
                                                                {apt.medicalRecord.heartRate && (
                                                                    <div>
                                                                        <span className="text-slate-400">F.C.:</span> <strong className="text-slate-700">{apt.medicalRecord.heartRate} bpm</strong>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </details>
                                            )}
                                            
                                            <ReviewForm
                                                appointmentId={apt.id}
                                                establishmentId={(apt.establishment as { id: string })?.id}
                                                establishmentName={(apt.establishment as { name: string })?.name || 'Establecimiento'}
                                                alreadyReviewed={!!(apt as any).review}
                                                existingRating={(apt as any).review?.rating}
                                            />
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
