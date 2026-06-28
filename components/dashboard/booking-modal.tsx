"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getUserPets, createAppointment, getProfile, bookWithCredits, updateProfile, simulateAppointmentPayment, updatePetInline, processPayment, getOccupiedSlots } from "@/lib/actions";
import { Clock, CheckCircle, PawPrint, DollarSign, ShieldCheck, AlertCircle, Phone, Check, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { Establishment } from "@/lib/types";
import { SPECIES_LABELS } from "@/lib/types";
import { formatPEN } from "@/lib/utils";
import { IzipayMock } from "@/components/ui/izipay-mock";

interface BookingModalProps {
    establishment: Establishment & { services?: any[], concurrentSlots?: number } | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BookingModal({ establishment, isOpen, onClose }: BookingModalProps) {
    const [step, setStep] = useState(1);
    const [pets, setPets] = useState<any[]>([]);
    const [clientProfile, setClientProfile] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(false);

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
    const [showIzipayMock, setShowIzipayMock] = useState(false);
    const [createdAppointmentId, setCreatedAppointmentId] = useState("");
    const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);

    // Inline pet edit states
    const [inlineWeight, setInlineWeight] = useState("");
    const [inlineBreed, setInlineBreed] = useState("");
    const [inlineSex, setInlineSex] = useState("unknown");
    const [inlineDob, setInlineDob] = useState("");
    const [inlineAllergies, setInlineAllergies] = useState("");
    const [inlineDistinctiveFeature, setInlineDistinctiveFeature] = useState("");
    const [inlineBehavior, setInlineBehavior] = useState("");
    const [savingInlinePet, setSavingInlinePet] = useState(false);
    const [showPetDetails, setShowPetDetails] = useState(false);

    useEffect(() => {
        setShowPetDetails(false);
        if (selectedPet) {
            const pet = pets.find(p => p.id === selectedPet);
            if (pet) {
                setInlineWeight(pet.weight?.toString() || "");
                setInlineBreed(pet.breed || "");
                setInlineSex(pet.sex || "unknown");
                setInlineDob(pet.dateOfBirth || "");
                setInlineAllergies(pet.allergies || "");
                setInlineDistinctiveFeature(pet.distinctiveFeature || "");
                setInlineBehavior(pet.behavior || "");
            }
        } else {
            setInlineWeight("");
            setInlineBreed("");
            setInlineSex("unknown");
            setInlineDob("");
            setInlineAllergies("");
            setInlineDistinctiveFeature("");
            setInlineBehavior("");
        }
    }, [selectedPet, pets]);

    const handleNextFromStep1 = async () => {
        if (!selectedPet) return;
        if (!showPetDetails) {
            setStep(2);
            return;
        }
        setSavingInlinePet(true);
        try {
            const res = await updatePetInline(selectedPet, {
                weight: inlineWeight ? parseFloat(inlineWeight) : null,
                breed: inlineBreed || null,
                sex: inlineSex || null,
                dateOfBirth: inlineDob || null,
                allergies: inlineAllergies || null,
                distinctiveFeature: inlineDistinctiveFeature || null,
                behavior: inlineBehavior || null,
            });
            if (res.success) {
                await loadData();
                setStep(2);
            } else {
                toast.error(res.message || "Error al actualizar la información de la mascota");
            }
        } catch (err) {
            toast.error("Error al actualizar la información de la mascota");
        } finally {
            setSavingInlinePet(false);
        }
    };

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
            setShowIzipayMock(false);
            setCreatedAppointmentId("");
            setShowPetDetails(false);
            setOccupiedSlots([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && establishment && selectedDay) {
            const fetchOccupied = async () => {
                try {
                    const occupied = await getOccupiedSlots(establishment.id, selectedDay);
                    setOccupiedSlots(occupied || []);
                } catch (err) {
                    console.error("Error al cargar horarios ocupados", err);
                }
            };
            fetchOccupied();
        } else {
            setOccupiedSlots([]);
        }
    }, [isOpen, establishment, selectedDay]);

    const loadData = async () => {
        setLoadingData(true);
        try {
            const p = await getUserPets();
            const profile = await getProfile();
            setPets(p);
            setClientProfile(profile);
            if (profile?.phone) {
                // Prefill digits by stripping +countrycode
                setPhoneInput(profile.phone.replace(/^\+\d+/, ""));
            }
        } catch (e) {
            console.error("Error al cargar datos iniciales del modal", e);
        } finally {
            setLoadingData(false);
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
                const petName = pets.find(p => p.id === selectedPet)?.name || 'tu mascota';
                const serviceNames = selectedServices.map(s => s.name).join(' + ');
                const formattedDate = new Date(`${selectedDay}T${selectedTime}`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });

                if (useCredits) {
                    // Procesar canje con créditos/Huellitas
                    const payResult = await bookWithCredits(res.appointmentId);
                    if (payResult.success) {
                        toast.success(
                            `🐾 ¡Turno confirmado en Brofy! ${petName} tiene cita para ${serviceNames} el ${formattedDate}. Tu código de verificación ya está disponible en "Mis Citas".`,
                            { duration: 6000 }
                        );
                        onClose();
                        window.location.href = '/dashboard/client/pending?status=success';
                    } else {
                        toast.error(payResult.message || "Error al procesar el canje de Huellitas");
                    }
                } else {
                    const payResult = await processPayment(res.appointmentId);
                    if (payResult.success && payResult.redirectUrl) {
                        if (payResult.redirectUrl.startsWith('/checkout/simulate-payment')) {
                            setCreatedAppointmentId(res.appointmentId);
                            setShowIzipayMock(true);
                        } else {
                            onClose();
                            window.location.href = payResult.redirectUrl;
                        }
                    } else {
                        toast.error(payResult.message || "Error al procesar el pago con Izipay");
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

        for (let mins = maxStartMins; mins + totalDuration <= minEndMins; mins += 30) {
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

    const isSlotBlocked = useCallback((slotStr: string) => {
        if (!selectedDay || selectedServices.length === 0) return false;

        const slotStart = new Date(`${selectedDay}T${slotStr}`).getTime();
        const slotEnd = slotStart + totalDuration * 60000;

        const concurrentSlots = establishment?.concurrentSlots || 1;
        let overlapCount = 0;

        for (const apt of occupiedSlots) {
            const aptStart = new Date(apt.scheduledAt).getTime();
            const aptEnd = aptStart + apt.duration * 60000;

            if (slotStart < aptEnd && slotEnd > aptStart) {
                overlapCount++;
            }
        }

        return overlapCount >= concurrentSlots;
    }, [selectedDay, selectedServices, totalDuration, establishment, occupiedSlots]);

    useEffect(() => {
        if (selectedTime && isSlotBlocked(selectedTime)) {
            setSelectedTime("");
        }
    }, [selectedServices, occupiedSlots, selectedTime, isSlotBlocked]);

    const hasEnoughCredits = clientProfile && clientProfile.creditBalance >= totalPlatformFee;

    const selectedPetObj = pets.find(p => p.id === selectedPet);
    const currentPetWeight = inlineWeight ? parseFloat(inlineWeight) : (selectedPetObj?.weight || 0);

    const getPetAgeInYears = (dobString?: string | null) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        if (isNaN(diffMs) || diffMs < 0) return null;
        return diffMs / (1000 * 60 * 60 * 24 * 365.25);
    };

    const formatAgeInYears = (yearsVal: number) => {
        if (yearsVal < 1) {
            const months = Math.round(yearsVal * 12);
            return `${months} ${months === 1 ? 'mes' : 'meses'}`;
        }
        const years = Math.floor(yearsVal);
        const months = Math.round((yearsVal - years) * 12);
        if (months === 0) {
            return `${years} ${years === 1 ? 'año' : 'años'}`;
        }
        return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
    };

    const petAgeInYears = selectedPetObj ? getPetAgeInYears(selectedPetObj.dateOfBirth) : null;

    const weightWarnings: string[] = [];
    const speciesWarnings: string[] = [];
    const breedWarnings: string[] = [];
    const ageWarnings: string[] = [];
    
    if (selectedPetObj) {
        selectedServices.forEach((svc: any) => {
            if (svc.isSpecific) {
                // 1. Species Restriction Check (split by comma)
                if (svc.specieRestriction) {
                    const allowedSpecies = svc.specieRestriction.split(',').filter(Boolean);
                    if (allowedSpecies.length > 0 && !allowedSpecies.includes(selectedPetObj.species)) {
                        const expectedLabels = allowedSpecies.map((s: string) => SPECIES_LABELS[s as keyof typeof SPECIES_LABELS] || s).join(', ');
                        const actualLabel = SPECIES_LABELS[selectedPetObj.species as keyof typeof SPECIES_LABELS] || selectedPetObj.species;
                        speciesWarnings.push(`El servicio "${svc.name}" es de uso exclusivo para: ${expectedLabels}, pero ${selectedPetObj.name} es un ${actualLabel}.`);
                    }
                }
                // 2. Weight Restriction Check
                if (currentPetWeight > 0) {
                    if (svc.minWeight !== null && currentPetWeight < svc.minWeight) {
                        weightWarnings.push(`"${svc.name}" requiere un peso mínimo de ${svc.minWeight}kg, pero tu mascota pesa ${currentPetWeight}kg.`);
                    }
                    if (svc.maxWeight !== null && currentPetWeight > svc.maxWeight) {
                        weightWarnings.push(`"${svc.name}" permite un peso máximo de ${svc.maxWeight}kg, pero tu mascota pesa ${currentPetWeight}kg.`);
                    }
                }
                // 3. Breed Restriction Check
                if (svc.breedRestriction) {
                    breedWarnings.push(`"${svc.name}" tiene restricción de raza: ${svc.breedRestriction}. (Tu mascota: ${selectedPetObj.breed || "No especificada"})`);
                }
                // 4. Age Restriction Check (numeric + optional note)
                if (petAgeInYears !== null) {
                    if (svc.minAge !== null && petAgeInYears < svc.minAge) {
                        ageWarnings.push(`"${svc.name}" requiere una edad mínima de ${formatAgeInYears(svc.minAge)}, pero tu mascota tiene ${formatAgeInYears(petAgeInYears)}.`);
                    }
                    if (svc.maxAge !== null && petAgeInYears > svc.maxAge) {
                        ageWarnings.push(`"${svc.name}" permite una edad máxima de ${formatAgeInYears(svc.maxAge)}, pero tu mascota tiene ${formatAgeInYears(petAgeInYears)}.`);
                    }
                } else if (!selectedPetObj.dateOfBirth && (svc.minAge !== null || svc.maxAge !== null)) {
                    ageWarnings.push(`"${svc.name}" requiere rango de edad (mín: ${svc.minAge !== null ? formatAgeInYears(svc.minAge) : '0'}, máx: ${svc.maxAge !== null ? formatAgeInYears(svc.maxAge) : '∞'}), pero tu mascota no tiene fecha de nacimiento registrada.`);
                }
                if (svc.ageRestriction) {
                    ageWarnings.push(`"${svc.name}" indica restricción de edad/nota: ${svc.ageRestriction}.`);
                }
            } else {
                // Fallback to name-based regex check for grooming/bath
                if (selectedPetObj.species === 'dog' && currentPetWeight > 0 && (svc.category === 'grooming' || svc.category === 'bath')) {
                    const check = checkWeightMismatch(currentPetWeight, svc.name);
                    if (check.mismatch) {
                        weightWarnings.push(`"${svc.name}" está recomendado para ${check.expectedRange}, pero tu mascota pesa ${currentPetWeight}kg.`);
                    }
                }
            }
        });
    }

    const hasMissingWeight = selectedPetObj && currentPetWeight === 0 && selectedServices.some(s => 
        (s.isSpecific && (s.minWeight !== null || s.maxWeight !== null)) ||
        (!s.isSpecific && selectedPetObj.species === 'dog' && (s.category === 'grooming' || s.category === 'bath'))
    );

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
                            {loadingData ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-3 w-full">
                                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                                    <p className="text-xs text-slate-500 font-medium">Cargando tus mascotas...</p>
                                </div>
                            ) : (
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
                            )}

                             {selectedPet && (
                                !showPetDetails ? (
                                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                                            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                                                <PawPrint className="w-4 h-4 text-primary-600" />
                                                <span>Datos registrados de {selectedPetObj?.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowPetDetails(true)}
                                                className="text-primary-600 hover:text-primary-700 text-xs font-bold transition-colors"
                                            >
                                                ✏️ Modificar datos
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600 font-medium">
                                            <div><span className="text-slate-400 font-normal font-sans">Peso:</span> {selectedPetObj?.weight ? `${selectedPetObj.weight} kg` : "No registrado"}</div>
                                            <div><span className="text-slate-400 font-normal font-sans">Raza:</span> {selectedPetObj?.breed || "No especificada"}</div>
                                            <div><span className="text-slate-400 font-normal font-sans">Sexo:</span> {selectedPetObj?.sex === 'male' ? '♂ Macho' : selectedPetObj?.sex === 'female' ? '♀ Hembra' : 'Desconocido'}</div>
                                            <div><span className="text-slate-400 font-normal font-sans">Edad:</span> {petAgeInYears !== null ? formatAgeInYears(petAgeInYears) : "No registrada"}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                                            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                                                <PawPrint className="w-4 h-4 text-primary-600" />
                                                <span>Modificar datos de {selectedPetObj?.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowPetDetails(false)}
                                                className="text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-400">Todos los campos son opcionales. Esto ayuda a calcular tarifas especiales.</p>
                                        
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 block">Peso (kg)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={inlineWeight}
                                                    onChange={e => setInlineWeight(e.target.value)}
                                                    placeholder="Ej: 8.5"
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 block">Raza</label>
                                                <input
                                                    type="text"
                                                    value={inlineBreed}
                                                    onChange={e => setInlineBreed(e.target.value)}
                                                    placeholder="Ej: Beagle"
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 block">Sexo</label>
                                                <select
                                                    value={inlineSex}
                                                    onChange={e => setInlineSex(e.target.value)}
                                                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 animate-in fade-in"
                                                >
                                                    <option value="unknown">Desconocido</option>
                                                    <option value="male">♂ Macho</option>
                                                    <option value="female">♀ Hembra</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 block">Fecha nacimiento</label>
                                                <input
                                                    type="date"
                                                    value={inlineDob}
                                                    onChange={e => setInlineDob(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 block">Seña física particular</label>
                                                <input
                                                    type="text"
                                                    value={inlineDistinctiveFeature}
                                                    onChange={e => setInlineDistinctiveFeature(e.target.value)}
                                                    placeholder="Ej: cicatriz en pata izquierda, mancha en oreja"
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 block">Conducta / Temperamento</label>
                                                <input
                                                    type="text"
                                                    value={inlineBehavior}
                                                    onChange={e => setInlineBehavior(e.target.value)}
                                                    placeholder="Ej: miedoso con ruidos, cariñoso, juguetón"
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 block">Alergias o condiciones médicas</label>
                                                <textarea
                                                    value={inlineAllergies}
                                                    onChange={e => setInlineAllergies(e.target.value)}
                                                    placeholder="Ej: alérgico a champú convencional, dermatitis en lomo"
                                                    rows={2}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
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
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-350 bg-white'}`}>
                                                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-slate-900 text-sm break-words leading-snug">{svc.name}</p>
                                                        {svc.description && (
                                                            <p className="text-xs text-slate-500 mt-0.5 break-words leading-relaxed">{svc.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
                                                                <Clock className="w-3 h-3" /> {svc.duration} min
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 ml-3 self-center">
                                                    <p className="font-bold text-emerald-700 text-base">{formatPEN(svc.price)}</p>
                                                    <p className="text-[10px] text-slate-400">precio servicio</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Dynamic Platform Fee Summary */}
                            {selectedServices.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 animate-in fade-in">
                                    <div className="flex justify-between text-xs text-slate-650">
                                        <span>Servicios seleccionados:</span>
                                        <strong className="text-slate-800">{selectedServices.length}</strong>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-650">
                                        <span>Suma total de servicios:</span>
                                        <strong className="text-emerald-700">{formatPEN(totalServicePrice)}</strong>
                                    </div>
                                    <div className="flex justify-between text-xs text-primary-700 font-semibold border-t border-slate-200/85 pt-1.5">
                                        <span className="flex items-center gap-1">Cargo de Plataforma (S/ 5 c/u):</span>
                                        <span>{formatPEN(totalPlatformFee)}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 text-center pt-1">
                                        +S/ 5.00 adicionales agregados por cada servicio extra seleccionado en el turno
                                    </p>
                                </div>
                            )}

                            {/* Warnings / restrictions for selected services */}
                            {speciesWarnings.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 space-y-1.5 animate-in fade-in">
                                    <p className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-red-650 shrink-0" />
                                        Incompatibilidad de Especie:
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {speciesWarnings.map((warning, i) => (
                                            <li key={i} className="text-[10px] text-red-800 font-medium leading-normal">
                                                {warning}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-[9px] text-red-650 font-medium leading-normal pt-1 border-t border-red-200">
                                        * Para continuar con la reserva, debes remover los servicios incompatibles o cambiar de mascota.
                                    </p>
                                </div>
                            )}

                            {(weightWarnings.length > 0 || breedWarnings.length > 0 || ageWarnings.length > 0) && (
                                <div className="bg-amber-50 border border-amber-250 rounded-2xl p-3.5 space-y-1.5 animate-in fade-in">
                                    <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                        Advertencia de Restricciones del Servicio:
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {weightWarnings.map((warning, i) => (
                                            <li key={`w-${i}`} className="text-[10px] text-amber-800 font-medium leading-normal">
                                                {warning}
                                            </li>
                                        ))}
                                        {breedWarnings.map((warning, i) => (
                                            <li key={`b-${i}`} className="text-[10px] text-amber-800 font-medium leading-normal">
                                                {warning}
                                            </li>
                                        ))}
                                        {ageWarnings.map((warning, i) => (
                                            <li key={`a-${i}`} className="text-[10px] text-amber-800 font-medium leading-normal">
                                                {warning}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-[9px] text-amber-650 font-medium leading-normal pt-1 border-t border-amber-200">
                                        * El establecimiento podría reajustar la tarifa o solicitar reprogramación en sede si los datos físicos no coinciden al momento de la atención.
                                    </p>
                                </div>
                            )}

                            {hasMissingWeight && (
                                <div className="bg-slate-50 border border-slate-200 p-3.5 space-y-1 animate-in fade-in rounded-2xl">
                                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                        Mascota sin peso registrado:
                                    </p>
                                    <p className="text-[10px] text-slate-600 leading-normal">
                                        No has registrado el peso de tu mascota. Te sugerimos indicarlo en el paso anterior para que el veterinario conozca mejor su perfil antes de la cita.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-2xl p-3 mt-2">
                                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    El valor del servicio se abona directamente al local. El paso final cobra únicamente el acceso a la plataforma Brofy (código de verificación y carnet digital).
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
                                    <p className="font-semibold text-primary-900 text-sm break-words leading-snug">
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
                                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                                        {buildSlots().map(slot => {
                                            const blocked = isSlotBlocked(slot);
                                            return (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    disabled={blocked}
                                                    onClick={() => setSelectedTime(slot)}
                                                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                                                        blocked 
                                                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                                                            : selectedTime === slot 
                                                                ? 'bg-primary-600 text-white border-primary-600' 
                                                                : 'bg-white border-slate-200 text-slate-700 hover:border-primary-300'
                                                    }`}
                                                    title={blocked ? "Horario ocupado o capacidad máxima alcanzada" : undefined}
                                                >
                                                    {slot}
                                                </button>
                                            );
                                        })}
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
                        showIzipayMock ? (
                            <div className="py-2">
                                <IzipayMock
                                    amount={totalPlatformFee}
                                    description={`Reserva de Turno: ${selectedServices.map(s => s.name).join(' + ')}`}
                                    buttonText="Pagar con Tarjeta"
                                    onCancel={() => {
                                        setShowIzipayMock(false);
                                    }}
                                    onSuccess={async () => {
                                        if (!createdAppointmentId) return;
                                        try {
                                            const payResult = await simulateAppointmentPayment(createdAppointmentId);
                                            if (payResult.success) {
                                                const petName = pets.find(p => p.id === selectedPet)?.name || 'tu mascota';
                                                const serviceNames = selectedServices.map(s => s.name).join(' + ');
                                                const formattedDate = new Date(`${selectedDay}T${selectedTime}`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });
                                                toast.success(
                                                    `🐾 ¡Turno confirmado en Brofy! ${petName} tiene cita para ${serviceNames} el ${formattedDate}. Tu código de verificación ya está disponible en "Mis Citas".`,
                                                    { duration: 6000 }
                                                );
                                                onClose();
                                                window.location.href = '/dashboard/client/pending?status=success';
                                            } else {
                                                toast.error("Error al procesar el pago");
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            toast.error("Error al procesar el pago");
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Summary */}
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-sm animate-in fade-in">
                                    <p className="font-semibold text-slate-900">{establishment?.name}</p>
                                    <div className="flex justify-between gap-4 text-slate-650 text-xs items-start">
                                        <span className="shrink-0">Servicios ({selectedServices.length})</span>
                                        <span className="font-medium text-right break-words max-w-[70%]" title={selectedServices.map(s => s.name).join(" + ")}>
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
                                    {selectedServices.some(s => s.category === 'grooming' || s.category === 'bath') && (
                                        <p className="text-[10px] text-slate-400 font-medium leading-normal mt-1.5 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                            ℹ️ <strong>Nota de tarifa variable:</strong> Para servicios de estética y baño, el precio final a abonar en sede podría ser reajustado por el local de acuerdo al tamaño, peso y condición de pelaje real de tu mascota.
                                        </p>
                                    )}

                                    {/* Warnings / restrictions summary */}
                                    {(weightWarnings.length > 0 || breedWarnings.length > 0 || ageWarnings.length > 0) && (
                                        <div className="bg-amber-50 border border-amber-250 rounded-2xl p-3.5 mt-2 space-y-1.5 animate-in fade-in">
                                            <p className="text-[10px] font-bold text-amber-950 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-650" />
                                                Advertencia de Restricciones
                                            </p>
                                            <ul className="list-disc pl-3.5 space-y-0.5">
                                                {weightWarnings.map((warning, i) => (
                                                    <li key={`w-${i}`} className="text-[9px] text-amber-800 leading-normal font-medium">
                                                        {warning}
                                                    </li>
                                                ))}
                                                {breedWarnings.map((warning, i) => (
                                                    <li key={`b-${i}`} className="text-[9px] text-amber-800 leading-normal font-medium">
                                                        {warning}
                                                    </li>
                                                ))}
                                                {ageWarnings.map((warning, i) => (
                                                    <li key={`a-${i}`} className="text-[9px] text-amber-800 leading-normal font-medium">
                                                        {warning}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {hasMissingWeight && (
                                        <div className="bg-amber-50 border border-amber-250 rounded-2xl p-3 mt-2">
                                            <p className="text-[10px] font-bold text-amber-950 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                                Mascota sin peso registrado
                                            </p>
                                            <p className="text-[9px] text-amber-800 leading-normal mt-0.5">
                                                Recuerda que el local podría reajustar la tarifa al verificar el peso real de {selectedPetObj?.name} en la cita presencial.
                                            </p>
                                        </div>
                                    )}

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
                        )
                    )}
                </div>

                {step <= 4 && !showIzipayMock && (
                    <DialogFooter className="flex justify-between sm:justify-between gap-2 border-t border-slate-100 pt-3">
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-semibold">
                                ← Atrás
                            </button>
                        ) : <div />}

                        {step === 1 && (
                            <button
                                type="button"
                                onClick={handleNextFromStep1}
                                disabled={!selectedPet || savingInlinePet}
                                className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-md shadow-primary-100 flex items-center gap-1.5"
                            >
                                {savingInlinePet ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    showPetDetails ? "Guardar y Continuar →" : "Siguiente →"
                                )}
                            </button>
                        )}
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                disabled={selectedServices.length === 0 || speciesWarnings.length > 0}
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

function checkWeightMismatch(petWeight: number, serviceName: string): { mismatch: boolean; expectedRange?: string } {
    const name = serviceName.toLowerCase();
    
    // 1. Check numeric ranges
    // Pattern: "XX-YY kg" or "XX a YY kg"
    const rangeRegex = /(\d+(?:\.\d+)?)\s*(?:-|a|to)\s*(\d+(?:\.\d+)?)\s*(?:kg|kilos)/i;
    const rangeMatch = name.match(rangeRegex);
    if (rangeMatch) {
        const min = parseFloat(rangeMatch[1]);
        const max = parseFloat(rangeMatch[2]);
        if (petWeight < min || petWeight > max) {
            return { mismatch: true, expectedRange: `${min}kg a ${max}kg` };
        }
        return { mismatch: false };
    }

    // Pattern: "hasta XX kg" or "<= XX kg" or "< XX kg"
    const maxRegex = /(?:hasta|under|less than|<=|<)\s*(\d+(?:\.\d+)?)\s*(?:kg|kilos)/i;
    const maxMatch = name.match(maxRegex);
    if (maxMatch) {
        const max = parseFloat(maxMatch[1]);
        if (petWeight > max) {
            return { mismatch: true, expectedRange: `hasta ${max}kg` };
        }
        return { mismatch: false };
    }

    // Pattern: "más de XX kg" or "desde XX kg" or ">= XX kg" or "> XX kg"
    const minRegex = /(?:más de|desde|over|greater than|>=|>)\s*(\d+(?:\.\d+)?)\s*(?:kg|kilos)/i;
    const minMatch = name.match(minRegex);
    if (minMatch) {
        const min = parseFloat(minMatch[1]);
        if (petWeight < min) {
            return { mismatch: true, expectedRange: `más de ${min}kg` };
        }
        return { mismatch: false };
    }

    // 2. Keyword weight classes fallback
    const isMiniOrSmall = name.includes('pequeñ') || name.includes('pequen') || name.includes('mini') || name.includes('small');
    const isMedium = name.includes('median') || name.includes('medium');
    const isLarge = name.includes('grand') || name.includes('large');
    const isGiant = name.includes('gigant') || name.includes('giant');

    if (isMiniOrSmall && petWeight > 10) {
        return { mismatch: true, expectedRange: 'hasta 10kg (Pequeño/Mini)' };
    }
    if (isMedium && (petWeight <= 10 || petWeight > 25)) {
        return { mismatch: true, expectedRange: '10kg a 25kg (Mediano)' };
    }
    if (isLarge && (petWeight <= 25 || petWeight > 45)) {
        return { mismatch: true, expectedRange: '25kg a 45kg (Grande)' };
    }
    if (isGiant && petWeight <= 45) {
        return { mismatch: true, expectedRange: 'más de 45kg (Gigante)' };
    }

    return { mismatch: false };
}