"use client";

import { useState, useEffect } from "react";
import { getClientAppointments, getProfile, acceptReschedule, fileDenuncia, proposeReschedule, acceptPriceChange, cancelAppointmentWithRefund } from "@/lib/actions";
import { 
    Clock, Calendar, AlertTriangle, ShieldCheck, 
    MessageSquare, Check, X, RefreshCw, AlertCircle, Sparkles, Phone, Award, MapPin
} from "lucide-react";
import { toast } from "sonner";
import { formatPEN } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReviewForm } from "@/components/ui/review-form";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/types";

export default function ClientPendingPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Success State
    const [showSuccess, setShowSuccess] = useState(false);
    const [successApt, setSuccessApt] = useState<any>(null);

    // Denuncia state
    const [denouncingId, setDenouncingId] = useState<string | null>(null);
    const [denounceReason, setDenounceReason] = useState("");
    const [submittingDenounce, setSubmittingDenounce] = useState(false);

    // Counter-reschedule state
    const [reschedulingId, setReschedulingId] = useState<string | null>(null);
    const [counterDate, setCounterDate] = useState("");
    const [counterNotes, setCounterNotes] = useState("");
    const [submittingCounter, setSubmittingCounter] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const handleCounterReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reschedulingId || !counterDate) return;
        setSubmittingCounter(true);
        try {
            const res = await proposeReschedule(reschedulingId, counterDate, counterNotes);
            if (res.success) {
                toast.success("Contrapropuesta enviada con éxito.");
                setReschedulingId(null);
                setCounterDate("");
                setCounterNotes("");
                loadData();
            } else {
                toast.error(res.message || "Error al enviar la contrapropuesta.");
            }
        } catch (error) {
            toast.error("Error al procesar la reprogramación.");
        } finally {
            setSubmittingCounter(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [apts, prof] = await Promise.all([
                getClientAppointments(),
                getProfile()
            ]);
            setAppointments(apts);
            setProfile(prof);

            // Verificar si status === 'success' en la URL
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('status') === 'success') {
                const latestPaid = apts.find((a: any) => a.status === 'paid');
                if (latestPaid) {
                    setSuccessApt(latestPaid);
                    setShowSuccess(true);
                }
            }
        } catch (e) {
            toast.error("Error al cargar citas pendientes");
        } finally {
            setLoading(false);
        }
    };

    const buildGoogleCalendarUrl = (apt: any) => {
        if (!apt) return '';
        const title = encodeURIComponent(`Cita en ${apt.establishment?.name} | Brofy`);
        const startDate = new Date(apt.scheduledAt);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 mins
        const formatDateString = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const dates = `${formatDateString(startDate)}/${formatDateString(endDate)}`;
        const details = encodeURIComponent(`Servicio: ${apt.serviceType}\nMascota: ${apt.pet?.name}\nCódigo de Atención: ${apt.otpValidationCode}\nReserva gestionada por Brofy.`);
        const location = encodeURIComponent(apt.establishment?.address || '');
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    };

    const buildIcsDataUri = (apt: any) => {
        if (!apt) return '';
        const startDate = new Date(apt.scheduledAt);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
        const formatDateString = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `URL:${window.location.origin}`,
            `DTSTART:${formatDateString(startDate)}`,
            `DTEND:${formatDateString(endDate)}`,
            `SUMMARY:Cita en ${apt.establishment?.name} | Brofy`,
            `DESCRIPTION:Servicio: ${apt.serviceType}\\nMascota: ${apt.pet?.name}\\nCodigo de Atencion: ${apt.otpValidationCode}`,
            `LOCATION:${apt.establishment?.address || ''}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');
        
        return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    };

    const handleAcceptReschedule = async (aptId: string) => {
        try {
            const res = await acceptReschedule(aptId);
            if (res.success) {
                toast.success("¡Reprogramación aceptada con éxito! (Sin costos adicionales)");
                loadData();
            } else {
                toast.error(res.message || "Error al aceptar la reprogramación");
            }
        } catch (e) {
            toast.error("Error de conexión");
        }
    };

    const handleAcceptPriceChange = async (aptId: string) => {
        try {
            const res = await acceptPriceChange(aptId);
            if (res.success) {
                toast.success("¡Nueva tarifa aceptada exitosamente!");
                loadData();
            } else {
                toast.error(res.message || "Error al aceptar la tarifa");
            }
        } catch (e) {
            toast.error("Error de conexión");
        }
    };

    const handleCancelWithRefund = async (aptId: string) => {
        if (!confirm("¿Seguro que deseas cancelar esta cita con devolución total de tu comisión de reserva a tu Billetera de Huellitas?")) return;
        try {
            const res = await cancelAppointmentWithRefund(aptId);
            if (res.success) {
                toast.success("Cita cancelada. Comisión devuelta a tu Billetera de Huellitas 🐾");
                loadData();
            } else {
                toast.error(res.message || "Error al cancelar la cita");
            }
        } catch (e) {
            toast.error("Error de conexión");
        }
    };

    const handleDenounce = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!denouncingId || !denounceReason.trim()) return;

        setSubmittingDenounce(true);
        try {
            const res = await fileDenuncia(denouncingId, denounceReason);
            if (res.success) {
                toast.success(res.message || "Denuncia registrada y saldo acreditado.");
                setDenouncingId(null);
                setDenounceReason("");
                loadData();
            } else {
                toast.error(res.message || "Error al procesar la denuncia");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setSubmittingDenounce(false);
        }
    };

    // Filter appointments for pending states
    const activeAppointments = appointments.filter(apt => 
        apt.status === "pending" || 
        apt.status === "paid" || 
        apt.status === "confirmed" ||
        apt.status === "validated" ||
        (apt.rescheduledAt !== null && apt.status !== "completed" && apt.status !== "cancelled" && apt.status !== "disputed")
    );

    const historyAppointments = appointments.filter(apt =>
        apt.status === "completed" || 
        apt.status === "cancelled" || 
        apt.status === "disputed"
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mb-2" />
                <p className="text-xs">Cargando tus citas pendientes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-primary-600" />
                    Mis Citas e Historial
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Monitorea tus atenciones programadas, reprogramaciones y gestiona denuncias por inasistencia.
                </p>
            </div>

            {/* Credit Wallet Widget (Huellitas loyalty points program) */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
                <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 stroke-[2.5]" /> Billetera de Huellitas 🐾
                    </span>
                    <h2 className="text-2xl font-black">{(profile?.creditBalance ? (profile.creditBalance * 100) : 0).toFixed(0)} Huellitas</h2>
                    <p className="text-xs opacity-90">Puntos acumulados para recompensas y programa de lealtad</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 border border-white/20 text-center font-bold text-xs max-w-[130px] leading-relaxed">
                    ✨ Programa de Lealtad y Devoluciones
                </div>
            </div>

            {/* List */}
            {activeAppointments.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                    <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">Sin turnos pendientes</h2>
                    <p className="text-sm text-slate-500 mb-4">No tienes ninguna cita activa o reprogramación pendiente en este momento.</p>
                    <Link
                        href="/dashboard/discover"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                        Buscar veterinarias cercanas
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {activeAppointments.map((apt: any) => {
                        const isPaid = apt.status === "paid";
                        const isProposed = apt.rescheduledAt !== null && apt.rescheduleProposedBy !== null;
                        
                        // Permitir denuncia si la cita fue confirmada/pagada y ya pasó su horario con una tolerancia de 15 minutos
                        const appointmentTime = apt.scheduledAt ? new Date(apt.scheduledAt).getTime() : 0;
                        const TOLERANCE_MS = 15 * 60 * 1000; // 15 minutos de tolerancia
                        const isExpired = appointmentTime > 0 && (Date.now() - appointmentTime) >= TOLERANCE_MS;
                        const canClaim = (apt.status === "paid" || apt.status === "confirmed") && isExpired;

                        let bookedSvcs: any[] = [];
                        try {
                            bookedSvcs = JSON.parse(apt.bookedServices || "[]");
                        } catch {}

                        let hasPriceChange = false;
                        let originalTotal = 0;
                        let newTotal = 0;

                        bookedSvcs.forEach((s: any) => {
                            originalTotal += s.price;
                            const master = apt.establishment?.services?.find((m: any) => m.id === s.id);
                            if (master) {
                                newTotal += master.price;
                                if (master.price !== s.price) {
                                    hasPriceChange = true;
                                }
                            } else {
                                newTotal += s.price;
                            }
                        });

                        return (
                            <div 
                                key={apt.id} 
                                className={`bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 hover:border-primary-100 transition-all ${
                                    isProposed ? "border-amber-200 ring-2 ring-amber-100" : ""
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-base">{apt.establishment?.name}</h3>
                                        <p className="text-xs text-slate-500 font-semibold capitalize mt-0.5">
                                            🐶 {apt.pet?.name} · {apt.serviceType}
                                        </p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Sin hora"}
                                        </p>
                                        {apt.establishment?.address && (
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${apt.establishment.latitude && apt.establishment.longitude ? `${apt.establishment.latitude},${apt.establishment.longitude}` : encodeURIComponent(`${apt.establishment.name}, ${apt.establishment.address}, ${apt.establishment.city || 'Lima'}`)}`}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary-600 hover:text-primary-750 flex items-center gap-1 mt-1.5 font-semibold hover:underline"
                                            >
                                                <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                                <span className="truncate max-w-[280px]">
                                                    {apt.establishment.address} {apt.establishment.district ? `(${apt.establishment.district})` : ''}
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                                        isProposed ? "bg-amber-100 text-amber-800" : isPaid ? "bg-primary-100 text-primary-800" : "bg-slate-100 text-slate-650"
                                    }`}>
                                        {isProposed ? "Reprogramación propuesta" : isPaid ? "Turno Pagado" : "Pendiente de Pago"}
                                    </span>
                                </div>

                                {hasPriceChange && (
                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3 animate-in">
                                        <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4 text-amber-600" /> Cambio de tarifa anunciado:
                                        </p>
                                        <div className="text-xs text-slate-700 leading-normal space-y-1">
                                            <p>El establecimiento actualizó los precios de los servicios contratados. El precio original reservado era de <strong>{formatPEN(originalTotal)}</strong>, pero la tarifa vigente es de <strong>{formatPEN(newTotal)}</strong>.</p>
                                            <p className="text-amber-800 font-medium">Puedes aceptar el nuevo precio para continuar con la reserva, o cancelarla con devolución inmediata del 100% de la comisión de acceso a tu Billetera de Huellitas.</p>
                                        </div>
                                        <div className="flex gap-2 pt-1.5">
                                            <button
                                                onClick={() => handleAcceptPriceChange(apt.id)}
                                                className="flex-1 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                                            >
                                                Aceptar Nueva Tarifa
                                            </button>
                                            <button
                                                onClick={() => handleCancelWithRefund(apt.id)}
                                                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 text-red-650 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
                                            >
                                                Cancelar con Reembolso
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Active OTP Attention Code Widget */}
                                {isPaid && apt.otpValidationCode && (
                                    <div className="bg-primary-600 text-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
                                        <div>
                                            <p className="text-xs text-primary-200 font-semibold">Tu Código de Atención</p>
                                            <p className="text-[10px] text-primary-300">Muéstraselo al veterinario al llegar</p>
                                        </div>
                                        <span className="font-mono text-2xl font-black tracking-[0.3em] bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                                            {apt.otpValidationCode}
                                        </span>
                                    </div>
                                )}

                                {/* Vet Proposed Rescheduling Section */}
                                {isProposed && (
                                    <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                                        <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-amber-600" /> El establecimiento propone reprogramar:
                                        </p>
                                        <div className="text-xs text-amber-900 space-y-1">
                                            <p>📅 **Nuevo Horario:** {new Date(apt.rescheduledAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                                            {apt.notes && <p className="italic opacity-80 mt-1">&quot; {apt.notes.split("[Propuesta Reprog:")[1]?.replace("]", "") || apt.notes} &quot;</p>}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
                                            <button
                                                onClick={() => handleAcceptReschedule(apt.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                                            >
                                                <Check className="w-3.5 h-3.5 stroke-[3]" /> Aceptar sin costo
                                            </button>
                                            <button
                                                onClick={() => setReschedulingId(apt.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                                            >
                                                <Calendar className="w-3.5 h-3.5" /> Proponer otro horario
                                            </button>
                                            <button
                                                onClick={() => setDenouncingId(apt.id)}
                                                className="px-4 py-2.5 bg-white border border-slate-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors"
                                            >
                                                Denunciar / Reclamar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Claims / Cancel trigger */}
                                {!isProposed && (apt.status === "paid" || apt.status === "confirmed") && (
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1.5 w-full">
                                        {canClaim ? (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center gap-2 w-full justify-between">
                                                <div className="text-[10px] text-red-800 leading-normal">
                                                    ⚠️ <strong>Inasistencia del Proveedor:</strong> El horario de la cita ha expirado y no se registró la atención. Puedes iniciar un reclamo para obtener el reembolso.
                                                </div>
                                                <button
                                                    onClick={() => setDenouncingId(apt.id)}
                                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px] uppercase shrink-0 transition-colors shadow-sm"
                                                >
                                                    Denunciar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between w-full gap-2 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                                <p className="text-[10px] text-slate-500 leading-normal">
                                                    * El botón de denuncia se activará 15 minutos después de la hora pactada si el proveedor no inicia la atención.
                                                </p>
                                                <button
                                                    disabled
                                                    className="px-3 py-1.5 bg-slate-100 text-slate-400 font-bold rounded-lg text-[10px] uppercase cursor-not-allowed shrink-0 border border-slate-200"
                                                    title="Se activa 15 minutos después de la hora de la cita"
                                                >
                                                    Denunciar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Historial de Citas Pasadas (Collapsible) */}
            {historyAppointments.length > 0 && (
                <div className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        type="button"
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors select-none text-left"
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-500" />
                            <span className="text-sm font-bold text-slate-800">
                                Ver Historial de Citas Pasadas ({historyAppointments.length})
                            </span>
                        </div>
                        <span className="text-xs text-primary-600 font-bold">
                            {showHistory ? "Ocultar ▲" : "Mostrar ▼"}
                        </span>
                    </button>
                    
                    {showHistory && (
                        <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/50 max-h-[500px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                            {historyAppointments.map((apt: any) => {
                                const statusInfo = APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS];
                                return (
                                    <div
                                        key={apt.id}
                                        className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h4 className="font-extrabold text-slate-900 text-sm truncate">
                                                    {apt.establishment?.name || 'Establecimiento'}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-0.5 capitalize truncate">
                                                    🐶 {apt.pet?.name} · {apt.serviceType}
                                                </p>
                                                <p className="text-[11px] text-slate-455 mt-1 font-medium">
                                                    {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin hora'}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusInfo?.color || 'text-slate-650 bg-slate-100'} shrink-0`}>
                                                {statusInfo?.label || apt.status}
                                            </span>
                                        </div>

                                        {/* Expandable Recipe for completed */}
                                        {apt.status === 'completed' && apt.medicalRecord && (
                                            <details className="border-t border-slate-100 pt-3 group/rec">
                                                <summary className="text-[11px] font-bold text-primary-600 hover:text-primary-750 cursor-pointer list-none flex items-center justify-between select-none">
                                                    <span className="flex items-center gap-1">📋 Ver receta e indicaciones médicas</span>
                                                    <span className="text-[9px] transition-transform group-open/rec:rotate-180">▼</span>
                                                </summary>
                                                <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-2.5 text-slate-700">
                                                    {apt.medicalRecord.diagnosis && (
                                                        <div>
                                                            <span className="font-bold block text-slate-400 uppercase text-[9px] tracking-wider">Diagnóstico</span>
                                                            <p className="font-medium text-slate-900 mt-0.5">{apt.medicalRecord.diagnosis}</p>
                                                        </div>
                                                    )}
                                                    {apt.medicalRecord.prescription && (
                                                        <div>
                                                            <span className="font-bold block text-slate-400 uppercase text-[9px] tracking-wider">Receta / Prescripción</span>
                                                            <p className="font-medium text-slate-900 bg-white border border-slate-200/65 rounded-lg p-2.5 mt-1 whitespace-pre-line leading-relaxed shadow-sm">
                                                                {apt.medicalRecord.prescription}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {apt.medicalRecord.treatment && (
                                                        <div>
                                                            <span className="font-bold block text-slate-400 uppercase text-[9px] tracking-wider">Notas de Tratamiento</span>
                                                            <p className="font-medium text-slate-850 mt-0.5">{apt.medicalRecord.treatment}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </details>
                                        )}

                                        {/* Review Form for completed */}
                                        {apt.status === 'completed' && (
                                            <div className="border-t border-slate-100 pt-3">
                                                <ReviewForm
                                                    appointmentId={apt.id}
                                                    establishmentId={apt.establishment?.id}
                                                    establishmentName={apt.establishment?.name || 'Establecimiento'}
                                                    alreadyReviewed={!!apt.review}
                                                    existingRating={apt.review?.rating}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Denuncia Modal Dialog Form */}
            {denouncingId && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <form onSubmit={handleDenounce} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-150 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-red-500" /> Registrar Denuncia Brofy
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setDenouncingId(null)}
                                className="p-1 text-slate-400 hover:text-slate-650 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-red-50 text-red-950 border border-red-200 p-3.5 rounded-2xl text-[10px] leading-relaxed space-y-1">
                            <p className="font-bold">⚠️ Sistema de Auditoría y Protección Brofy:</p>
                            <p>Tu denuncia será auditada por el Administrador de Brofy para validar las versiones de ambas partes. Si se aprueba, se cancelará el turno y **se te reembolsará la comisión en forma de Huellitas** (ej: 500 Huellitas por S/ 5.00) en tu cuenta. Se podrán aplicar sanciones al proveedor en caso de incumplimiento.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Describe lo sucedido *</label>
                            <textarea
                                required
                                value={denounceReason}
                                onChange={e => setDenounceReason(e.target.value)}
                                placeholder="Ej: Fui al establecimiento en la hora programada pero estaba cerrado, nadie me atendió y no respondieron mis llamadas..."
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 h-24 resize-none focus:outline-none text-xs"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDenouncingId(null)}
                                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-650 rounded-xl text-xs font-semibold hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submittingDenounce}
                                className="flex-1 px-4 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md"
                            >
                                {submittingDenounce ? "Enviando..." : "Confirmar Denuncia"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Counter-Reschedule Modal Dialog Form */}
            {reschedulingId && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <form onSubmit={handleCounterReschedule} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-150 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-primary-500" /> Sugerir Horario Alternativo
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setReschedulingId(null)}
                                className="p-1 text-slate-400 hover:text-slate-650 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-primary-50 text-primary-950 border border-primary-200 p-3.5 rounded-2xl text-[10px] leading-relaxed space-y-1">
                            <p className="font-bold">📅 Coordinación de Horario Flexible:</p>
                            <p>Si no puedes asistir en la hora propuesta por el establecimiento, elige aquí tu horario de preferencia. Se enviará una contrapropuesta al proveedor para su confirmación inmediata sin costo alguno.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Selecciona Nueva Fecha y Hora *</label>
                            <input
                                type="datetime-local"
                                required
                                value={counterDate}
                                onChange={e => setCounterDate(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mensaje / Nota para el Establecimiento</label>
                            <textarea
                                value={counterNotes}
                                onChange={e => setCounterNotes(e.target.value)}
                                placeholder="Ej: Prefiero este horario porque salgo de trabajar y me queda más cómodo para llevar a mi mascota..."
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 h-20 resize-none focus:outline-none text-xs"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setReschedulingId(null)}
                                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-650 rounded-xl text-xs font-semibold hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submittingCounter}
                                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
                            >
                                {submittingCounter ? "Enviando..." : "Enviar Propuesta"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Success Booking Modal */}
            {showSuccess && successApt && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] p-6 max-w-md w-full space-y-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <ShieldCheck className="w-9 h-9" />
                        </div>

                        <div className="space-y-1.5">
                            <h2 className="text-xl font-black text-slate-900">¡Pago Procesado con Éxito!</h2>
                            <p className="text-sm text-slate-500">Tu turno ha sido confirmado satisfactoriamente</p>
                        </div>

                        {/* Details */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-700">
                            <p>🩺 **Establecimiento:** {successApt.establishment?.name}</p>
                            <p>🐕 **Mascota:** {successApt.pet?.name}</p>
                            <p>📅 **Fecha y Hora:** {successApt.scheduledAt ? new Date(successApt.scheduledAt).toLocaleDateString("es-PE", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "Sin hora"}</p>
                            <p>🏷️ **Servicio:** {successApt.serviceType}</p>
                        </div>

                        {/* OTP Warning */}
                        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 space-y-2">
                            <p className="text-xs text-primary-800 font-semibold">Código de Atención (OTP):</p>
                            <span className="font-mono text-3xl font-black tracking-[0.3em] text-primary-700 block">
                                {successApt.otpValidationCode}
                            </span>
                            <p className="text-[10px] text-primary-600 leading-normal">
                                Este es tu código único de atención. Muéstraselo al veterinario al llegar al establecimiento para iniciar la cita.
                            </p>
                        </div>

                        {/* Reminders reminder */}
                        <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-3.5 text-xs text-left leading-normal">
                            🔔 **Recordatorios Activos:** Te enviaremos notificaciones de control antes de tu cita. También se ha actualizado tu Carnet Digital de Mascotas.
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href={buildGoogleCalendarUrl(successApt)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-3 py-3 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
                                >
                                    📅 Google Calendar
                                </a>
                                <a
                                    href={buildIcsDataUri(successApt)}
                                    download={`cita-brofy-${successApt.id}.ics`}
                                    className="flex items-center justify-center gap-1.5 px-3 py-3 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
                                >
                                    📎 Apple / Outlook
                                </a>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowSuccess(false);
                                    setSuccessApt(null);
                                    // Clear status query param from URL
                                    router.replace('/dashboard/client/pending');
                                }}
                                className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                            >
                                Entendido, Ir a Mis Citas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
