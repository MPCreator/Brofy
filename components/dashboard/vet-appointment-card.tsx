"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { proposeReschedule } from "@/lib/actions";
import { toast } from "sonner";
import { Calendar, Phone, Check, Clock, Edit, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { PetProfileModal } from "./PetProfileModal";

export function VetAppointmentCard({ apt, onRefresh }: { apt: any; onRefresh?: () => void }) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPetModal, setShowPetModal] = useState(false);

    const handleReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDate || !newTime) {
            toast.error("Por favor selecciona una fecha y hora válidas");
            return;
        }

        setLoading(true);
        try {
            const fullDate = `${newDate}T${newTime}`;
            const res = await proposeReschedule(apt.id, fullDate, notes);
            if (res.success) {
                toast.success("Propuesta de reprogramación enviada al cliente con éxito (sin costo de plataforma).");
                setShowModal(false);
                router.refresh();
                if (onRefresh) onRefresh();
            } else {
                toast.error(res.message || "Error al proponer reprogramación");
            }
        } catch (e) {
            toast.error("Error de conexión");
        }
        setLoading(false);
    };

    // Determinar si la cita fue completada en las últimas 24 horas para permitir edición (Req 13)
    const isCompleted = apt.status === "completed";
    const completedAt = apt.completedAt ? new Date(apt.completedAt) : null;
    const hoursSinceCompletion = completedAt ? (Date.now() - completedAt.getTime()) / (1000 * 60 * 60) : 999;
    const isEditable = isCompleted && hoursSinceCompletion < 24;

    const formattedDate = apt.scheduledAt 
        ? new Date(apt.scheduledAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })
        : "Sin programar";

    const formattedTime = apt.scheduledAt
        ? new Date(apt.scheduledAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
        : "";

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary-200 transition-all">
            {/* Left side: Date indicator */}
            <div className="flex items-center gap-4 min-w-0">
                <div className="text-center px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl min-w-[70px]">
                    <div className="text-[10px] font-extrabold text-primary-600 uppercase tracking-wider">
                        {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString("es-PE", { month: "short" }) : "Turno"}
                    </div>
                    <div className="text-xl font-black text-slate-800">
                        {apt.scheduledAt ? new Date(apt.scheduledAt).getDate() : "—"}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                        {formattedTime}
                    </div>
                </div>

                {/* Patient / Client / Service info */}
                <div className="space-y-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm flex flex-wrap items-center gap-1">
                        <span>{apt.client?.fullName || "Cliente"}</span>
                        <span className="text-slate-400 font-normal">con</span>
                        {apt.pet ? (
                            <button
                                type="button"
                                onClick={() => setShowPetModal(true)}
                                className="text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2.5 py-0.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors border border-primary-100"
                                title="Ver Ficha Completa del Paciente"
                            >
                                🐶 {apt.pet.name}
                            </button>
                        ) : (
                            <span className="text-slate-400 text-xs">Mascota</span>
                        )}
                    </p>
                    <div className="flex items-center gap-2 max-w-full">
                        <span 
                            className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium truncate max-w-[180px] sm:max-w-[280px]"
                            title={apt.serviceType}
                        >
                            {apt.serviceType}
                        </span>
                        {apt.notes && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md truncate max-w-[180px]" title={apt.notes}>
                                {apt.notes}
                            </span>
                        )}
                    </div>

                    {/* Req 7: Proveedores tienen acceso obligatorio al teléfono */}
                    {apt.client?.phone ? (
                        <a 
                            href={`tel:${apt.client.phone}`} 
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors mt-0.5"
                        >
                            <Phone className="w-3 h-3 fill-emerald-50" /> {apt.client.phone}
                        </a>
                    ) : (
                        <p className="text-xs text-red-500 font-medium mt-0.5">⚠️ Cliente sin teléfono registrado</p>
                    )}
                </div>
            </div>

            {/* Right side: Action triggers */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                {apt.pet && (
                    <button
                        type="button"
                        onClick={() => setShowPetModal(true)}
                        className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 transition-colors border border-primary-200/60 active:scale-[0.98]"
                    >
                        🔎 Ver Ficha
                    </button>
                )}

                {apt.rescheduledAt && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1 border border-blue-200">
                        <Clock className="w-3 h-3" /> Reprog. Propuesta
                    </span>
                )}

                {isEditable && (
                    <Link
                        href={`/dashboard/vet/fast-entry?appointmentId=${apt.id}`}
                        className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-md shadow-violet-100 active:scale-[0.98]"
                    >
                        <Edit className="w-3 h-3" /> Editar Ficha (24h)
                    </Link>
                )}

                {(apt.status === "confirmed" || apt.status === "paid") && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> {apt.status === "paid" ? "Pagada / Lista" : "Confirmada"}
                    </span>
                )}

                {/* Reprogramar Trigger */}
                {apt.status !== "completed" && apt.status !== "cancelled" && apt.status !== "validated" && !apt.rescheduledAt && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200/60"
                    >
                        Reprogramar Turno
                    </button>
                )}
            </div>

            {/* Rescheduling Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <form onSubmit={handleReschedule} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="font-black text-slate-900 text-base flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-primary-500" /> Proponer Reprogramación
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-primary-50 text-primary-950 border border-primary-200 p-3 rounded-2xl text-[10px] leading-relaxed">
                            💡 **Sin Cargos de Brofy:** Esta reprogramación se gestiona de forma directa con el cliente. No se realizarán cobros adicionales en su tarjeta.
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Nueva Fecha</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Nueva Hora</label>
                                <input
                                    type="time"
                                    required
                                    value={newTime}
                                    onChange={e => setNewTime(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Motivo / Sugerencia (opcional)</label>
                                <textarea
                                    placeholder="Ej: Estimado, se nos cruzó una cirugía de emergencia. Le proponemos este horario..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 h-20 resize-none focus:outline-none text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-md"
                            >
                                {loading ? "Enviando..." : "Enviar Propuesta"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showPetModal && apt.pet && (
                <PetProfileModal
                    key={apt.pet.id}
                    pet={{
                        ...apt.pet,
                        owner: apt.client
                    }}
                    isOpen={true}
                    onClose={() => setShowPetModal(false)}
                />
            )}
        </div>
    );
}
