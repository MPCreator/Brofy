'use client'

import { useState, useEffect } from 'react'
import { createMedicalRecord } from '@/lib/actions'
import { COMMON_SYMPTOMS, COMMON_DIAGNOSES } from '@/lib/types'
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
    ShieldAlert
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function FastEntryPage() {
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
    const [guestPetName, setGuestPetName] = useState('')
    const [guestPetSpecies, setGuestPetSpecies] = useState('dog')
    const [guestConsentConfirmed, setGuestConsentConfirmed] = useState(false)
    const [nextVisit, setNextVisit] = useState('')

    const [establishments, setEstablishments] = useState<any[]>([])
    const [selectedEstId, setSelectedEstId] = useState('')
    const [role, setRole] = useState('vet')

    // Unified states for loaded data
    const [appointmentData, setAppointmentData] = useState<any>(null)
    const [pastHistory, setPastHistory] = useState<any[]>([])
    const [isEditable, setIsEditable] = useState(true)
    const [loadingRecord, setLoadingRecord] = useState(false)

    useEffect(() => {
        async function loadInitialData() {
            const { getMyEstablishments, getMyRole } = await import('@/lib/actions')
            const [list, userRole] = await Promise.all([
                getMyEstablishments(),
                getMyRole()
            ])
            setEstablishments(list)
            if (list.length > 0) {
                setSelectedEstId(list[0].id)
            }
            setRole(userRole)
        }

        async function loadExistingRecord() {
            setLoadingRecord(true)
            try {
                const { getMyRole, getAppointmentForVet } = await import('@/lib/actions')
                const userRole = await getMyRole()
                setRole(userRole)

                const res = await getAppointmentForVet(appointmentId)
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
                    }
                }
            } catch (e) {
                console.error("Error loading record:", e)
                setError("Error al cargar la información de la cita")
            } finally {
                setLoadingRecord(false)
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
                })
            } else {
                if (!guestClientName || !guestPetName) {
                    setError('Debes ingresar el nombre del cliente y la mascota si no hay cita previa.')
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
                    guestEmail,
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
                })
            }

            if (result.success) {
                setSuccess(true)
                setTimeout(() => router.push('/dashboard/vet'), 2000)
            } else {
                setError(result.message || 'Error al guardar')
            }
        } catch {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">¡Ficha guardada! ✅</h2>
                <p className="text-sm text-slate-500">El registro se agregó al historial de la mascota</p>
                <p className="text-xs text-slate-400">Redirigiendo al panel...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-6 h-6 text-primary-600" />
                    {role === 'provider' ? 'Ficha de Servicio' : 'Ficha Rápida'}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {role === 'provider' ? 'Registra la atención en menos de 5 segundos' : 'Ficha médica rápida — llena en menos de 5 segundos'}
                </p>
            </div>

            <div className="bg-amber-100/50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900 flex gap-2 items-start">
                <span>⚠️</span>
                <div>
                    <span className="font-semibold block">Aviso de Comisión:</span>
                    <span className="opacity-90">Por favor, recuerda adicionar <strong>S/ 6.00</strong> al total cobrado al cliente. Brofy registrará esta comisión en tus deudas.</span>
                </div>
            </div>

            {!isEditable && (
                <div className="bg-red-50 border border-red-200 text-red-805 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-655 shrink-0" />
                    <span>Esta ficha médica fue completada hace más de 24 horas y ya no puede ser modificada.</span>
                </div>
            )}

            {loadingRecord ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {!appointmentId && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                                <p className="text-sm text-blue-800 font-medium mb-2">
                                    👤 Ingreso Manual (Sin código)
                                </p>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
                                        <label className="text-xs font-medium text-blue-900 mb-1 block">Email (Opcional)</label>
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={e => setGuestEmail(e.target.value)}
                                            placeholder="Para conectar su cuenta luego"
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        />
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
                                    {establishments.length > 1 && (
                                        <div className="col-span-2 lg:col-span-3">
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
                            {role !== 'provider' && (
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
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                                            <Stethoscope className="w-4 h-4" /> Diagnóstico
                                        </label>
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
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                                            <Pill className="w-4 h-4" /> Prescripción
                                        </label>
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

                            {/* Treatment */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                    {role === 'provider' ? 'Observaciones y Servicios Realizados' : 'Tratamiento / Notas'}
                                </label>
                                <textarea
                                    value={treatment}
                                    onChange={e => setTreatment(e.target.value)}
                                    disabled={!isEditable}
                                    placeholder="Procedimientos realizados, observaciones..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-60 disabled:bg-slate-50"
                                />
                            </div>

                            {/* Next Visit / Reminder Control */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                                    <CalendarDays className="w-4 h-4 text-primary-500" /> Próxima cita / Control (Recordatorio Automático)
                                </label>
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
                                    {loading ? 'Guardando...' : role === 'provider' ? 'Guardar Ficha de Servicio' : 'Guardar Ficha Médica'}
                                </button>
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
                                        <span className="text-slate-800 font-semibold capitalize">{appointmentData.pet?.species === 'dog' ? '🐕 Perro' : appointmentData.pet?.species === 'cat' ? '🐈 Gato' : '🐾 ' + appointmentData.pet?.species}</span>
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
