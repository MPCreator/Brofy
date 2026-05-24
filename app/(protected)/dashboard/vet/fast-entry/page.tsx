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
} from 'lucide-react'

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
        if (!appointmentId) {
            loadInitialData()
        } else {
            async function fetchRole() {
                const { getMyRole } = await import('@/lib/actions')
                setRole(await getMyRole())
            }
            fetchRole()
        }
    }, [appointmentId])

    function addSymptom(symptom: string) {
        if (!symptoms.includes(symptom)) {
            setSymptoms([...symptoms, symptom])
        }
    }

    function removeSymptom(symptom: string) {
        setSymptoms(symptoms.filter(s => s !== symptom))
    }

    function addCustomSymptom() {
        if (customSymptom.trim()) {
            addSymptom(customSymptom.trim())
            setCustomSymptom('')
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        
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
        <div className="space-y-4 pb-20 lg:pb-0">
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

                    {/* Patient consent declaration — legally required for third-party data */}
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
                        {/* Vital Signs Row — 3 columns */}
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
                            placeholder="0.0"
                            className="w-full text-lg font-bold text-slate-900 bg-transparent border-0 focus:outline-none p-0"
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
                            placeholder="38.5"
                            className="w-full text-lg font-bold text-slate-900 bg-transparent border-0 focus:outline-none p-0"
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
                            placeholder="120"
                            className="w-full text-lg font-bold text-slate-900 bg-transparent border-0 focus:outline-none p-0"
                        />
                    </div>
                </div>

                {/* Symptoms — Quick Select */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Síntomas (toca para agregar)
                    </label>

                    {/* Selected */}
                    {symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {symptoms.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => removeSymptom(s)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium hover:bg-red-100 hover:text-red-700 transition-colors"
                                >
                                    {s} <X className="w-3 h-3" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {COMMON_SYMPTOMS.slice(0, 10).map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => addSymptom(s)}
                                disabled={symptoms.includes(s)}
                                className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-xs hover:bg-primary-50 hover:text-primary-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Custom */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customSymptom}
                            onChange={e => setCustomSymptom(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSymptom())}
                            placeholder="Otro síntoma..."
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                            type="button"
                            onClick={addCustomSymptom}
                            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-primary-100 hover:text-primary-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Diagnosis — Predictive */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                        <Stethoscope className="w-4 h-4" /> Diagnóstico
                    </label>
                    <input
                        type="text"
                        list="diagnosis-list"
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                        placeholder="Escribe o selecciona..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        placeholder="Medicamentos, dosis, duración..."
                        rows={2}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                        placeholder="Procedimientos realizados, observaciones..."
                        rows={2}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* Next Visit / Reminder Control Date */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                        <CalendarDays className="w-4 h-4 text-primary-500" /> Próxima cita / Control (Recordatorio Automático)
                    </label>
                    <input
                        type="date"
                        value={nextVisit}
                        onChange={e => setNextVisit(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">Si indicas una fecha, se creará un recordatorio automático en el panel del cliente.</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Submit */}
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
            </form>
        </div>
    )
}
