"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getUserPets, createAppointment, getProfile, bookWithCredits, updateProfile } from "@/lib/actions";
import { Clock, CheckCircle, PawPrint, DollarSign, ShieldCheck, AlertCircle, Phone, Check, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { Establishment } from "@/lib/types";
import { SPECIES_LABELS } from "@/lib/types";
import { formatPEN } from "@/lib/utils";

interface BookingModalProps {
    establishment: Establishment & { services?: any[] } | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BookingModal({ establishment, isOpen, onClose }: BookingModalProps) {
    const [step, setStep] = useState(1);
    const [pets, setPets] = useState<any[]>([]);
    const [clientProfile, setClientProfile] = useState<any>(null);

    // Selection state
    const [selectedPet, setSelectedPet] = useState<string | null>(null);
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Phone editing state in modal flow
    const [phoneCode, setPhoneCode] = useState("+51");
    const [phoneInput, setPhoneInput] = useState("");
    const [savingPhone, setSavingPhone] = useState(false);

    // Compute final date
    const date = selectedDay && selectedTime ? new Date(`${selectedDay}T${selectedTime}`).toISOString() : "";

    useEffect(() => {
        if (isOpen && establishment) {
            loadData();
            setStep(1);
            setSelectedPet(null);
            setSelectedServices([]);
            setSelectedDay("");
            setSelectedTime("");
            setNotes("");
            setPhoneInput("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, establishment]);

    const loadData = async () => {
        try {
            const [p, profile] = await Promise.all([
                getUserPets(),
                getProfile()
            ]);
            setPets(p);
            setClientProfile(profile);
            if (profile?.phone) {
                // Prefill digits by stripping +countrycode
                setPhoneInput(profile.phone.replace(/^\+\d+/, ""));
            }
        } catch (e) {
            console.error("Error al cargar datos iniciales del modal", e);
        }
    };

    const toggleService = (svc: any) => {
        if (selectedServices.find(s => s.id === svc.id)) {
            setSelectedServices(selectedServices.filter(s => s.id !== svc.id));
        } else {
            setSelectedServices([...selectedServices, svc]);
        }
    };

    const handleSavePhone = async () => {
        if (phoneInput.length < 9) {
            toast.error("El número de teléfono móvil debe tener al menos 9 dígitos");
            return false;
        }
        setSavingPhone(true);
        try {
            const fullPhone = `${phoneCode}${phoneInput}`;
            const formData = new FormData();
            formData.set("fullName", clientProfile?.fullName || "");
            formData.set("phone", fullPhone);

            const res = await updateProfile(formData);
            if (res.success) {
                setClientProfile({ ...clientProfile, phone: fullPhone });
                toast.success("Teléfono registrado correctamente");
                setSavingPhone(false);
                return true;
            } else {
                toast.error("Error al registrar el teléfono");
            }
        } catch (e) {
            toast.error("Error de conexión al guardar el teléfono");
        }
        setSavingPhone(false);
        return false;
    };

    const handleBook = async (paymentMethod?: 'credits' | 'izipay') => {
        if (!selectedPet || !date || !establishment || selectedServices.length === 0) return;

        // Si no tiene teléfono en el perfil, exigir guardarlo primero
        if (!clientProfile?.phone) {
            const saved = await handleSavePhone();
            if (!saved) return;
        }

        setIsLoading(true);
        try {
            // Req 3: Crear cita pasando array de serviceIds
            const res = await createAppointment({
                petId: selectedPet,
                establishmentId: establishment.id,
                providerId: establishment.ownerId,
                serviceIds: selectedServices.map(s => s.id),
                commissionType: 'booking',
                scheduledAt: date,
                notes,
            });

            if (res.success && res.appointmentId) {
                const totalCommission = 5.00 * selectedServices.length;
                const hasCredits = clientProfile && clientProfile.creditBalance >= totalCommission;
                
                const useCredits = paymentMethod === 'credits' || (!paymentMethod && hasCredits);

                if (useCredits) {
                    // Procesar canje con créditos/Huellitas
                    const payResult = await bookWithCredits(res.appointmentId);
                    if (payResult.success) {
                        toast.success("¡Turno confirmado y canjeado con tus Huellitas! Tu código de atención ya está disponible.");
                        onClose();
                    } else {
                        toast.error(payResult.message || "Error al procesar el canje de Huellitas");
                    }
                } else {
                    // Si no tiene créditos, procesar vía pasarela (Izipay)
                    const { processPayment } = await import('@/lib/actions');
                    const payResult = await processPayment(res.appointmentId);
                    if (payResult.success && payResult.redirectUrl) {
                        toast.info("Redirigiendo a pasarela de pago segura...");
                        window.location.href = payResult.redirectUrl;
                    } else {
                        toast.error(payResult.message || "Error al procesar el pago");
                    }
                }
            } else {
                toast.error(res.error || "Error al solicitar el turno");
            }
        } catch (e: any) {
            toast.error(e.message || "Error de conexión. Intenta de nuevo.");
        }
        setIsLoading(false);
    };

    const getAvailabilityWarning = () => {
        if (!selectedDay || selectedServices.length === 0) return null;

        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayLabels: Record<string, string> = { 
            mon: 'Lunes', 
            tue: 'Martes', 
            wed: 'Miércoles', 
            thu: 'Jueves', 
            fri: 'Viernes', 
            sat: 'Sábado', 
            sun: 'Domingo' 
        };
        
        // Correct date timezone shifts by appending time part
        const dateObj = new Date(`${selectedDay}T00:00:00`);
        const dayOfWeek = dayNames[dateObj.getDay()];

        // Check if date is blocked/holiday for establishment
        let isHoliday = false;
        try {
            const blocked = typeof establishment?.blockedDates === 'string'
                ? JSON.parse(establishment.blockedDates)
                : (establishment?.blockedDates || []);
            if (Array.isArray(blocked) && blocked.includes(selectedDay)) {
                isHoliday = true;
            }
        } catch {}

        for (const svc of selectedServices) {
            let opDays: string[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
            try {
                if (svc.operatingDays) {
                    opDays = JSON.parse(svc.operatingDays);
                }
            } catch {}

            const dayNameEsp = dayLabels[dayOfWeek] || dayOfWeek;

            if (!opDays.includes(dayOfWeek)) {
                return `El servicio "${svc.name}" no se atiende los días ${dayNameEsp}.`;
            }

            if (isHoliday && !svc.workOnHolidays) {
                return `El establecimiento estará cerrado por feriado o día festivo esta fecha y el servicio "${svc.name}" no está disponible.`;
            }
        }

        // Check if hours overlap
        let estStart = 0;
        let estEnd = 24 * 60;
        try {
            const estHours = typeof establishment?.operatingHours === 'string'
                ? JSON.parse(establishment.operatingHours)
                : establishment?.operatingHours;
            if (estHours && !estHours.is24h) {
                const openTime = estHours.openTime || '09:00';
                const closeTime = estHours.closeTime || '18:00';
                const [oh, om] = openTime.split(':').map(Number);
                const [ch, cm] = closeTime.split(':').map(Number);
                estStart = oh * 60 + om;
                estEnd = ch * 60 + cm;
            }
        } catch {}

        let maxStartMins = estStart;
        let minEndMins = estEnd;

        for (const svc of selectedServices) {
            try {
                const hours = JSON.parse(svc.operatingHours || '{}');
                const start = hours.start || '08:00';
                const end = hours.end || '20:00';
                const [sh, sm] = start.split(':').map(Number);
                const [eh, em] = end.split(':').map(Number);
                maxStartMins = Math.max(maxStartMins, sh * 60 + sm);
                minEndMins = Math.min(minEndMins, eh * 60 + em);
            } catch {}
        }

        if (maxStartMins >= minEndMins) {
            return "No hay rango horario coincidente entre los servicios seleccionados y las horas del local.";
        }

        const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration || 30), 0) || 30;
        if (maxStartMins + totalDuration > minEndMins) {
            return `El rango de horas disponible en este día es insuficiente para la duración total de los servicios (${totalDuration} min).`;
        }

        return null;
    };

    // Build time slots based on total sum of service durations and intersected schedules
    const buildSlots = () => {
        if (selectedServices.length === 0 || !selectedDay) return [];
        if (getAvailabilityWarning() !== null) return [];

        let estStart = 0;
        let estEnd = 24 * 60;

        try {
            const estHours = typeof establishment?.operatingHours === 'string'
                ? JSON.parse(establishment.operatingHours)
                : establishment?.operatingHours;
            if (estHours && !estHours.is24h) {
                const openTime = estHours.openTime || '09:00';
                const closeTime = estHours.closeTime || '18:00';
                const [oh, om] = openTime.split(':').map(Number);
                const [ch, cm] = closeTime.split(':').map(Number);
                estStart = oh * 60 + om;
                estEnd = ch * 60 + cm;
            }
        } catch {}

        let maxStartMins = estStart;
        let minEndMins = estEnd;

        for (const svc of selectedServices) {
            try {
                const hours = JSON.parse(svc.operatingHours || '{}');
                const start = hours.start || '08:00';
                const end = hours.end || '20:00';
                const [sh, sm] = start.split(':').map(Number);
                const [eh, em] = end.split(':').map(Number);
                maxStartMins = Math.max(maxStartMins, sh * 60 + sm);
                minEndMins = Math.min(minEndMins, eh * 60 + em);
            } catch {}
        }

        const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration || 30), 0) || 30;
        const slots: string[] = [];

        for (let mins = maxStartMins; mins + totalDuration <= minEndMins; mins += totalDuration) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
        return slots;
    };

    const services = establishment?.services?.filter(s => s.isActive !== false) || [];
    const totalServicePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration || 30), 0);
    const totalPlatformFee = 5.00 * selectedServices.length;

    // Verificar si el saldo de créditos cubre el acceso a la plataforma en Huellitas
    const hasEnoughCredits = clientProfile && clientProfile.creditBalance >= totalPlatformFee;

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white max-h-[90vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary-700">
                        {step === 1 && "1. Elige tu mascota"}
                        {step === 2 && "2. Selecciona servicios"}
                        {step === 3 && "3. Elige tu horario"}
                        {step === 4 && "4. Confirmación de Reserva"}
                        <span className="text-sm font-normal text-slate-400 ml-auto">Paso {step} de 4</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* Step 1: Pets */}
                    {step === 1 && (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500">¿Para cuál de tus mascotas es la atención?</p>
                            <div className="grid grid-cols-2 gap-3">
                                {pets.map(pet => (
                                    <button
                                        key={pet.id}
                                        onClick={() => setSelectedPet(pet.id)}
                                        className={`p-4 border-2 rounded-2xl text-left transition-all ${selectedPet === pet.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}
                                    >
                                        <div className="font-bold text-slate-800 flex items-center gap-2 truncate">
                                            <PawPrint className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            {pet.name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 capitalize truncate">{SPECIES_LABELS[pet.species as keyof typeof SPECIES_LABELS] || pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</div>
                                    </button>
                                ))}
                                {pets.length === 0 && (
                                    <div className="col-span-2 text-center py-6 text-slate-500 text-sm">
                                        <PawPrint className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        No tienes mascotas registradas. Agrega una desde tu perfil.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Multiple Service Selection */}
                    {step === 2 && (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                                Selecciona uno o más servicios que deseas reservar en <strong>{establishment?.name}</strong>:
                            </p>

                            {services.length === 0 ? (
                                <div className="text-center py-6 text-sm text-slate-500">
                                    <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    Este establecimiento aún no tiene servicios publicados.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {services.map((svc: any) => {
                                        const isSelected = selectedServices.some(s => s.id === svc.id);
                                        return (
                                            <button
                                                key={svc.id}
                                                type="button"
                                                onClick={() => toggleService(svc)}
                                                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all ${isSelected ? 'border-primary-500 bg-primary-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-350 bg-white'}`}>
                                                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">{svc.name}</p>
                                                        {svc.description && (
                                                            <p className="text-xs text-slate-500 mt-0.5">{svc.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                                <Clock className="w-3 h-3" /> {svc.duration} min
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 ml-3">
                                                    <p className="font-bold text-emerald-700 text-base">{formatPEN(svc.price)}</p>
                                                    <p className="text-[10px] text-slate-400">precio del servicio</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Dynamic Platform Fee Summary */}
                            {selectedServices.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 animate-in fade-in">
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Servicios seleccionados:</span>
                                        <strong className="text-slate-800">{selectedServices.length}</strong>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Suma total de servicios:</span>
                                        <strong className="text-emerald-700">{formatPEN(totalServicePrice)}</strong>
                                    </div>
                                    <div className="flex justify-between text-xs text-primary-700 font-semibold border-t border-slate-200/80 pt-1.5">
                                        <span className="flex items-center gap-1">Cargo de Plataforma (S/ 5 c/u):</span>
                                        <span>{formatPEN(totalPlatformFee)}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 text-center pt-1">
                                        +S/ 5.00 adicionales agregados por cada servicio extra seleccionado en el turno
                                    </p>
                                </div>
                            )}

                            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-2xl p-3 mt-2">
                                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    El valor del servicio se abona directamente al local. El paso final cobra únicamente el acceso a la plataforma Brofy (código de atención, validación y carnet digital).
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Date & Time + Mandatory Phone */}
                    {step === 3 && (
                        <div className="space-y-4">
                            {/* Summary bar */}
                            <div className="bg-primary-50 border border-primary-100 p-3.5 rounded-2xl flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-primary-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-primary-900 text-sm truncate">
                                        {selectedServices.map(s => s.name).join(" + ")}
                                    </p>
                                    <p className="text-xs text-primary-700 font-medium">
                                        {pets.find(p => p.id === selectedPet)?.name} · {totalDuration} min · {formatPEN(totalServicePrice)}
                                    </p>
                                </div>
                            </div>

                            {/* Req 7: In-flow Phone Registration if missing */}
                            {!clientProfile?.phone && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2.5 animate-in slide-in-from-top-2">
                                    <p className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                                        <Phone className="w-4 h-4 text-amber-600" /> Teléfono de Contacto Obligatorio
                                    </p>
                                    <p className="text-[10px] text-amber-800 leading-relaxed">
                                        Brofy y el veterinario requieren de forma obligatoria tu teléfono para poder coordinar detalles y verificar tu turno:
                                    </p>
                                    <div className="flex gap-2">
                                        <select
                                            value={phoneCode}
                                            onChange={e => setPhoneCode(e.target.value)}
                                            className="px-2.5 py-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium cursor-pointer focus:outline-none"
                                        >
                                            <option value="+51">🇵🇪 +51</option>
                                            <option value="+54">🇦🇷 +54</option>
                                            <option value="+56">🇨🇱 +56</option>
                                            <option value="+57">🇨🇴 +57</option>
                                            <option value="+52">🇲🇽 +52</option>
                                            <option value="+593">🇪🇨 +593</option>
                                        </select>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="999 999 999"
                                                value={phoneInput}
                                                onChange={e => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-amber-600 font-medium">* Se guardará permanentemente en tu perfil al confirmar</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Fecha</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    onChange={(e) => { setSelectedDay(e.target.value); setSelectedTime(""); }}
                                    min={new Date().toISOString().split('T')[0]}
                                    value={selectedDay}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Horario
                                    <span className="ml-2 text-xs text-slate-400 font-normal">
                                        (duración total de {totalDuration} min)
                                    </span>
                                </label>
                                {!selectedDay ? (
                                    <p className="text-sm text-slate-400 text-center py-2">Selecciona una fecha primero</p>
                                ) : getAvailabilityWarning() ? (
                                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 animate-in slide-in-from-top-1">
                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-950 leading-relaxed font-semibold">
                                            {getAvailabilityWarning()}
                                        </p>
                                    </div>
                                ) : buildSlots().length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-2">No hay horarios disponibles para esta fecha</p>
                                ) : (
                                    <div className="grid grid-cols-4 gap-2">
                                        {buildSlots().map(slot => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setSelectedTime(slot)}
                                                className={`py-2 text-xs font-bold rounded-xl border transition-all ${selectedTime === slot ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-slate-200 text-slate-700 hover:border-primary-300'}`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Notas para el local (opcional)</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-xl bg-white h-16 resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                                    placeholder="Síntomas previos, requerimientos especiales..."
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Real Platform Credits or Izipay */}
                    {step === 4 && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-sm animate-in fade-in">
                                <p className="font-semibold text-slate-900">{establishment?.name}</p>
                                <div className="flex justify-between text-slate-650 text-xs">
                                    <span>Servicios ({selectedServices.length})</span>
                                    <span className="font-medium truncate max-w-[200px]">
                                        {selectedServices.map(s => s.name).join(" + ")}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-650 text-xs">
                                    <span>Mascota</span>
                                    <span className="font-medium">{pets.find(p => p.id === selectedPet)?.name}</span>
                                </div>
                                <div className="flex justify-between text-slate-650 text-xs">
                                    <span>Horario</span>
                                    <span className="font-semibold text-slate-800">
                                        {selectedDay && new Date(`${selectedDay}T${selectedTime}`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} · {selectedTime} ({totalDuration} min)
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-650 text-xs pt-2 border-t border-slate-250/80">
                                    <span>Total servicios a abonar en sede:</span>
                                    <span className="font-bold text-emerald-700 text-sm">{formatPEN(totalServicePrice)}</span>
                                </div>
                                <div className="flex justify-between text-primary-800 text-xs font-semibold pt-1 border-t border-dashed border-slate-200">
                                    <span>Cargo plataforma Brofy:</span>
                                    <span className="font-bold text-primary-700 text-sm">{formatPEN(totalPlatformFee)}</span>
                                </div>
                            </div>

                            {/* Real Huellitas System Badge */}
                            {clientProfile && clientProfile.creditBalance > 0 && (
                                <div className="bg-primary-50 border border-primary-200 p-3.5 rounded-2xl flex items-start gap-2.5 animate-in slide-in-from-top-1">
                                    <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-primary-800">
                                        <p className="font-bold">Saldo: {(clientProfile.creditBalance * 100).toFixed(0)} Huellitas disponibles 🐾</p>
                                        <p className="mt-0.5 opacity-95">
                                            Tu saldo está guardado como **Huellitas** (puntos) para futuros beneficios de lealtad y devoluciones.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment execution buttons */}
                            {hasEnoughCredits ? (
                                <div className="space-y-3 pt-2 animate-in zoom-in-95">
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-650 space-y-1.5">
                                        <p>Tienes saldo suficiente de <strong>Huellitas</strong> para canjear esta reserva gratis, pero también puedes pagar con Izipay si lo deseas:</p>
                                        <p className="text-[10px] text-slate-400">Se descontarán <strong className="text-emerald-700 font-bold">{formatPEN(totalPlatformFee)}</strong> en Huellitas si canjeas.</p>
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        <button
                                            onClick={() => handleBook('credits')}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>🐾 Canjear con Huellitas (Gratis)</>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleBook('izipay')}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4.5 h-4.5" />
                                                    Pagar {formatPEN(totalPlatformFee)} con Izipay
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-2 animate-in zoom-in-95">
                                    <div className="bg-primary-50 border border-primary-100 rounded-2xl p-3.5 flex items-start gap-2">
                                        <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                                        <div className="text-xs text-primary-800 leading-relaxed">
                                            <strong>Acceso a Plataforma ({formatPEN(totalPlatformFee)}):</strong> Cubre la gestión multiservicios del turno, inmutabilidad de la tarifa y validación digital.
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleBook('izipay')}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-base transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                Pagar {formatPEN(totalPlatformFee)} con Izipay
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {step < 4 && (
                    <DialogFooter className="flex justify-between sm:justify-between gap-2 border-t border-slate-100 pt-3">
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-semibold">
                                ← Atrás
                            </button>
                        ) : <div />}

                        {step === 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!selectedPet}
                                className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-md shadow-primary-100"
                            >
                                Siguiente →
                            </button>
                        )}
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                disabled={selectedServices.length === 0}
                                className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-md shadow-primary-100"
                            >
                                Elegir Horario →
                            </button>
                        )}
                        {step === 3 && (
                            <button
                                type="button"
                                onClick={async () => {
                                    // Validar campos de teléfono antes de continuar si está vacío
                                    if (!clientProfile?.phone) {
                                        if (phoneInput.length < 9) {
                                            toast.error("Por favor registra un número de celular de 9 dígitos válido");
                                            return;
                                        }
                                        const saved = await handleSavePhone();
                                        if (!saved) return;
                                    }
                                    setStep(4);
                                }}
                                disabled={!date || (!clientProfile?.phone && phoneInput.length < 9) || savingPhone}
                                className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-100 text-sm font-bold"
                            >
                                {savingPhone ? "Guardando Teléfono..." : `Confirmar Turno → ${formatPEN(totalPlatformFee)}`}
                            </button>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}