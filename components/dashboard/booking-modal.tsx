"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getUserPets, createAppointment } from "@/lib/actions";
import { Clock, CheckCircle, PawPrint, DollarSign, ShieldCheck, AlertCircle } from "lucide-react";
import { IzipayMock } from "@/components/ui/izipay-mock";
import { toast } from "sonner";
import type { Establishment } from "@/lib/types";
import { formatPEN } from "@/lib/utils";

interface BookingModalProps {
    establishment: Establishment & { services?: any[] } | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BookingModal({ establishment, isOpen, onClose }: BookingModalProps) {
    const [step, setStep] = useState(1);
    const [pets, setPets] = useState<any[]>([]);

    // Selection state
    const [selectedPet, setSelectedPet] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Compute final date
    const date = selectedDay && selectedTime ? new Date(`${selectedDay}T${selectedTime}`).toISOString() : "";

    useEffect(() => {
        if (isOpen && establishment) {
            loadData();
            setStep(1);
            setSelectedPet(null);
            setSelectedService(null);
            setSelectedDay("");
            setSelectedTime("");
            setNotes("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, establishment]);

    const loadData = async () => {
        const p = await getUserPets();
        setPets(p);
    };

    const handleBook = async () => {
        if (!selectedPet || !date || !establishment) return;

        setIsLoading(true);
        try {
            const res = await createAppointment({
                petId: selectedPet,
                establishmentId: establishment.id,
                providerId: establishment.ownerId,
                serviceType: selectedService?.name || selectedService?.category || 'consultation',
                commissionType: 'booking',
                scheduledAt: date,
                notes,
            });

            if (res.success && res.appointmentId) {
                const { processPayment } = await import('@/lib/actions');
                const payResult = await processPayment(res.appointmentId);
                if (payResult.success) {
                    toast.success("¡Turno confirmado! Tu código de atención ya está disponible en tu panel.");
                    onClose();
                } else {
                    toast.error(payResult.message || "Error al procesar el pago");
                }
            } else {
                toast.error(res.error || "Error al solicitar el turno");
            }
        } catch (e) {
            toast.error("Error de conexión. Intenta de nuevo.");
        }
        setIsLoading(false);
    };

    // Build time slots based on service duration
    const buildSlots = () => {
        const duration = selectedService?.duration || 30;
        const slots: string[] = [];
        for (let h = 9; h < 19; h++) {
            for (let m = 0; m < 60; m += duration) {
                if (h === 18 && m > 0) break;
                slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
            }
        }
        return slots;
    };

    const services = establishment?.services?.filter(s => s.isActive !== false) || [];

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary-700">
                        {step === 1 && "1. Elige tu mascota"}
                        {step === 2 && "2. Selecciona el servicio"}
                        {step === 3 && "3. Elige tu horario"}
                        {step === 4 && "4. Acceso a plataforma"}
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
                                        className={`p-4 border-2 rounded-xl text-left transition-all ${selectedPet === pet.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}
                                    >
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            <PawPrint className="w-4 h-4 text-slate-400" />
                                            {pet.name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</div>
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

                    {/* Step 2: Service selection */}
                    {step === 2 && (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                                Selecciona el servicio que necesitas en <strong>{establishment?.name}</strong>:
                            </p>

                            {services.length === 0 ? (
                                <div className="text-center py-6 text-sm text-slate-500">
                                    <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    Este establecimiento aún no tiene servicios publicados.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {services.map((svc: any) => (
                                        <button
                                            key={svc.id}
                                            onClick={() => setSelectedService(svc)}
                                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all ${selectedService?.id === svc.id ? 'border-primary-500 bg-primary-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                        >
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
                                            <div className="text-right shrink-0 ml-3">
                                                <p className="font-bold text-emerald-700 text-base">{formatPEN(svc.price)}</p>
                                                <p className="text-[10px] text-slate-400">precio del servicio</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Legal clarification note */}
                            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
                                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    El precio del servicio se paga directamente al establecimiento. El paso final cobra <strong>S/ 5.00</strong> por el acceso a la plataforma Brofy (gestión digital del turno, verificación profesional y código de atención).
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Date & Time */}
                    {step === 3 && (
                        <div className="space-y-4">
                            {/* Summary bar */}
                            <div className="bg-primary-50 border border-primary-100 p-3 rounded-xl flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-primary-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-primary-900 text-sm truncate">{selectedService?.name}</p>
                                    <p className="text-xs text-primary-700">{pets.find(p => p.id === selectedPet)?.name} · {selectedService?.duration} min · {formatPEN(selectedService?.price || 0)}</p>
                                </div>
                            </div>

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
                                    {selectedService && (
                                        <span className="ml-2 text-xs text-slate-400 font-normal">
                                            (bloques de {selectedService.duration} min)
                                        </span>
                                    )}
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {!selectedDay ? (
                                        <p className="col-span-4 text-sm text-slate-400 text-center py-2">Selecciona una fecha primero</p>
                                    ) : buildSlots().map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedTime(slot)}
                                            className={`py-2 text-sm font-medium rounded-lg border transition-all ${selectedTime === slot ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-slate-200 text-slate-700 hover:border-primary-300'}`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Notas para el veterinario (opcional)</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-xl bg-white h-16 resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                                    placeholder="Síntomas previos, alergias conocidas..."
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Platform access payment */}
                    {step === 4 && (
                        <div className="space-y-4">
                            {/* Appointment summary */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-sm">
                                <p className="font-semibold text-slate-900">{establishment?.name}</p>
                                <div className="flex justify-between text-slate-600">
                                    <span>Servicio</span>
                                    <span className="font-medium">{selectedService?.name}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Mascota</span>
                                    <span className="font-medium">{pets.find(p => p.id === selectedPet)?.name}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Horario</span>
                                    <span className="font-medium">
                                        {selectedDay && new Date(`${selectedDay}T${selectedTime}`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} · {selectedTime}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                                    <span>Precio del servicio</span>
                                    <span className="font-bold text-emerald-700">{formatPEN(selectedService?.price || 0)}</span>
                                </div>
                                <p className="text-[10px] text-slate-400">El precio del servicio se abona directamente al establecimiento.</p>
                            </div>

                            <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 flex items-start gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-primary-800 leading-relaxed">
                                    <strong>Cargo por Acceso a Plataforma Brofy (S/ 5.00):</strong> Cubre la gestión digital de tu turno, verificación de habilitación profesional, almacenamiento del historial médico y generación de tu código de atención. Este cargo no constituye pago por el servicio veterinario.
                                </div>
                            </div>

                            <IzipayMock
                                amount={5.00}
                                description="Acceso a Plataforma Brofy — Gestión de Turno Digital"
                                onSuccess={handleBook}
                            />
                        </div>
                    )}
                </div>

                {step < 4 && (
                    <DialogFooter className="flex justify-between sm:justify-between gap-2">
                        {step > 1 ? (
                            <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm">
                                ← Atrás
                            </button>
                        ) : <div />}

                        {step === 1 && (
                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedPet}
                                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                            >
                                Siguiente →
                            </button>
                        )}
                        {step === 2 && (
                            <button
                                onClick={() => setStep(3)}
                                disabled={!selectedService}
                                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                            >
                                Elegir Horario →
                            </button>
                        )}
                        {step === 3 && (
                            <button
                                onClick={() => setStep(4)}
                                disabled={!date}
                                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 shadow-lg shadow-primary-200 text-sm font-semibold"
                            >
                                Continuar → S/ 5.00
                            </button>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
