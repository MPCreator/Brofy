'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createManualTurn, getMyEstablishments, getMarchaBlancaSetting, getOccupiedSlots, getTodayAppointments } from '@/lib/actions'
import { toast } from 'sonner'
import { Calendar, User, Phone, ArrowLeft, Loader2, AlertTriangle, HelpCircle } from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'
import { getPeruLocalDateString, getTimezoneByCountry, getTimezoneOffsetString, getLocalLocalDateString } from '@/lib/utils'

export default function CreateTurnPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingInitial, setLoadingInitial] = useState(true)
    const [error, setError] = useState('')
    const [isMarchaBlanca, setIsMarchaBlanca] = useState(false)

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
    const [scheduledDate, setScheduledDate] = useState(getPeruLocalDateString())
    const [scheduledTime, setScheduledTime] = useState('')

    // Slots availability
    const [occupiedSlots, setOccupiedSlots] = useState<any[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    // Today's appointments for upcoming clients alerts
    const [todayApts, setTodayApts] = useState<any[]>([])
    const [loadingTodayApts, setLoadingTodayApts] = useState(false)

    useEffect(() => {
        if (!selectedEstId || !scheduledDate) {
            setOccupiedSlots([])
            return
        }
        async function fetchSlots() {
            setLoadingSlots(true)
            try {
                const occupied = await getOccupiedSlots(selectedEstId, scheduledDate)
                setOccupiedSlots(occupied || [])
            } catch (e) {
                console.error("Error loading occupied slots:", e)
            } finally {
                setLoadingSlots(false)
            }
        }
        fetchSlots()
    }, [selectedEstId, scheduledDate])

    useEffect(() => {
        if (!selectedEstId) {
            setTodayApts([])
            return
        }
        async function fetchTodayApts() {
            setLoadingTodayApts(true)
            try {
                const list = await getTodayAppointments(selectedEstId)
                setTodayApts(list || [])
            } catch (e) {
                console.error("Error loading today appointments:", e)
            } finally {
                setLoadingTodayApts(false)
            }
        }
        fetchTodayApts()
    }, [selectedEstId])


    const generateSlots = () => {
        const slots: string[] = [];
        for (let mins = 8 * 60; mins <= 20 * 60; mins += 30) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
        return slots;
    };

    const isSlotPast = (slotStr: string) => {
        if (!scheduledDate || !selectedEstId) return false;
        
        const selectedEst = establishments.find(e => e.id === selectedEstId)
        const tz = getTimezoneByCountry(selectedEst?.country || 'PE')
        const offset = getTimezoneOffsetString(tz)
        const slotStart = new Date(`${scheduledDate}T${slotStr}${offset}`).getTime();
        
        return slotStart < Date.now();
    };

    const isSlotOccupied = (slotStr: string) => {
        if (!scheduledDate || !selectedEstId) return false;
        
        const selectedEst = establishments.find(e => e.id === selectedEstId)
        const tz = getTimezoneByCountry(selectedEst?.country || 'PE')
        const offset = getTimezoneOffsetString(tz)
        const slotStart = new Date(`${scheduledDate}T${slotStr}${offset}`).getTime();
        
        const duration = selectedServiceId
            ? (services.find(s => s.id === selectedServiceId)?.duration || 30)
            : customDuration;
        const slotEnd = slotStart + duration * 60000;

        const concurrentSlots = selectedEst?.concurrentSlots || 1;
        let overlapCount = 0;

        for (const apt of occupiedSlots) {
            const aptStart = new Date(apt.scheduledAt).getTime();
            const aptEnd = aptStart + apt.duration * 60000;

            if (slotStart < aptEnd && slotEnd > aptStart) {
                overlapCount++;
            }
        }

        return overlapCount >= concurrentSlots;
    };


    const getUpcomingClientAlerts = () => {
        const nowTime = Date.now();
        const alerts: any[] = [];
        
        todayApts.forEach(apt => {
            if (!apt.scheduledAt) return;
            const aptTime = new Date(apt.scheduledAt).getTime();
            const minutesDiff = (aptTime - nowTime) / 60000;
            // If the appointment starts within the next 60 minutes or is up to 15 minutes overdue (but still today)
            if (minutesDiff >= -15 && minutesDiff <= 60) {
                alerts.push({
                    ...apt,
                    minutesDiff: Math.round(minutesDiff)
                });
            }
        });
        return alerts;
    };


    useEffect(() => {
        async function fetchInitial() {
            try {
                const [list, mbSetting] = await Promise.all([
                    getMyEstablishments(),
                    getMarchaBlancaSetting()
                ])
                setEstablishments(list)
                setIsMarchaBlanca(mbSetting.isActive)
                if (list.length > 0) {
                    setSelectedEstId(list[0].id)
                    const estServices = list[0].services || []
                    setServices(estServices)
                    if (estServices.length > 0) {
                        setSelectedServiceId(estServices[0].id)
                    }
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
            const estServices = est.services || []
            setServices(estServices)
            if (estServices.length > 0) {
                setSelectedServiceId(estServices[0].id)
            } else {
                setSelectedServiceId('')
            }
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
        if (services.length === 0) {
            setError('No puedes registrar un turno si la sede no tiene servicios configurados en su lista de precios.')
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
            const selectedEst = establishments.find(e => e.id === selectedEstId)
            const tz = getTimezoneByCountry(selectedEst?.country || 'PE')
            const offset = getTimezoneOffsetString(tz)
            const requestedTime = new Date(`${scheduledAt}${offset}`).getTime()
            if (requestedTime < Date.now() - 5 * 60 * 1000) {
                setError('No es posible agendar una cita en un horario pasado')
                setLoading(false)
                return
            }
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
                {!isMarchaBlanca && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                        <div className="text-xs space-y-1">
                            <p className="font-bold text-amber-955">⚠️ Recordatorio de Tarifa por Registro</p>
                            <p className="leading-relaxed text-amber-800">
                                Cada turno manual o presencial registrado directamente en la plataforma conlleva un cargo adicional de <strong>S/. 6.00</strong> por concepto de costos de infraestructura.
                            </p>
                        </div>
                    </div>
                )}

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
                    
                    {services.length === 0 ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-955 font-semibold leading-relaxed space-y-1">
                            <p className="flex items-center gap-1.5 text-red-800 font-extrabold uppercase tracking-wider text-[10px]">
                                ⚠️ No hay servicios configurados
                            </p>
                            <p className="font-normal text-red-700">
                                Esta sede no cuenta con servicios configurados en su lista de precios. Debes configurar al menos un servicio en el panel de la sede para poder registrar turnos.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Servicio del Local *</label>
                                <select
                                    value={selectedServiceId}
                                    onChange={e => setSelectedServiceId(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-slate-700 cursor-pointer"
                                >
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} — S/ {s.price.toFixed(2)} ({s.duration} min)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Detalle de Costo</label>
                                <div className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 leading-none flex items-center justify-between">
                                    <span>Tarifa de servicio:</span>
                                    <span className="text-primary-700 font-black">S/ {services.find(s => s.id === selectedServiceId)?.price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {services.length > 0 && (
                        /* Blocked Calendar Duration Callout */
                        <div className="p-3 bg-primary-50 border border-primary-150 rounded-xl flex items-center justify-between text-xs text-primary-950 font-bold">
                            <span className="flex items-center gap-1.5">⏱️ Tiempo a bloquear en calendario:</span>
                            <span className="bg-primary-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black">{durationMins} minutos</span>
                        </div>
                    )}
                </div>

                {/* 4. Programación */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        ⏰ Horario y Programación
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 col-span-1 sm:col-span-2">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Fecha de Atención</label>
                            <input
                                type="date"
                                required
                                min={(() => {
                                    const selectedEstObj = establishments.find(e => e.id === selectedEstId)
                                    const currentTz = getTimezoneByCountry(selectedEstObj?.country || 'PE')
                                    return getLocalLocalDateString(undefined, currentTz)
                                })()}
                                value={scheduledDate}
                                onChange={e => {
                                    setScheduledDate(e.target.value);
                                    // Si la fecha cambia y ya no es hoy, forzar a seleccionar un slot (future)
                                    if (e.target.value !== getPeruLocalDateString() && scheduleType === 'immediate') {
                                        setScheduleType('future');
                                        setScheduledTime('08:00');
                                    }
                                }}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Unified Slots Preview & Grid Selector */}
                    <div className="space-y-4 bg-slate-50/50 p-5 border border-slate-100 rounded-2xl">
                        {/* ⚡ Immediate Queue Button (Only for today) */}
                        {scheduledDate === getPeruLocalDateString() && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                    Atención Inmediata para Hoy
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setScheduleType('immediate');
                                        setScheduledTime('');
                                    }}
                                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                                        scheduleType === 'immediate'
                                            ? 'bg-primary-600 border-primary-650 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-primary-700 hover:bg-primary-50/20'
                                    }`}
                                >
                                    ⚡ Registrar Atención Inmediata (Ingresar a la Sala de Espera)
                                </button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                O selecciona un horario programado
                            </label>
                            {loadingSlots ? (
                                <div className="flex items-center gap-2 py-2 text-xs text-slate-550">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                                    <span>Consultando disponibilidad de la sede...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {/* Slots List */}
                                    {generateSlots().map(slot => {
                                        const past = isSlotPast(slot);
                                        const occupied = isSlotOccupied(slot);
                                        const isSelected = scheduleType === 'future' && scheduledTime === slot;

                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                disabled={past}
                                                onClick={() => {
                                                    setScheduleType('future');
                                                    setScheduledTime(slot);
                                                }}
                                                className={`h-11 rounded-xl text-xs font-bold border text-center transition-all active:scale-95 flex items-center justify-center gap-1 ${
                                                    isSelected
                                                        ? occupied
                                                            ? 'bg-amber-600 border-amber-600 text-white font-extrabold shadow-sm'
                                                            : 'bg-primary-600 border-primary-600 text-white font-extrabold shadow-sm'
                                                        : past
                                                            ? 'bg-slate-100 border-slate-150 text-slate-350 cursor-not-allowed line-through'
                                                            : occupied
                                                                ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-400'
                                                                : 'bg-white border-slate-200 text-slate-700 hover:border-primary-400 hover:bg-primary-50/20'
                                                }`}
                                            >
                                                <span>{slot}</span>
                                                {occupied && !past && (
                                                    <span className={`text-[10px] ml-1 font-bold ${
                                                        isSelected ? 'text-white' : 'text-amber-700'
                                                    }`}>
                                                        ●
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <p className="text-[9px] text-slate-400 leading-normal">
                            💡 Haz clic en <strong>⚡ Inmediato</strong> para ingresar hoy en la cola de la sala de espera. O haz clic en cualquier <strong>horario disponible</strong> para programar una cita para más tarde. Los horarios de cruce permiten sobre-reserva.
                        </p>
                    </div>

                    {/* Contextual Warning Boxes */}
                    {scheduleType === 'immediate' ? (
                        <div className="space-y-3">
                            {getUpcomingClientAlerts().length > 0 && (
                                <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 space-y-2.5 text-xs text-amber-900 leading-normal animate-in fade-in duration-300">
                                    <span className="font-extrabold text-amber-955 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                        ⚠️ Clientes agendados próximamente
                                    </span>
                                    <p className="opacity-90">
                                        Tienes reservas programadas para hoy que podrían cruzarse. Puedes agregar a este cliente presencial a la cola, pero ten en cuenta los siguientes turnos:
                                    </p>
                                    <div className="space-y-1.5 mt-1 font-semibold">
                                        {getUpcomingClientAlerts().map(apt => {
                                            const timeStr = new Date(apt.scheduledAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
                                            return (
                                                <div key={apt.id} className="flex justify-between items-center bg-white/70 border border-amber-100 rounded-lg px-2.5 py-1.5">
                                                    <span>🐕 {apt.pet?.name} (cliente: {apt.client?.fullName})</span>
                                                    <span className="text-amber-800 text-[10px] bg-amber-100 px-2 py-0.5 rounded font-black">
                                                        {apt.minutesDiff < 0 ? `Hace ${Math.abs(apt.minutesDiff)} min` : `En ${apt.minutesDiff} min`} ({timeStr})
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                💡 **Atención Inmediata:** El turno se creará para hoy. Aparecerá inmediatamente en tu **Sala de Espera** y podrás atenderlo cuando desees sin digitar código OTP de cliente.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {scheduledTime && isSlotOccupied(scheduledTime) && (
                                <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 space-y-2 text-xs text-amber-900 leading-normal animate-in fade-in duration-300">
                                    <span className="font-extrabold text-amber-955 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                        ⚠️ Aviso de Sobre-Reserva
                                    </span>
                                    <p className="opacity-90">
                                        El horario seleccionado (<strong>{scheduledTime}</strong>) ya tiene citas activas en el local. Puedes registrar el turno de todas formas si deseas forzar una sobre-reserva en este horario.
                                    </p>
                                </div>
                            )}
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                💡 **Cita Programada:** El turno se registrará para la fecha elegida (<strong>{scheduledDate} a las {scheduledTime}</strong>). Bloqueará tu calendario por un rango de {durationMins} minutos.
                            </p>
                        </div>
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
