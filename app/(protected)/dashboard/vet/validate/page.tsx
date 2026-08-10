'use client'

import { useState, useEffect, Suspense } from 'react'
import { validateOtp, getPendingAppointments, reportClientNoShow } from '@/lib/actions'
import { ShieldCheck, AlertTriangle, Loader2, CalendarClock, User, Clock, KeyRound, X, Lock, Check } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { LoadingState } from '@/components/ui/loading-state'
import SafeImage from '@/components/ui/SafeImage'
import { PetProfileModal } from '@/components/dashboard/PetProfileModal'
import { SPECIES_LABELS } from '@/lib/types'

export default function ValidarCodigoPage() {
    return (
        <Suspense fallback={
            <LoadingState size="lg" message="Cargando validador..." description="Preparando verificador de códigos de seguridad" />
        }>
            <ValidarCodigoPageContent />
        </Suspense>
    )
}

function ValidarCodigoPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const prefilledAppointmentId = searchParams.get('appointmentId') || ''
    const action = searchParams.get('action') || ''

    const [appointments, setAppointments] = useState<any[]>([])
    const [loadingAppointments, setLoadingAppointments] = useState(true)
    const [appointmentId, setAppointmentId] = useState(prefilledAppointmentId)
    const [codigo, setCodigo] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string; type?: 'otp' | 'noshow' } | null>(null)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [noShowLoading, setNoShowLoading] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [reportId, setReportId] = useState('')
    const [selectedPetForProfile, setSelectedPetForProfile] = useState<any | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    const getWaitingTimeText = (createdAt: Date | string) => {
        const diffMs = currentTime.getTime() - new Date(createdAt).getTime()
        const diffMins = Math.max(0, Math.floor(diffMs / 60000))
        if (diffMins < 60) {
            return `${diffMins} min`
        }
        const hours = Math.floor(diffMins / 60)
        const mins = diffMins % 60
        return `${hours}h ${mins}m`
    }

    useEffect(() => {
        async function cargarCitas() {
            setLoadingAppointments(true)
            try {
                const data = await getPendingAppointments()
                setAppointments(data)
                setAppointmentId(prev => {
                    if (data.length === 1 && !prev) return data[0].id
                    return prev
                })
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingAppointments(false)
            }
        }
        cargarCitas()
    }, [])

    useEffect(() => {
        if (action === 'report' && prefilledAppointmentId && appointments.length > 0) {
            const found = appointments.find(a => a.id === prefilledAppointmentId)
            if (found) {
                const timeToCheck = found.scheduledAt;
                if (timeToCheck) {
                    const appointmentTime = new Date(timeToCheck).getTime();
                    const diff = Date.now() - appointmentTime;
                    if (diff >= 24 * 60 * 60 * 1000 && diff <= 48 * 60 * 60 * 1000) {
                        handleNoShowDirect(prefilledAppointmentId)
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action, prefilledAppointmentId, appointments])

    async function handleValidar(e: React.FormEvent) {
        e.preventDefault()
        if (!appointmentId || !codigo || codigo.length !== 6) return

        setLoading(true)
        setResult(null)

        try {
            const res = await validateOtp(appointmentId, codigo)
            const aptToValidate = appointments.find(a => a.id === appointmentId)
            const petName = aptToValidate?.pet?.name || 'la mascota'

            if (res.success) {
                setResult({
                    success: true,
                    message: `Código verificado con éxito. Iniciando atención médica para ${petName}...`,
                    type: 'otp'
                })
                setTimeout(() => {
                    router.push(`/dashboard/vet/fast-entry?appointmentId=${appointmentId}`)
                }, 1500)
            } else {
                setResult({
                    success: false,
                    message: res.message || 'Código OTP inválido.',
                    type: 'otp'
                })
            }
        } catch {
            setResult({ success: false, message: 'Error de conexión. Intenta de nuevo.', type: 'otp' })
        } finally {
            setLoading(false)
        }
    }

    async function handleValidarManual() {
        if (!appointmentId) return

        setLoading(true)
        setResult(null)

        try {
            const res = await validateOtp(appointmentId, 'MANUAL')
            const aptToValidate = appointments.find(a => a.id === appointmentId)
            const petName = aptToValidate?.pet?.name || 'la mascota'

            if (res.success) {
                setResult({
                    success: true,
                    message: `Atención presencial iniciada para ${petName}...`,
                    type: 'otp'
                })
                setTimeout(() => {
                    router.push(`/dashboard/vet/fast-entry?appointmentId=${appointmentId}`)
                }, 1500)
            } else {
                setResult({
                    success: false,
                    message: res.message || 'Error al iniciar la atención.',
                    type: 'otp'
                })
            }
        } catch {
            setResult({ success: false, message: 'Error de conexión. Intenta de nuevo.', type: 'otp' })
        } finally {
            setLoading(false)
        }
    }

    async function handleNoShowDirect(id: string) {
        setReportId(id)
        setShowConfirmModal(true)
    }

    async function handleNoShow() {
        if (appointmentId) {
            handleNoShowDirect(appointmentId)
        }
    }

    async function executeNoShow() {
        if (!reportId) return

        setNoShowLoading(true)
        setResult(null)
        try {
            const aptToReport = appointments.find(a => a.id === reportId)
            const petName = aptToReport?.pet?.name || 'la mascota'
            const scheduledAt = aptToReport?.scheduledAt
            const formattedSched = scheduledAt
                ? formatDateTime(scheduledAt)
                : 'la hora acordada'

            const res = await reportClientNoShow(reportId)
            if (res.success) {
                setResult({
                    success: true,
                    message: `Se ha registrado la inasistencia para ${petName} (cita del ${formattedSched}) con éxito.`,
                    type: 'noshow'
                })
                setAppointments(prev => prev.filter(a => a.id !== reportId))
                if (appointmentId === reportId) {
                    setAppointmentId('')
                }
                setShowConfirmModal(false)
                setReportId('')
                router.replace('/dashboard/vet/validate')
            } else {
                setResult({
                    success: false,
                    message: res.message || 'Error al registrar la inasistencia.',
                    type: 'noshow'
                })
            }
        } catch {
            setResult({ success: false, message: 'Error de conexión. Intenta de nuevo.', type: 'noshow' })
        } finally {
            setNoShowLoading(false)
        }
    }

    const activeAppointments = appointments.filter(apt => {
        const aptTime = apt.scheduledAt ? new Date(apt.scheduledAt).getTime() : new Date(apt.createdAt).getTime()
        const ageMs = currentTime.getTime() - aptTime
        return ageMs <= 48 * 60 * 60 * 1000
    })

    const selectedApt = activeAppointments.find(a => a.id === appointmentId)
    const canReportNoShow = (() => {
        if (!selectedApt) return false;
        const timeToCheck = selectedApt.scheduledAt;
        if (!timeToCheck) return false;
        const appointmentTime = new Date(timeToCheck).getTime();
        const now = Date.now();
        const diff = now - appointmentTime;
        return diff >= 24 * 60 * 60 * 1000 && diff <= 48 * 60 * 60 * 1000;
    })();
    const isSelectedCheckInAllowed = !selectedApt || !selectedApt.scheduledAt || selectedApt.otpValidationCode === 'MANUAL' || (new Date(selectedApt.scheduledAt).getTime() - currentTime.getTime()) <= 15 * 60 * 1000
    const activeWaitingCount = activeAppointments.filter(apt => {
        return !apt.scheduledAt || (new Date(apt.scheduledAt).getTime() - currentTime.getTime()) <= 15 * 60 * 1000
    }).length

    const readyAppointments = activeAppointments.filter(apt => {
        return !apt.scheduledAt || (new Date(apt.scheduledAt).getTime() - currentTime.getTime()) <= 15 * 60 * 1000
    })

    const upcomingAppointments = activeAppointments.filter(apt => {
        return apt.scheduledAt && (new Date(apt.scheduledAt).getTime() - currentTime.getTime()) > 15 * 60 * 1000
    })

    return (
        <div className="space-y-8 pb-24 lg:pb-16 max-w-6xl mx-auto">
            {/* Cabecera Principal */}
            <div className="bg-gradient-to-r from-primary-50/40 via-white to-slate-50/40 rounded-3xl border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full">Sala de Espera Activa</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <KeyRound className="w-7 h-7 text-primary-600" />
                        Iniciar Atención
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Pide al cliente su código de atención (6 dígitos) e ingrésalo aquí para abrir su ficha médica.
                    </p>
                </div>
                <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl flex items-center gap-3 shrink-0 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 font-black text-lg">
                        {activeWaitingCount}
                    </div>
                    <div>
                        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">En Espera</p>
                        <p className="text-[11px] text-slate-500 font-medium">Listos para atender hoy</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Lista de clientes esperando */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Grupo 1: Listos para Atender */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1">
                            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Listos para Atender ({readyAppointments.length})
                            </h2>
                        </div>

                        {loadingAppointments ? (
                            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                                <LoadingState 
                                    message="Cargando cola..." 
                                    description="Obteniendo pacientes listos"
                                    minHeight="min-h-[140px]"
                                    size="md"
                                />
                            </div>
                        ) : readyAppointments.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-500 text-sm shadow-sm flex flex-col items-center justify-center min-h-[140px] space-y-2">
                                <span className="text-2xl">✨</span>
                                <p className="font-extrabold text-slate-700">Sin pacientes listos en cola</p>
                                <p className="text-xs text-slate-450 leading-relaxed max-w-xs">
                                    Las citas programadas se habilitarán automáticamente en esta sección 15 minutos antes de la hora acordada.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {readyAppointments.map((apt, index) => {
                                    const diffMs = currentTime.getTime() - (apt.scheduledAt ? new Date(apt.scheduledAt) : new Date(apt.createdAt)).getTime()
                                    const diffMins = Math.max(0, Math.floor(diffMs / 60000))
                                    
                                    const isOverdue = (() => {
                                        if (diffMins > 30) return true
                                        if (apt.scheduledAt) {
                                            const scheduledTime = new Date(apt.scheduledAt).getTime()
                                            if (currentTime.getTime() - scheduledTime > 15 * 60 * 1000) {
                                                return true
                                            }
                                        }
                                        return false
                                    })()

                                    const waitText = diffMins < 60 ? `${diffMins} min` : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
                                    const isSelected = appointmentId === apt.id

                                    return (
                                        <div
                                            key={apt.id}
                                            onClick={() => {
                                                setAppointmentId(apt.id)
                                                setResult(null)
                                                setCodigo('')
                                            }}
                                            className={`p-4 sm:p-5 rounded-3xl border-2 transition-all space-y-3 cursor-pointer group ${
                                                isSelected
                                                    ? 'border-primary-500 bg-primary-50/20 shadow-md ring-1 ring-primary-100'
                                                    : isOverdue
                                                        ? 'border-red-100 bg-white hover:border-red-200 hover:shadow-sm'
                                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 transition-colors ${
                                                        isSelected
                                                            ? 'bg-primary-600 text-white'
                                                            : isOverdue
                                                                ? 'bg-red-500 text-white animate-pulse'
                                                                : 'bg-slate-150 text-slate-700'
                                                    }`}>
                                                        #{index + 1}
                                                    </span>
                                                    <div className="relative w-10 h-10 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-lg overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                        <SafeImage
                                                            src={apt.pet.photoUrl || ''}
                                                            alt={apt.pet.name}
                                                            className="w-full h-full object-cover"
                                                            fallback={
                                                                <span>
                                                                    {apt.pet.species === 'dog' ? '🐕' : apt.pet.species === 'cat' ? '🐈' : '🐾'}
                                                                </span>
                                                            }
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-extrabold text-sm text-slate-900 block truncate group-hover:text-primary-700 transition-colors">{apt.pet.name}</span>
                                                        <span className="text-[10px] text-slate-500 capitalize block truncate">
                                                            {SPECIES_LABELS[apt.pet.species as keyof typeof SPECIES_LABELS] || apt.pet.species} {apt.pet.breed ? `· ${apt.pet.breed}` : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg shrink-0 uppercase tracking-wider ${
                                                        isSelected
                                                            ? 'bg-primary-100/80 text-primary-750'
                                                            : 'bg-slate-100 text-slate-655 font-bold'
                                                    }`}>
                                                        {apt.serviceType}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-xs space-y-1.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                                <div className="flex items-center gap-1.5 text-slate-600 truncate">
                                                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">Propietario: <strong className="text-slate-800 font-semibold">{apt.pet.owner.fullName}</strong></span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                                                    <span className="text-slate-500 font-medium flex items-center gap-1">
                                                        <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                                                        Esperando:
                                                    </span>
                                                    <span className={`font-extrabold ${isOverdue ? 'text-red-650 animate-pulse' : 'text-amber-650'}`}>
                                                        {waitText} {isOverdue && '⚠️'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-slate-500 font-medium flex items-center gap-1">
                                                        <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                                                        Pactado:
                                                    </span>
                                                    <span className={`font-bold ${isOverdue ? 'text-red-700' : 'text-slate-700'}`}>
                                                        {apt.scheduledAt 
                                                            ? formatDateTime(apt.scheduledAt)
                                                            : "Atención Presencial"
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2.5 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedPetForProfile({
                                                            ...apt.pet,
                                                            owner: apt.pet.owner
                                                        })
                                                    }}
                                                    className="flex-1 px-3.5 py-2.5 bg-primary-50/70 hover:bg-primary-100 text-primary-700 border border-primary-100/50 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                                                >
                                                    🔎 Ver Ficha Técnica
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setAppointmentId(apt.id)
                                                        setResult(null)
                                                        setCodigo('')
                                                        setTimeout(() => {
                                                            document.getElementById('otp-input')?.focus()
                                                        }, 100)
                                                    }}
                                                    className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-[0.98] ${
                                                        isSelected
                                                            ? 'bg-primary-600 text-white shadow-md'
                                                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                                                    }`}
                                                >
                                                    <KeyRound className="w-3.5 h-3.5 shrink-0" />
                                                    {isSelected ? 'Seleccionado' : 'Validar Código'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Grupo 2: Próximas Citas (Bloqueadas) */}
                    {upcomingAppointments.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between pb-1">
                                <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    Próximas Citas (Habilitación Automática) ({upcomingAppointments.length})
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {upcomingAppointments.map((apt) => {
                                    return (
                                        <div
                                            key={apt.id}
                                            className="p-4 sm:p-5 rounded-3xl border border-slate-200 bg-slate-50/60 opacity-80 grayscale-[15%] transition-all space-y-3 cursor-default"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 bg-slate-200 text-slate-500">
                                                        🔒
                                                    </span>
                                                    <div className="relative w-10 h-10 rounded-2xl bg-slate-200/60 border border-slate-250 flex items-center justify-center text-lg overflow-hidden shrink-0">
                                                        <SafeImage
                                                            src={apt.pet.photoUrl || ''}
                                                            alt={apt.pet.name}
                                                            className="w-full h-full object-cover"
                                                            fallback={
                                                                <span>
                                                                    {apt.pet.species === 'dog' ? '🐕' : apt.pet.species === 'cat' ? '🐈' : '🐾'}
                                                                </span>
                                                            }
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-bold text-sm text-slate-650 block truncate">{apt.pet.name}</span>
                                                        <span className="text-[10px] text-slate-450 capitalize block truncate">
                                                            {SPECIES_LABELS[apt.pet.species as keyof typeof SPECIES_LABELS] || apt.pet.species} {apt.pet.breed ? `· ${apt.pet.breed}` : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 bg-slate-200/60 text-slate-500 uppercase tracking-wider">
                                                        {apt.serviceType}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-xs space-y-1.5 bg-white/70 p-3 rounded-2xl border border-slate-200/40">
                                                <div className="flex items-center gap-1.5 text-slate-500 truncate">
                                                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">Propietario: <strong className="text-slate-700 font-semibold">{apt.pet.owner.fullName}</strong></span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/40">
                                                    <span className="text-slate-400 font-medium flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        Estado:
                                                    </span>
                                                    <span className="font-extrabold text-slate-550 flex items-center gap-1 text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                                        🔒 Cita Programada
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-slate-400 font-medium flex items-center gap-1">
                                                        <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                                                        Programado:
                                                    </span>
                                                    <span className="font-bold text-slate-600">
                                                        {apt.scheduledAt 
                                                            ? formatDateTime(apt.scheduledAt)
                                                            : "Atención Presencial"
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2.5 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedPetForProfile({
                                                            ...apt.pet,
                                                            owner: apt.pet.owner
                                                        })
                                                    }}
                                                    className="flex-1 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                                                >
                                                    🔎 Ver Ficha Técnica
                                                </button>
                                                <div className="flex-1 px-3.5 py-2.5 bg-slate-200/50 text-slate-450 border border-transparent rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 select-none">
                                                    <Lock className="w-3.5 h-3.5 shrink-0" />
                                                    Check-in Bloqueado
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Formulario de código */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm lg:sticky lg:top-8 h-fit">
                        <h2 className="text-sm font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                            <KeyRound className="w-4.5 h-4.5 text-primary-600" />
                            Ingresar Código de Atención
                        </h2>

                        {!appointmentId ? (
                            <div className="text-center py-10 px-5 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 relative">
                                    <div className="absolute inset-0 rounded-full border border-slate-100 animate-ping opacity-75" />
                                    <KeyRound className="w-8 h-8 text-slate-355 animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-extrabold text-slate-700">Validador Listo</h3>
                                    <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed font-medium">
                                        Selecciona un cliente de la lista de espera para habilitar el validador e ingresar su código.
                                    </p>
                                </div>
                                <div className="w-full max-w-[260px] text-left space-y-2.5 pt-4 border-t border-slate-100/65">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Pasos de verificación:</div>
                                    <div className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                                        <span className="w-5 h-5 rounded-full bg-primary-50 text-primary-700 font-black flex items-center justify-center text-[10px] shrink-0">1</span>
                                        <span>Seleccionar paciente de la cola</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                                        <span className="w-5 h-5 rounded-full bg-primary-50 text-primary-700 font-black flex items-center justify-center text-[10px] shrink-0">2</span>
                                        <span>Solicitar PIN de 6 dígitos del cliente</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                                        <span className="w-5 h-5 rounded-full bg-primary-50 text-primary-700 font-black flex items-center justify-center text-[10px] shrink-0">3</span>
                                        <span>Validar código e iniciar consulta</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleValidar} className="space-y-5 animate-in fade-in duration-300">
                                {/* Paciente Seleccionado Banner */}
                                <div className="bg-primary-50/30 border border-primary-100/50 p-4 rounded-2xl flex items-center gap-3">
                                    <div className="relative w-11 h-11 rounded-xl bg-white border border-primary-100 flex items-center justify-center text-lg overflow-hidden shrink-0 shadow-sm">
                                        <SafeImage
                                            src={selectedApt?.pet?.photoUrl || ''}
                                            alt={selectedApt?.pet?.name || 'Mascota'}
                                            className="w-full h-full object-cover"
                                            fallback={
                                                <span>
                                                    {selectedApt?.pet?.species === 'dog' ? '🐕' : selectedApt?.pet?.species === 'cat' ? '🐈' : '🐾'}
                                                </span>
                                            }
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-extrabold text-primary-650 uppercase tracking-wider">Validando Consulta de:</p>
                                        <h4 className="font-black text-sm text-slate-900 truncate leading-snug">{selectedApt?.pet?.name}</h4>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                                            Dueño: <span className="font-bold text-slate-700">{selectedApt?.pet?.owner?.fullName}</span>
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAppointmentId('')
                                            setCodigo('')
                                            setResult(null)
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0 transition-colors"
                                        title="Deseleccionar"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {!isSelectedCheckInAllowed && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
                                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                                            <AlertTriangle className="w-4.5 h-4.5 animate-pulse" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-extrabold text-xs text-amber-950">Cita Programada para más adelante 🔒</p>
                                            <p className="text-[11px] text-amber-800 mt-1 leading-relaxed font-medium">
                                                El check-in se habilitará 15 minutos antes de la hora pactada: <strong className="font-bold">{selectedApt?.scheduledAt ? new Date(selectedApt.scheduledAt).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit', hour12: true }) : ""}</strong>.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedApt?.otpValidationCode === 'MANUAL' ? (
                                    <div className="space-y-4 pt-2">
                                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-extrabold text-xs text-emerald-950">Atención Presencial (Sin OTP)</p>
                                                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed font-medium">
                                                    Este turno fue registrado de forma manual. No requiere código de validación del cliente para iniciar la consulta.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleValidarManual}
                                            disabled={loading || !isSelectedCheckInAllowed}
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-100 transition-all active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                            ) : (
                                                <ShieldCheck className="w-4.5 h-4.5" />
                                            )}
                                            {loading ? 'Iniciando Atención...' : 'Iniciar Atención Presencial'}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-slate-600 mb-1 text-center">
                                                Ingresa el código OTP de 6 dígitos
                                            </label>
                                            <div className="relative">
                                                {/* Segmented OTP Display Boxes */}
                                                <div 
                                                    onClick={() => {
                                                        if (isSelectedCheckInAllowed) {
                                                            document.getElementById('otp-input')?.focus()
                                                        }
                                                    }}
                                                    className="flex justify-center gap-2 sm:gap-2.5 max-w-sm mx-auto cursor-pointer select-none"
                                                >
                                                    {[...Array(6)].map((_, i) => {
                                                        const char = codigo[i]
                                                        const isFocused = i === codigo.length && isSelectedCheckInAllowed
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border-2 flex items-center justify-center text-lg sm:text-xl font-bold font-mono transition-all duration-200 ${
                                                                    !isSelectedCheckInAllowed
                                                                        ? 'border-slate-100 bg-slate-50/50 text-slate-300'
                                                                        : char
                                                                            ? 'border-primary-500 bg-primary-50/10 text-slate-900 shadow-sm'
                                                                            : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300'
                                                                } ${isFocused ? 'ring-2 ring-primary-500 border-primary-500 scale-105 shadow-md shadow-primary-500/10' : ''}`}
                                                            >
                                                                {char || '•'}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                
                                                {/* Hidden Input field inside relative container to prevent Safari/browser layout scroll shifts */}
                                                <input
                                                    id="otp-input"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={6}
                                                    value={codigo}
                                                    onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none"
                                                    required
                                                    disabled={!isSelectedCheckInAllowed}
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    data-lpignore="true"
                                                    data-1password-bypass="true"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 text-center leading-relaxed font-medium">
                                                El cliente visualiza este código en su pantalla tras reservar.
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || codigo.length !== 6 || !isSelectedCheckInAllowed}
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-100 transition-all active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                            ) : (
                                                <ShieldCheck className="w-4.5 h-4.5" />
                                            )}
                                            {loading ? 'Verificando Código...' : 'Iniciar Atención Médica'}
                                        </button>
                                    </>
                                )}

                                {canReportNoShow && (
                                    <button
                                        type="button"
                                        onClick={handleNoShow}
                                        disabled={loading || noShowLoading}
                                        className="w-full mt-2 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 text-red-650 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold text-xs transition-all active:scale-[0.99]"
                                    >
                                        {noShowLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                                        ) : (
                                            <X className="w-3.5 h-3.5 text-red-500" />
                                        )}
                                        Registrar Cliente Ausente (No Show)
                                    </button>
                                )}

                                {result && (
                                    <div
                                        className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                                            result.success
                                                ? 'bg-emerald-50/50 border-emerald-200'
                                                : 'bg-red-50/50 border-red-200'
                                        }`}
                                    >
                                        {result.success ? (
                                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                                <AlertTriangle className="w-4 h-4 animate-pulse" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className={`font-extrabold text-xs ${result.success ? 'text-emerald-950' : 'text-red-950'}`}>
                                                {result.type === 'noshow'
                                                    ? (result.success ? 'Inasistencia Registrada' : 'Reporte Fallido')
                                                    : (result.success ? '¡Atención Iniciada!' : 'Código Inválido')
                                                }
                                            </p>
                                            <p className={`text-[11px] mt-0.5 leading-relaxed font-medium ${result.success ? 'text-emerald-600' : 'text-red-650'}`}>
                                                {result.message}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Confirm Modal */}
            {(() => {
                const reportApt = appointments.find(a => a.id === reportId);
                const reportPetName = reportApt?.pet?.name || 'la mascota';
                const reportSched = reportApt?.scheduledAt
                    ? formatDateTime(reportApt.scheduledAt)
                    : 'la hora acordada';

                return showConfirmModal && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 animate-bounce">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="font-extrabold text-slate-900 text-base">
                                    ¿Confirmar Inasistencia de {reportPetName}?
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Registrarás oficialmente que el cliente de <strong>{reportPetName}</strong> no asistió a su cita pactada para el <strong>{reportSched}</strong>. Se cancelará la cita en la plataforma.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setReportId('');
                                        if (action === 'report') {
                                            router.replace('/dashboard/vet/validate?appointmentId=' + prefilledAppointmentId);
                                        }
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={executeNoShow}
                                    disabled={noShowLoading}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-colors"
                                >
                                    {noShowLoading ? 'Procesando...' : 'Confirmar Reporte'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {selectedPetForProfile && (
                <PetProfileModal
                    key={selectedPetForProfile.id}
                    pet={selectedPetForProfile}
                    isOpen={true}
                    onClose={() => setSelectedPetForProfile(null)}
                />
            )}
        </div>
    )
}
