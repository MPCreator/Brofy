'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createManualTurn, getMyEstablishments } from '@/lib/actions'
import { toast } from 'sonner'
import { Calendar, User, Phone, ArrowLeft, Loader2, AlertTriangle, HelpCircle } from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'

export default function CreateTurnPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingInitial, setLoadingInitial] = useState(true)
    const [error, setError] = useState('')

    // Establishments & Services data
    const [establishments, setEstablishments] = useState<any[]>([])
    const [selectedEstId, setSelectedEstId] = useState('')
    const [services, setServices] = useState<any[]>([])
    const [selectedServiceId, setSelectedServiceId] = useState('')
    const [customDuration, setCustomDuration] = useState(30)

    // Form inputs
    const [guestClientName, setGuestClientName] = useState('')
    const [guestPetName, setGuestPetName] = useState('')
    const [guestPetSpecies, setGuestPetSpecies] = useState('dog')
    const [guestEmail, setGuestEmail] = useState('')
    const [guestPhone, setGuestPhone] = useState('')
    const [serviceType, setServiceType] = useState('consultation')
    
    // Scheduling inputs
    const [scheduleType, setScheduleType] = useState<'immediate' | 'future'>('immediate')
    const [scheduledDate, setScheduledDate] = useState('')
    const [scheduledTime, setScheduledTime] = useState('')

    useEffect(() => {
        async function fetchInitial() {
            try {
                const list = await getMyEstablishments()
                setEstablishments(list)
                if (list.length > 0) {
                    setSelectedEstId(list[0].id)
                    setServices(list[0].services || [])
                }
            } catch (e) {
                console.error("Error loading establishments for manual turn:", e)
            } finally {
                setLoadingInitial(false)
            }
        }
        fetchInitial()
    }, [])

    const handleEstablishmentChange = (estId: string) => {
        setSelectedEstId(estId)
        const est = establishments.find(e => e.id === estId)
        if (est) {
            setServices(est.services || [])
            setSelectedServiceId('')
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (!guestClientName.trim()) {
            setError('Por favor ingresa el nombre del cliente')
            return
        }
        if (!guestPetName.trim()) {
            setError('Por favor ingresa el nombre de la mascota')
            return
        }
        if (!guestPhone.trim()) {
            setError('El número de teléfono / WhatsApp es obligatorio para poder registrar el turno.')
            return
        }

        setLoading(true)

        let scheduledAt: string | undefined = undefined
        if (scheduleType === 'future') {
            if (!scheduledDate || !scheduledTime) {
                setError('Por favor selecciona la fecha y hora programada')
                setLoading(false)
                return
            }
            scheduledAt = `${scheduledDate}T${scheduledTime}`
        }

        try {
            const res = await createManualTurn({
                guestClientName: guestClientName.trim(),
                guestPetName: guestPetName.trim(),
                guestPetSpecies,
                guestEmail: guestEmail.trim() || undefined,
                guestPhone: guestPhone.trim() || undefined,
                serviceType: selectedServiceId ? '' : serviceType,
                scheduledAt,
                establishmentId: selectedEstId || undefined,
                serviceId: selectedServiceId || undefined,
                customDuration: selectedServiceId ? undefined : customDuration
            })

            if (res.success) {
                toast.success(
                    scheduleType === 'immediate'
                        ? 'Turno inmediato creado con éxito. Ve a la Sala de Espera para atender.'
                        : 'Turno programado creado con éxito.'
                )
                router.push('/dashboard/vet')
                router.refresh()
            } else {
                setError(res.message || 'Error al crear el turno')
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    if (loadingInitial) {
        return (
            <LoadingState size="lg" message="Cargando establecimientos y servicios..." description="Preparando tu agenda de turnos" />
        )
    }

    const durationMins = selectedServiceId
        ? (services.find(s => s.id === selectedServiceId)?.duration || 30)
        : customDuration

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-20 font-sans">
            {/* Header / Back */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push('/dashboard/vet')}
                    className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors"
                >
                    <ArrowLeft className="w-4.5 h-4.5" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5.5 h-5.5 text-primary-650" />
                        Agendar Turno Manual
                    </h1>
                    <p className="text-xs text-slate-500">Bloquea un horario o crea un turno en sala de espera para clientes presenciales</p>
                </div>
            </div>

            {/* Main form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                
                {/* Infrastructure Cost Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-xs space-y-1">
                        <p className="font-bold text-amber-955">⚠️ Recordatorio de Tarifa por Registro</p>
                        <p className="leading-relaxed text-amber-800">
                            Cada turno manual o presencial registrado directamente en la plataforma conlleva un cargo adicional de <strong>S/. 6.00</strong> por concepto de costos de infraestructura.
                        </p>
                    </div>
                </div>

                {/* Sede/Establecimiento Select (Only visible if professional has establishments) */}
                {establishments.length > 1 && (
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Sede de Atención *</label>
                        <select
                            value={selectedEstId}
                            onChange={e => handleEstablishmentChange(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-slate-700 cursor-pointer"
                        >
                            {establishments.map(est => (
                                <option key={est.id} value={est.id}>
                                    {est.name} ({est.district || 'General'})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 1. Datos del Cliente */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-500" />
                        Datos del Cliente (Dueño)
                    </h3>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Nombre Completo *</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej. Juan Pérez"
                            value={guestClientName}
                            onChange={e => setGuestClientName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Teléfono / WhatsApp *</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    required
                                    placeholder="Ej. 987654321"
                                    value={guestPhone}
                                    onChange={e => setGuestPhone(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Correo electrónico (Opcional)</label>
                            <input
                                type="email"
                                placeholder="Ej. juan@correo.com"
                                value={guestEmail}
                                onChange={e => setGuestEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                            />
                        </div>
                    </div>

                    <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-3.5 space-y-1 text-xs text-primary-950 font-medium">
                        <div className="flex items-center gap-1.5 font-bold text-primary-750">
                            <HelpCircle className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                            <span>¿Por qué es obligatorio el teléfono?</span>
                        </div>
                        <p className="text-[11px] text-primary-900/90 leading-relaxed">
                            Las notificaciones de atenciones se enviarán únicamente por WhatsApp. Además, al registrar al cliente con este número de teléfono móvil, el sistema vinculará de manera automática todo su historial clínico y recetas en su cuenta si decide registrarse en Brofy posteriormente.
                        </p>
                    </div>
                </div>

                {/* 2. Datos de la Mascota */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        🐾 Datos de la Mascota
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Nombre de Mascota *</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej. Firulais"
                                value={guestPetName}
                                onChange={e => setGuestPetName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Especie</label>
                            <select
                                value={guestPetSpecies}
                                onChange={e => setGuestPetSpecies(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-slate-700"
                            >
                                <option value="dog">🐕 Perro</option>
                                <option value="cat">🐈 Gato</option>
                                <option value="other">🐾 Otro</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Detalles de Servicio */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        🩺 Servicio y Tipo de Atención
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Servicio del Local</label>
                            <select
                                value={selectedServiceId}
                                onChange={e => setSelectedServiceId(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-slate-700 cursor-pointer"
                            >
                                <option value="">🛠️ Servicio Genérico / Otro</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} — S/ {s.price.toFixed(2)} ({s.duration} min)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!selectedServiceId ? (
                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Tipo de Categoría</label>
                                <select
                                    value={serviceType}
                                    onChange={e => setServiceType(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-slate-700"
                                >
                                    <option value="consultation">Consulta Médica</option>
                                    <option value="vaccination">Vacunación</option>
                                    <option value="grooming">Estética / Peluquería</option>
                                    <option value="surgery">Cirugía / Operación</option>
                                    <option value="deworming">Desparasitación</option>
                                    <option value="test">Exámenes Clínicos</option>
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Detalle de Costo</label>
                                <div className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 leading-none flex items-center justify-between">
                                    <span>Tarifa de servicio:</span>
                                    <span className="text-primary-700">S/ {services.find(s => s.id === selectedServiceId)?.price.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!selectedServiceId && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Duración del Turno *</label>
                            <select
                                value={customDuration}
                                onChange={e => setCustomDuration(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-slate-700 cursor-pointer"
                            >
                                <option value={15}>15 minutos</option>
                                <option value={30}>30 minutos (Por defecto)</option>
                                <option value={45}>45 minutos</option>
                                <option value={60}>1 hora (60 min)</option>
                                <option value={90}>1.5 horas (90 min)</option>
                                <option value={120}>2 horas (120 min)</option>
                            </select>
                        </div>
                    )}

                    {/* Blocked Calendar Duration Callout */}
                    <div className="p-3 bg-primary-50 border border-primary-150 rounded-xl flex items-center justify-between text-xs text-primary-950 font-bold">
                        <span className="flex items-center gap-1.5">⏱️ Tiempo a bloquear en calendario:</span>
                        <span className="bg-primary-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black">{durationMins} minutos</span>
                    </div>
                </div>

                {/* 4. Programación */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        ⏰ Horario y Programación
                    </h3>

                    {/* Schedule Selector */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setScheduleType('immediate')}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                scheduleType === 'immediate'
                                    ? 'bg-white text-primary-700 shadow-sm font-black'
                                    : 'text-slate-650 hover:text-slate-900 font-bold'
                            }`}
                        >
                            Atención Inmediata (Ahora)
                        </button>
                        <button
                            type="button"
                            onClick={() => setScheduleType('future')}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                scheduleType === 'future'
                                    ? 'bg-white text-primary-700 shadow-sm font-black'
                                    : 'text-slate-650 hover:text-slate-900 font-bold'
                            }`}
                        >
                            Programar Cita (Futura)
                        </button>
                    </div>

                    {scheduleType === 'future' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Fecha</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={scheduledDate}
                                    onChange={e => setScheduledDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Hora</label>
                                <input
                                    type="time"
                                    required
                                    value={scheduledTime}
                                    onChange={e => setScheduledTime(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {scheduleType === 'immediate' ? (
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            💡 **Atención Inmediata:** El turno se creará para hoy. Aparecerá inmediatamente en tu **Sala de Espera** y podrás atenderlo cuando desees sin digitar código OTP de cliente.
                        </p>
                    ) : (
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            💡 **Cita Programada:** El turno se registrará para la fecha elegida. **Bloqueará tu calendario** por un rango de {durationMins} minutos para evitar cruces de horarios y aparecerá en tu agenda del día.
                        </p>
                    )}
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-950 font-medium animate-in duration-200 fade-in">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-650 shrink-0 mt-0.5" />
                        <span className="flex-1 leading-normal">{error}</span>
                    </div>
                )}

                {/* Submits */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/vet')}
                        className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-650 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Creando Turno...' : 'Crear Turno Manual'}
                    </button>
                </div>
            </form>
        </div>
    )
}
