'use client'

import { useState, useEffect, Suspense } from 'react'
import { createMedicalRecord } from '@/lib/actions'
import { COMMON_SYMPTOMS, COMMON_DIAGNOSES, SPECIES_LABELS, SPECIES_OPTIONS } from '@/lib/types'
import { useSearchParams, useRouter } from 'next/navigation'
import {
    ClipboardList,
    Thermometer,
    Weight,
    Heart,
    Stethoscope,
    Pill,
    CalendarDays,
    Loader2,
    CheckCircle2,
    X,
    Plus,
    User,
    Calendar,
    Phone,
    ShieldAlert,
    MessageCircle,
    Copy,
    ArrowLeft,
    Clock
} from 'lucide-react'
import { formatDate, formatPEN } from '@/lib/utils'
import { LoadingState } from '@/components/ui/loading-state'

export default function FastEntryPage() {
    return (
        <Suspense fallback={
            <LoadingState size="lg" message="Cargando ficha rápida..." description="Preparando formulario de atención inmediata" />
        }>
            <FastEntryPageContent />
        </Suspense>
    )
}

function FastEntryPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const appointmentId = searchParams.get('appointmentId') || ''

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const [weight, setWeight] = useState('')
    const [temperature, setTemperature] = useState('')
    const [heartRate, setHeartRate] = useState('')
    const [symptoms, setSymptoms] = useState<string[]>([])
    const [customSymptom, setCustomSymptom] = useState('')
    const [diagnosis, setDiagnosis] = useState('')
    const [prescription, setPrescription] = useState('')
    const [treatment, setTreatment] = useState('')
    const [guestClientName, setGuestClientName] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [guestPhone, setGuestPhone] = useState('')
    const [summaryData, setSummaryData] = useState<any>(null)
    const [guestPetName, setGuestPetName] = useState('')
    const [guestPetSpecies, setGuestPetSpecies] = useState('dog')
    const [guestConsentConfirmed, setGuestConsentConfirmed] = useState(false)
    const [nextVisit, setNextVisit] = useState('')
    const [selectedSpecialist, setSelectedSpecialist] = useState<string>('default')
    const [attendingName, setAttendingName] = useState('')
    const [attendingCmvp, setAttendingCmvp] = useState('')
    const [attendingRole, setAttendingRole] = useState('vet')
    const [loadingInitial, setLoadingInitial] = useState(true)

    const [establishments, setEstablishments] = useState<any[]>([])
    const [selectedEstId, setSelectedEstId] = useState('')
    const [role, setRole] = useState('vet')
    const [profile, setProfile] = useState<any>(null)
    const [debt, setDebt] = useState(0)
    const [isMarchaBlanca, setIsMarchaBlanca] = useState(false)

    // Unified states for loaded data
    const [appointmentData, setAppointmentData] = useState<any>(null)
    const [pastHistory, setPastHistory] = useState<any[]>([])
    const [isEditable, setIsEditable] = useState(true)
    const [loadingRecord, setLoadingRecord] = useState(false)
    const [copied, setCopied] = useState(false)
    const [recordCreatedAt, setRecordCreatedAt] = useState<Date | null>(null)

    const getActiveSpecialists = () => {
        let rawSpecialists = '[]'
        if (appointmentId) {
            rawSpecialists = appointmentData?.establishment?.specialists || '[]'
        } else {
            const currentEst = establishments.find(e => e.id === selectedEstId) || establishments[0]
            rawSpecialists = currentEst?.specialists || '[]'
        }
        try {
            const list = JSON.parse(rawSpecialists)
            if (Array.isArray(list)) {
                return list.filter((s: any) => s.isActive !== false)
            }
        } catch {}
        return []
    }

    useEffect(() => {
        async function loadInitialData() {
            try {
                const { getMyEstablishments, getMyRole, getProfile, getVetDebt, getMarchaBlancaSetting } = await import('@/lib/actions')
                const list = await getMyEstablishments()
                const userRole = await getMyRole()
                const userProfile = await getProfile()
                const userDebt = await getVetDebt()
                const mbSetting = await getMarchaBlancaSetting()
                setIsMarchaBlanca(mbSetting.isActive)
                setEstablishments(list)
                if (list.length > 0) {
                    setSelectedEstId(list[0].id)
                }
                setRole(userRole)
                setProfile(userProfile)
                setDebt(userDebt)
                setAttendingRole(userRole === 'provider' ? 'provider' : 'vet')
            } catch (e) {
                console.error("Error loading initial data:", e)
            } finally {
                setLoadingInitial(false)
            }
        }

        async function loadExistingRecord() {
            setLoadingRecord(true)
            try {
                const { getMyRole, getAppointmentForVet, getProfile, getVetDebt, getMarchaBlancaSetting } = await import('@/lib/actions')
                const userRole = await getMyRole()
                const res = await getAppointmentForVet(appointmentId)
                const userProfile = await getProfile()
                const userDebt = await getVetDebt()
                const mbSetting = await getMarchaBlancaSetting()
                setIsMarchaBlanca(mbSetting.isActive)
                setRole(userRole)
                setProfile(userProfile)
                setDebt(userDebt)

                if (res) {
                    setAppointmentData(res.appointment)
                    setPastHistory(res.history)

                    if (res.record) {
                        setWeight(res.record.weight?.toString() || '')
                        setTemperature(res.record.temperature?.toString() || '')
                        setHeartRate(res.record.heartRate?.toString() || '')
                        setSymptoms(res.record.symptoms || [])
                        setDiagnosis(res.record.diagnosis || '')
                        setPrescription(res.record.prescription || '')
                        setTreatment(res.record.treatment || '')
                        setNextVisit(res.record.nextVisit || '')
                        setIsEditable(res.record.isEditable)
                        setRecordCreatedAt(new Date(res.record.createdAt))
                        setAttendingName(res.record.attendingName || '')
                        setAttendingCmvp(res.record.attendingCmvp || '')

                        try {
                            const specList = JSON.parse(res.appointment?.establishment?.specialists || '[]')
                            const match = specList.find((s: any) => s.cmvpId === res.record?.attendingCmvp)
                            if (match) {
                                setSelectedSpecialist(match.id)
                                setAttendingRole(match.role || 'vet')
                            } else {
                                setSelectedSpecialist('default')
                                setAttendingRole(userRole === 'provider' ? 'provider' : 'vet')
                            }
                        } catch {
                            setSelectedSpecialist('default')
                            setAttendingRole(userRole === 'provider' ? 'provider' : 'vet')
                        }
                    } else {
                        setAttendingRole(userRole === 'provider' ? 'provider' : 'vet')
                    }
                }
            } catch (e) {
                console.error("Error loading record:", e)
                setError("Error al cargar la información de la cita")
            } finally {
                setLoadingRecord(false)
                setLoadingInitial(false)
            }
        }

        if (!appointmentId) {
            loadInitialData()
        } else {
            loadExistingRecord()
        }
    }, [appointmentId])

    function addSymptom(symptom: string) {
        if (!isEditable) return
        if (!symptoms.includes(symptom)) {
            setSymptoms([...symptoms, symptom])
        }
    }

    function removeSymptom(symptom: string) {
        if (!isEditable) return
        setSymptoms(symptoms.filter(s => s !== symptom))
    }

    function addCustomSymptom() {
        if (!isEditable) return
        if (customSymptom.trim()) {
            addSymptom(customSymptom.trim())
            setCustomSymptom('')
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!isEditable) return
        
        setLoading(true)
        setError('')

        // Resolve attending specialist name, role, and CMVP
        const specialistsList = getActiveSpecialists()
        const selectedSpec = specialistsList.find((s: any) => s.id === selectedSpecialist)

        const finalRole = selectedSpec?.role || (role === 'provider' ? 'provider' : 'vet')
        const finalCmvp = selectedSpec ? selectedSpec.cmvpId : (profile?.cmvpId || undefined)
        const finalAttendingName = selectedSpec?.name || profile?.fullName || undefined
        const finalAttendingCmvp = finalCmvp
        const finalAttendingRole = finalRole
        setAttendingRole(finalAttendingRole)

        // Validate: if attending is vet, CMVP must be set
        const isVetRole = finalAttendingRole === 'vet'
        if (isVetRole && (!finalCmvp || finalCmvp === 'No aplica' || finalCmvp.trim() === '')) {
            setError(
                selectedSpecialist === 'default'
                    ? 'Tu perfil no tiene un código de colegiatura (CMVP) registrado. Por favor, actualízalo en la configuración para poder guardar la ficha médica.'
                    : 'El veterinario seleccionado no tiene código de colegiatura (CMVP) registrado. Por favor, actualiza su perfil en la sección de Staff antes de guardar la ficha médica.'
            )
            setLoading(false)
            return
        }

        try {
            let result;
            if (appointmentId) {
                const { createMedicalRecord } = await import('@/lib/actions')
                result = await createMedicalRecord({
                    appointmentId,
                    weight: weight ? parseFloat(weight) : undefined,
                    temperature: temperature ? parseFloat(temperature) : undefined,
                    heartRate: heartRate ? parseInt(heartRate) : undefined,
                    symptoms,
                    diagnosis: diagnosis || undefined,
                    prescription: prescription || undefined,
                    treatment: treatment || undefined,
                    nextVisit: nextVisit || undefined,
                    attendingName: finalAttendingName,
                    attendingCmvp: finalAttendingCmvp,
                })
            } else {
                if (!guestClientName || !guestPetName) {
                    setError('Debes ingresar el nombre del cliente y la mascota si no hay cita previa.')
                    setLoading(false)
                    return
                }
                if (!guestPhone) {
                    setError('Debes ingresar el número de teléfono (WhatsApp) del cliente para poder registrar la ficha.')
                    setLoading(false)
                    return
                }
                if (!guestConsentConfirmed) {
                    setError('Debes confirmar que el cliente ha dado su consentimiento para registrar sus datos.')
                    setLoading(false)
                    return
                }
                const { createGuestFastEntry } = await import('@/lib/actions')
                result = await createGuestFastEntry({
                    guestClientName,
                    guestEmail: guestEmail || undefined,
                    guestPhone: guestPhone || undefined,
                    guestPetName,
                    guestPetSpecies,
                    establishmentId: selectedEstId || undefined,
                    weight: weight ? parseFloat(weight) : undefined,
                    temperature: temperature ? parseFloat(temperature) : undefined,
                    heartRate: heartRate ? parseInt(heartRate) : undefined,
                    symptoms,
                    diagnosis: diagnosis || undefined,
                    prescription: prescription || undefined,
                    treatment: treatment || undefined,
                    attendingName: finalAttendingName,
                    attendingCmvp: finalAttendingCmvp,
                })
            }

            const resultData = result as any
            if (result.success) {
                setSuccess(true)
                setAttendingName(finalAttendingName || profile?.fullName || '')
                setAttendingCmvp(finalAttendingCmvp || 'No Registrado')
                setAttendingRole(finalAttendingRole)
                if (resultData.summary) {
                    setSummaryData(resultData.summary)
                }

            } else {
                setError(result.message || 'Error al guardar')
            }
        } catch {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const getFormattedSummaryText = () => {
        if (!summaryData) return ''
        const dateStr = new Date().toLocaleDateString('es-PE')
        const nextVisitStr = summaryData.nextVisit ? `\n📅 *Próximo control:* ${summaryData.nextVisit}` : ''
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://brofy.app'
        
        return `¡Hola ${summaryData.clientName}! 🐾\n\nTe compartimos el resumen de la atención de *${summaryData.petName}* en *${summaryData.establishmentName}* (${dateStr}):\n\n🩺 *Detalle de la Atención:*\n- *Diagnóstico/Servicio:* ${summaryData.diagnosis}\n- *Prescripción:* ${summaryData.prescription}\n- *Tratamiento:* ${summaryData.treatment}${nextVisitStr}\n\n📲 Para ver todo su historial médico digital de forma gratuita, regístrate en Brofy usando este mismo contacto:\n${origin}/signup`
    }

    const handleCopy = () => {
        const text = getFormattedSummaryText()
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleWhatsApp = () => {
        if (!summaryData) return
        const cleanPhone = summaryData.clientPhone.trim().replace(/\D/g, '')
        const finalPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone
        const text = getFormattedSummaryText()
        const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`
        window.open(whatsappUrl, '_blank')
    }

    if (success) {
        const isGuestWorkflow = (!appointmentId || appointmentData?.client?.password === 'guest-no-login') && summaryData

        if (isGuestWorkflow) {
            return (
                <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-md">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto transition-transform duration-500 hover:scale-105">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">¡Atención guardada exitosamente! ✅</h2>
                        <p className="text-sm text-slate-500">
                            La mascota <strong>{summaryData.petName}</strong> tiene una nueva ficha en su historial.
                        </p>

                        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-3 text-xs text-primary-850 inline-block">
                            📲 Recuerda compartir la receta y el diagnóstico con el propietario usando el botón de WhatsApp abajo.
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-slate-700 text-left space-y-1 max-w-lg mx-auto mt-2 shadow-xs">
                            <span className="font-bold block text-blue-900">✨ Ficha editable por 24 horas:</span>
                            <span>Puedes modificar esta ficha clínica durante las siguientes 24 horas desde la sección <strong>&quot;Atenciones Recientes&quot;</strong> de tu panel. Después se cerrará de manera definitiva.</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2">
                            🐾 Resumen de la Atención
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-400 block text-xs">Mascota</span>
                                <strong className="text-slate-800">{summaryData.petName}</strong>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-xs">Propietario</span>
                                <strong className="text-slate-800">{summaryData.clientName}</strong>
                            </div>
                            <div className="col-span-2">
                                <span className="text-slate-400 block text-xs">Diagnóstico / Servicio</span>
                                <strong className="text-slate-800">{summaryData.diagnosis}</strong>
                            </div>
                            <div className="col-span-2">
                                <span className="text-slate-400 block text-xs">Prescripción</span>
                                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1 whitespace-pre-wrap text-xs font-mono">
                                    {summaryData.prescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-base">
                            📢 Compartir Ficha con el Propietario (Gratis)
                        </h3>
                        <p className="text-xs text-slate-500">
                            Puedes enviar los detalles y la receta al propietario desde tu propio WhatsApp de forma 100% gratuita y directa.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {summaryData.clientPhone ? (
                                <button
                                    onClick={handleWhatsApp}
                                    className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-sm transition-all shadow-sm active:scale-95"
                                >
                                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                                    Enviar por WhatsApp
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 text-slate-400 rounded-2xl font-semibold text-sm cursor-not-allowed border border-slate-200"
                                    title="No se registró número de teléfono"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Sin teléfono registrado
                                </button>
                            )}

                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-semibold text-sm transition-all border border-slate-200 active:scale-95"
                            >
                                <Copy className="w-4 h-4" />
                                {copied ? '¡Copiado!' : 'Copiar Resumen'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard/vet')}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold transition-all shadow-md active:scale-[0.99]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Ir al Panel de Control
                    </button>
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 animate-in fade-in max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">¡Ficha guardada exitosamente! ✅</h2>
                <p className="text-sm text-slate-500 leading-relaxed">El registro se agregó correctamente al historial médico de la mascota.</p>
                <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 text-xs text-primary-850 text-left space-y-1 shadow-sm">
                    <span className="font-bold block">✨ Edición disponible por 24 horas:</span>
                    <span>Puedes modificar y actualizar esta ficha clínica durante las próximas 24 horas desde la sección <strong>&quot;Atenciones Recientes&quot;</strong> en tu panel de control.</span>
                </div>
                <div className="flex flex-col gap-2 w-full pt-4">
                    <button
                        onClick={() => router.push('/dashboard/vet')}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        Volver al Panel Ahora
                    </button>
                    <p className="text-[10px] text-slate-400">Puedes tomarte tu tiempo para revisar el resumen o copiarlo antes de volver.</p>
                </div>
            </div>
        )
    }

    const isClinicalView = role !== 'provider' && attendingRole === 'vet'
    const isProviderOrNonClinical = role === 'provider' || attendingRole !== 'vet'

    const treatmentNotesLabel = isProviderOrNonClinical
        ? '📝 Observaciones y Servicios Realizados'
        : '🩺 Tratamiento / Notas Médicas'

    const treatmentNotesPlaceholder = isProviderOrNonClinical
        ? 'Ej: Baño completo, corte de uñas, limpieza de oídos...'
        : 'Procedimientos realizados, observaciones médicas...'

    const submitButtonText = loading
        ? 'Guardando...'
        : isProviderOrNonClinical
        ? 'Guardar Ficha de Servicio'
        : 'Guardar Ficha Médica'

    const isPenalized = profile?.isPenalized || debt >= 120

    if (isPenalized) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto animate-in fade-in duration-300">
                <div className="w-20 h-20 rounded-full bg-rose-105 flex items-center justify-center mx-auto text-rose-600">
                    <ShieldAlert className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Acceso Restringido por Deuda 🚫</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Tu cuenta de proveedor tiene penalizaciones activas o has alcanzado el límite de comisiones acumuladas pendientes de pago (monto actual: <strong className="text-rose-600">{formatPEN(debt)}</strong>).
                </p>
                <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-950 text-left space-y-1 shadow-sm">
                    <span className="font-bold block">¿Qué restricciones tienes?</span>
                    <span>No puedes registrar atenciones manuales de pacientes in-situ ni utilizar la <strong>Ficha Rápida</strong>. Para rehabilitar tu cuenta inmediatamente, realiza la liquidación total de comisiones.</span>
                </div>
                <div className="flex flex-col gap-2.5 w-full">
                    <button
                        onClick={() => router.push('/dashboard/vet/finances')}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                        Ir a Liquidar Deuda Ahora
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/vet')}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                    >
                        Volver al Panel
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-6 h-6 text-primary-600" />
                    {role === 'provider' ? 'Ficha de Servicio' : 'Ficha Rápida'}
                </h1>
            </div>

            {(() => {
                const showManualCommissionWarning = !loadingInitial && !loadingRecord && !isMarchaBlanca && (
                    !appointmentId || (appointmentData && appointmentData.commissionType === 'walkin' && appointmentData.paymentId === 'DEBT')
                )

                if (showManualCommissionWarning) {
                    return (
                        <div className="bg-amber-100/50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900 flex gap-2 items-start">
                            <span>⚠️</span>
                            <div>
                                <span className="font-semibold block">Aviso de Comisión (Ingreso Manual):</span>
                                <span className="opacity-90">Por favor, recuerda adicionar <strong>S/ 6.00</strong> al total cobrado al cliente. Brofy registrará esta comisión en tus deudas.</span>
                            </div>
                        </div>
                    )
                }

                return null
            })()}

            {isEditable && recordCreatedAt && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 text-xs font-bold flex items-center gap-2.5 shadow-sm">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0 animate-pulse" />
                    <div>
                        <span>Estás editando una ficha existente. </span>
                        <span className="font-normal block mt-0.5 text-blue-700">Tienes hasta 24 horas desde su creación original ({recordCreatedAt.toLocaleDateString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}) para realizar cambios y guardar antes de su cierre definitivo.</span>
                    </div>
                </div>
            )}

            {!isEditable && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2 shadow-sm">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                    <span>Esta ficha médica fue completada hace más de 24 horas y ya no puede ser modificada.</span>
                </div>
            )}

            {loadingRecord || loadingInitial ? (
                <LoadingState 
                    message="Cargando ficha médica..." 
                    description="Obteniendo historial clínico de la mascota"
                    minHeight="min-h-[30vh]"
                    size="md"
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {!appointmentId && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                                <p className="text-sm text-blue-800 font-medium mb-2">
                                    👤 Ingreso Manual (Sin código de cita)
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-blue-900 mb-1 block">Nombre Cliente *</label>
                                        <input
                                            type="text"
                                            value={guestClientName}
                                            onChange={e => setGuestClientName(e.target.value)}
                                            placeholder="Ej: Juan Pérez"
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-blue-900 mb-1 block">Teléfono (WhatsApp) *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={guestPhone}
                                            onChange={e => setGuestPhone(e.target.value)}
                                            placeholder="Ej: 987654321"
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-blue-900 mb-1 block">Email (Opcional)</label>
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={e => setGuestEmail(e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-[11px] text-blue-800 bg-blue-100/50 border border-blue-200 rounded-xl p-3 leading-relaxed">
                                        📲 <strong>Notificación por WhatsApp obligatoria:</strong> El número de teléfono se utilizará para enviarle la receta y el resumen por WhatsApp. Si el cliente se registra en Brofy usando este mismo número, heredará de forma automática toda su ficha médica e historial.
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-blue-900 mb-1 block">Nombre Mascota *</label>
                                        <input
                                            type="text"
                                            value={guestPetName}
                                            onChange={e => setGuestPetName(e.target.value)}
                                            placeholder="Ej: Firulais"
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-blue-900 mb-1 block">Especie Mascota *</label>
                                        <select
                                            value={guestPetSpecies}
                                            onChange={e => setGuestPetSpecies(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                                        >
                                            <option value="dog">🐕 Perro</option>
                                            <option value="cat">🐈 Gato</option>
                                            <option value="bird">🦜 Ave</option>
                                            <option value="rabbit">🐇 Conejo</option>
                                            <option value="other">🐾 Otro</option>
                                        </select>
                                    </div>

                                    {establishments.length > 1 && (
                                        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                                            <label className="text-xs font-semibold text-blue-900 mb-1 block">Sede de Atención *</label>
                                            <select
                                                value={selectedEstId}
                                                onChange={e => setSelectedEstId(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                                            >
                                                {establishments.map(est => (
                                                    <option key={est.id} value={est.id}>
                                                        {est.name} ({est.district || 'General'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={guestConsentConfirmed}
                                            onChange={e => setGuestConsentConfirmed(e.target.checked)}
                                            className="mt-0.5 w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 shrink-0"
                                        />
                                        <span className="text-xs text-amber-900 leading-relaxed">
                                            <strong>Consentimiento del paciente:</strong> Confirmo que el cliente ha otorgado su consentimiento verbal para el registro de sus datos y los de su mascota en la plataforma Brofy, conforme a la Ley N.º 29733 de Protección de Datos Personales.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* ── Responsable de la Atención (siempre visible) ── */}
                            {(() => {
                                const specs = getActiveSpecialists()
                                const selectedSpec = specs.find((s: any) => s.id === selectedSpecialist)
                                const currentRole = selectedSpecialist === 'default'
                                    ? (role === 'provider' ? 'provider' : 'vet')
                                    : (selectedSpec?.role || 'vet')
                                const isVetRole = currentRole === 'vet'
                                const hasCmvp = selectedSpec?.cmvpId && selectedSpec.cmvpId !== 'No aplica'
                                const roleLabels: Record<string,string> = { vet: '🩺 Veterinario/a', groomer: '✂️ Estilista / Groomer', bath: '🛁 Bañador/a', walker: '🦮 Paseador/a', trainer: '🎓 Entrenador/a', other: '👤 Personal' }

                                return (
                                    <div className={`rounded-xl border p-3.5 space-y-2 shadow-sm ${
                                        isVetRole
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-emerald-50 border-emerald-200'
                                    }`}>
                                        <label className={`flex items-center gap-1.5 text-xs font-bold ${
                                            isVetRole ? 'text-blue-800' : 'text-emerald-800'
                                        }`}>
                                            <User className="w-3.5 h-3.5" />
                                            {isVetRole ? '🩺 Responsable Médico de la Atención' : `${roleLabels[currentRole] || '👤 Personal'} Responsable`}
                                        </label>

                                        <select
                                            value={selectedSpecialist}
                                            onChange={e => {
                                                setSelectedSpecialist(e.target.value)
                                                if (e.target.value === 'default') {
                                                    setAttendingRole(role === 'provider' ? 'provider' : 'vet')
                                                } else {
                                                    const spec = getActiveSpecialists().find((s: any) => s.id === e.target.value)
                                                    setAttendingRole(spec?.role || 'vet')
                                                }
                                            }}
                                            disabled={!isEditable}
                                            className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 font-medium cursor-pointer disabled:opacity-60 ${
                                                isVetRole
                                                    ? 'bg-white border-blue-200 focus:ring-blue-400'
                                                    : 'bg-white border-emerald-200 focus:ring-emerald-400'
                                            }`}
                                        >
                                            <option value="default">
                                                {role === 'provider'
                                                    ? `👤 ${profile?.fullName || ''}`
                                                    : `🩺 ${profile?.fullName || ''}${profile?.cmvpId ? ` — CMVP ${profile.cmvpId}` : ''}`
                                                }
                                            </option>
                                            {specs.map((spec: any) => {
                                                const roleEmojis: Record<string,string> = { vet: '🩺', groomer: '✂️', bath: '🛁', walker: '🦮', trainer: '🎓', other: '👤' }
                                                const emoji = roleEmojis[spec.role] || '👤'
                                                const specHasCmvp = spec.cmvpId && spec.cmvpId !== 'No aplica'
                                                return (
                                                    <option key={spec.id} value={spec.id}>
                                                        {emoji} {spec.name}{specHasCmvp ? ` — CMVP ${spec.cmvpId}` : ' — No médico'}
                                                    </option>
                                                )
                                            })}
                                        </select>

                                        {/* Badge informativo según rol */}
                                        {isVetRole ? (
                                            <div className="flex items-start gap-2">
                                                {selectedSpecialist === 'default' ? (
                                                    profile?.cmvpId ? (
                                                        <p className="text-[10px] text-blue-700">
                                                            ✅ Enfoque clínico. La colegiatura CMVP ({profile.cmvpId}) quedará registrada en la ficha.
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-red-600 font-semibold">
                                                            ⚠️ Tu perfil no tiene CMVP registrado. Agrégalo en la configuración para poder guardar la ficha médica.
                                                        </p>
                                                    )
                                                ) : hasCmvp ? (
                                                    <p className="text-[10px] text-blue-700">
                                                        ✅ Con CMVP ({selectedSpec?.cmvpId}). La colegiatura médica quedará registrada en la ficha.
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-red-600 font-semibold">
                                                        ⚠️ Este veterinario no tiene CMVP registrado. Agrégalo en la sección de Staff antes de guardar.
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-emerald-700">
                                                ✅ Servicio no clínico. No requiere colegiatura médica. Se registrará como servicio de {roleLabels[currentRole]?.replace(/^[^\s]+\s/, '') || 'personal'}.
                                            </p>
                                        )}
                                    </div>
                                )
                            })()}

                            {/* Clinical-only fields: only show if attending role is vet (medical) */}
                            {isClinicalView && (
                                <>
                                    {/* Vital Signs Row */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                                                <Weight className="w-3.5 h-3.5" /> Peso (kg)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={weight}
                                                onChange={e => setWeight(e.target.value)}
                                                disabled={!isEditable}
                                                placeholder="0.0"
                                                className="w-full text-lg font-bold text-slate-900 bg-transparent border-0 focus:outline-none p-0 disabled:opacity-60"
                                            />
                                        </div>
                                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                                                <Thermometer className="w-3.5 h-3.5" /> Temp (°C)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={temperature}
                                                onChange={e => setTemperature(e.target.value)}
                                                disabled={!isEditable}
                                                placeholder="38.5"
                                                className="w-full text-lg font-bold text-slate-900 bg-transparent border-0 focus:outline-none p-0 disabled:opacity-60"
                                            />
                                        </div>
                                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                                                <Heart className="w-3.5 h-3.5" /> FC (bpm)
                                            </label>
                                            <input
                                                type="number"
                                                value={heartRate}
                                                onChange={e => setHeartRate(e.target.value)}
                                                disabled={!isEditable}
                                                placeholder="120"
                                                className="w-full text-lg font-bold text-slate-900 bg-transparent border-0 focus:outline-none p-0 disabled:opacity-60"
                                            />
                                        </div>
                                    </div>

                                    {/* Symptoms */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Síntomas (toca para agregar)
                                        </label>

                                        {symptoms.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {symptoms.map(s => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => removeSymptom(s)}
                                                        disabled={!isEditable}
                                                        className="flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-70"
                                                    >
                                                        {s} <X className="w-3 h-3" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {COMMON_SYMPTOMS.slice(0, 10).map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => addSymptom(s)}
                                                    disabled={!isEditable || symptoms.includes(s)}
                                                    className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-xs hover:bg-primary-50 hover:text-primary-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={customSymptom}
                                                onChange={e => setCustomSymptom(e.target.value)}
                                                disabled={!isEditable}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSymptom())}
                                                placeholder="Otro síntoma..."
                                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60"
                                            />
                                            <button
                                                type="button"
                                                onClick={addCustomSymptom}
                                                disabled={!isEditable}
                                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-primary-100 hover:text-primary-700 transition-colors disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Diagnosis */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-0.5">
                                            <Stethoscope className="w-4 h-4" /> Diagnóstico
                                        </label>
                                        <span className="block text-[10px] text-slate-400 mb-1.5">
                                            *(Muestra el problema de salud en la pestaña &quot;Diagnósticos&quot; del Carnet del dueño)*
                                        </span>
                                        <input
                                            type="text"
                                            list="diagnosis-list"
                                            value={diagnosis}
                                            onChange={e => setDiagnosis(e.target.value)}
                                            disabled={!isEditable}
                                            placeholder="Escribe o selecciona..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60 disabled:bg-slate-50"
                                        />
                                        <datalist id="diagnosis-list">
                                            {COMMON_DIAGNOSES.map(d => (
                                                <option key={d} value={d} />
                                            ))}
                                        </datalist>
                                    </div>

                                    {/* Prescription */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-0.5">
                                            <Pill className="w-4 h-4" /> Prescripción
                                        </label>
                                        <span className="block text-[10px] text-slate-400 mb-1.5">
                                            *(Medicamentos y dosis. Se enviará en la receta de WhatsApp y aparecerá en &quot;Tratamientos&quot;)*
                                        </span>
                                        <textarea
                                            value={prescription}
                                            onChange={e => setPrescription(e.target.value)}
                                            disabled={!isEditable}
                                            placeholder="Medicamentos, dosis, duración..."
                                            rows={2}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-60 disabled:bg-slate-50"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Treatment / Notes — always shown, label adapts */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-0.5 block">
                                    {treatmentNotesLabel}
                                </label>
                                <span className="block text-[10px] text-slate-400 mb-1.5">
                                    *(Procedimientos realizados o notas de la atención. Se mostrará en la pestaña &quot;Tratamientos&quot; del Carnet)*
                                </span>
                                <textarea
                                    value={treatment}
                                    onChange={e => setTreatment(e.target.value)}
                                    disabled={!isEditable}
                                    placeholder={treatmentNotesPlaceholder}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-60 disabled:bg-slate-50"
                                />
                            </div>

                            {/* Next Visit / Reminder Control */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-0.5">
                                    <CalendarDays className="w-4 h-4 text-primary-500" /> Próxima cita / Control (Recordatorio Automático)
                                </label>
                                <span className="block text-[10px] text-slate-400 mb-1.5">
                                    *(Crea un recordatorio en la app y se muestra en la pestaña &quot;Tratamientos&quot; del carnet)*
                                </span>
                                <input
                                    type="date"
                                    value={nextVisit}
                                    onChange={e => setNextVisit(e.target.value)}
                                    disabled={!isEditable}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60 disabled:bg-slate-50"
                                />
                                <p className="text-xs text-slate-500 mt-1">Si indicas una fecha, se creará o actualizará un recordatorio automático para el cliente.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            {isEditable && (
                                <div className="space-y-2.5">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-semibold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5" />
                                        )}
                                        {submitButtonText}
                                    </button>
                                    <p className="text-xs text-slate-500 text-center leading-normal px-2">
                                        ⏱️ <strong>Guarda ahora y completa después:</strong> Si este es un procedimiento complejo o necesitas monitorear la evolución del paciente, puedes guardar esta ficha ahora. Tendrás <strong>hasta 24 horas</strong> para editarla, completarla y actualizarla desde la sección &quot;Atenciones Recientes&quot; de tu panel.
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Patient Detail and Timeline Column */}
                    {appointmentData && (
                        <div className="space-y-4">
                            {/* Pet Detail Card */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
                                    🐾 Información del Paciente
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Nombre:</span>
                                        <span className="text-slate-800 font-bold">{appointmentData.pet?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Especie:</span>
                                        <span className="text-slate-800 font-semibold capitalize">{appointmentData.pet?.species === 'dog' ? '🐕 Perro' : appointmentData.pet?.species === 'cat' ? '🐈 Gato' : '🐾 ' + (SPECIES_LABELS[appointmentData.pet?.species as keyof typeof SPECIES_LABELS] || appointmentData.pet?.species)}</span>
                                    </div>
                                    {appointmentData.pet?.breed && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Raza:</span>
                                            <span className="text-slate-800 font-semibold">{appointmentData.pet?.breed}</span>
                                        </div>
                                    )}
                                    {appointmentData.pet?.sex && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Sexo:</span>
                                            <span className="text-slate-800 font-semibold capitalize">{appointmentData.pet?.sex === 'male' ? '♂ Macho' : '♀ Hembra'}</span>
                                        </div>
                                    )}
                                    {appointmentData.pet?.dateOfBirth && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Nacimiento:</span>
                                            <span className="text-slate-800 font-semibold">{formatDate(appointmentData.pet.dateOfBirth)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dueño</h4>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Nombre:</span>
                                        <span className="text-slate-800 font-semibold">{appointmentData.client?.fullName}</span>
                                    </div>
                                    {appointmentData.client?.phone && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Teléfono:</span>
                                            <a href={`tel:${appointmentData.client.phone}`} className="text-primary-600 font-bold hover:underline flex items-center gap-1">
                                                <Phone className="w-3.5 h-3.5 fill-primary-50" /> {appointmentData.client.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Restrained Medical History Timeline */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100" title="Solo se muestran registros previos a la hora de esta cita">
                                    ⏳ Historial Médico Prev.
                                </h3>

                                {pastHistory.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-4">No hay atenciones registradas antes de esta cita.</p>
                                ) : (
                                    <div className="relative pl-4 border-l border-slate-100 space-y-4 max-h-[300px] overflow-y-auto">
                                        {pastHistory.map((h, idx) => (
                                            <div key={idx} className="relative space-y-1">
                                                {/* Bullet dot */}
                                                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white shadow-sm" />
                                                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(h.createdAt).toLocaleDateString('es-PE')}
                                                    </span>
                                                    <span>Dr. {h.vet?.fullName.split(' ')[0]}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-800">{h.diagnosis || 'Consulta General'}</p>
                                                {h.treatment && (
                                                    <p className="text-[11px] text-slate-500 italic line-clamp-2">{h.treatment}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
