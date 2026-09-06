"use client";

import { useState, useEffect } from "react";
import { getClientAppointments, getProfile, acceptReschedule, fileDenuncia, proposeReschedule, acceptPriceChange, cancelAppointmentWithRefund } from "@/lib/actions";
import { 
    Clock, Calendar, AlertTriangle, ShieldCheck, 
    MessageSquare, Check, X, RefreshCw, AlertCircle, Sparkles, Phone, Award, MapPin
} from "lucide-react";
import { toast } from "sonner";
import { formatPEN, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReviewForm } from "@/components/ui/review-form";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/types";
import { LoadingState } from "@/components/ui/loading-state";

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
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [expandedAptId, setExpandedAptId] = useState<string | null>(null);

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
            const apts = await getClientAppointments();
            const prof = await getProfile();
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
            const claimId = urlParams.get('claim');
            if (claimId) {
                setDenouncingId(claimId);
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
        const details = encodeURIComponent(`Servicio: ${apt.serviceType}\nMascota: ${apt.pet?.name}\nCódigo de verificación: ${apt.otpValidationCode}\nReserva gestionada por Brofy.`);
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
        if (!confirm("¿Seguro que deseas solicitar la cancelación de esta cita? Se enviará una notificación del motivo de la cancelación a los administradores para fines de auditoría y evaluación de la devolución de comisión.")) return;
        try {
            const res = await cancelAppointmentWithRefund(aptId);
            if (res.success) {
                toast.success("Cancelación registrada. La notificación del motivo ha sido enviada a los administradores para su revisión.");
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
                toast.success(res.message || "Reclamo registrado y saldo acreditado.");
                setDenouncingId(null);
                setDenounceReason("");
                loadData();
            } else {
                toast.error(res.message || "Error al procesar el reclamo");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setSubmittingDenounce(false);
        }
    };

    // Filter appointments for pending states
    const activeAppointments = appointments.filter(apt => {
        if (apt.status === "completed" || apt.status === "cancelled" || apt.status === "disputed") return false;
        // Exclude unattended paid/confirmed appointments older than 48 hours
        if ((apt.status === "paid" || apt.status === "confirmed") && apt.scheduledAt) {
            const diff = Date.now() - new Date(apt.scheduledAt).getTime();
            if (diff > 48 * 60 * 60 * 1000) return false;
        }
        return (
            apt.status === "pending" || 
            apt.status === "paid" || 
            apt.status === "confirmed" ||
            apt.status === "validated" ||
            (apt.rescheduledAt !== null)
        );
    });

    const historyAppointments = appointments.filter(apt => {
        if (apt.status === "completed" || apt.status === "cancelled" || apt.status === "disputed") return true;
        // Include unattended paid/confirmed appointments older than 48 hours
        if ((apt.status === "paid" || apt.status === "confirmed") && apt.scheduledAt) {
            const diff = Date.now() - new Date(apt.scheduledAt).getTime();
            if (diff > 48 * 60 * 60 * 1000) return true;
        }
        return false;
    });

    if (loading) {
        return <LoadingState message="Cargando tus citas..." description="Recuperando agenda, turnos y puntos acumulados" />;
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900">Agenda Activa</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                    Monitorea tus atenciones programadas, reprogramaciones y gestiona reclamos por inasistencia.
                </p>
            </div>

            {/* Credit Wallet Widget (Huellitas loyalty points program) — Only visible if balance > 0 */}
            {profile?.creditBalance > 0 && (
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 stroke-[2.5]" /> Billetera de Huellitas 🐾
                        </span>
                        <h2 className="text-2xl font-black">{(profile.creditBalance * 100).toFixed(0)} Huellitas</h2>
                        <p className="text-xs opacity-90">Puntos acumulados para recompensas y programa de lealtad</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3 border border-white/20 text-center font-bold text-xs max-w-[130px] leading-relaxed">
                        ✨ Programa de Lealtad y Devoluciones
                    </div>
                </div>
            )}
                   {/* Tabs */}
            <div className="flex border-b border-slate-200 mt-2">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'active'
                            ? 'border-primary-600 text-primary-600 font-extrabold'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Agenda Activa y Reclamos ({activeAppointments.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'history'
                            ? 'border-primary-600 text-primary-600 font-extrabold'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Historial de Citas ({historyAppointments.length})
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'active' ? (
                activeAppointments.length === 0 ? (
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
                            const statusInfo = APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS] || { label: apt.status, color: "text-slate-600 bg-slate-100" };
                            
                            // Permitir reclamo si la cita fue confirmada/pagada y ya pasó su horario con una tolerancia de 30 minutos, hasta un máximo de 48 horas
                            const appointmentTime = apt.scheduledAt ? new Date(apt.scheduledAt).getTime() : 0;
                            const TOLERANCE_MS = 30 * 60 * 1000; // 30 minutos de tolerancia
                            const LIMIT_MS = 48 * 60 * 60 * 1000; // 48 horas de límite
                            const isExpired = appointmentTime > 0 && (Date.now() - appointmentTime) >= TOLERANCE_MS && (Date.now() - appointmentTime) <= LIMIT_MS;
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

                            const attendingSpecialistName = apt.medicalRecord?.attendingName || apt.provider?.fullName;
                            const attendingSpecialistCmvp = apt.medicalRecord?.attendingCmvp || apt.provider?.cmvpId;

                            return (
                                <div 
                                    key={apt.id} 
                                    className={`bg-white rounded-3xl border p-5 shadow-sm space-y-4 transition-all ${
                                        canClaim && !isProposed
                                            ? "border-amber-350 bg-amber-50/5 shadow-sm"
                                            : isProposed 
                                                ? "border-amber-200 ring-2 ring-amber-100" 
                                                : "border-slate-100 hover:border-primary-100"
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-slate-900 text-base">{apt.establishment?.name}</h3>
                                            <p className="text-xs text-slate-500 font-semibold capitalize mt-0.5 truncate max-w-[240px] sm:max-w-[380px]" title={`🐶 ${apt.pet?.name} · ${apt.serviceType}`}>
                                                🐶 {apt.pet?.name} · {apt.serviceType}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {apt.scheduledAt ? formatDateTime(apt.scheduledAt) : "Sin hora"}
                                            </p>
                                            {apt.establishment?.address && (
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${apt.establishment.latitude && apt.establishment.longitude ? `${apt.establishment.latitude},${apt.establishment.longitude}` : encodeURIComponent(`${apt.establishment.name}, ${apt.establishment.address}, ${apt.establishment.city || 'Lima'}`)}`}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary-600 hover:text-primary-750 flex items-center gap-1 mt-1.5 font-semibold hover:underline"
                                                >
                                                    <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                                    <span className="truncate max-w-full sm:max-w-[280px]">
                                                        {apt.establishment.address} {apt.establishment.district ? `(${apt.establishment.district})` : ''}
                                                    </span>
                                                </a>
                                            )}
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full w-fit ${
                                            isProposed ? "bg-amber-100 text-amber-800" : statusInfo.color
                                        }`}>
                                            {isProposed ? "Reprogramación propuesta" : statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Collapsible Details Button */}
                                    <button
                                        onClick={() => setExpandedAptId(expandedAptId === apt.id ? null : apt.id)}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-500 rounded-xl transition-all border border-slate-100 active:scale-[0.98]"
                                        type="button"
                                    >
                                        <span>{expandedAptId === apt.id ? "Ocultar Detalles ▲" : "Ver Detalles de Cita ▼"}</span>
                                    </button>

                                    {/* Collapsible Details Content */}
                                    {expandedAptId === apt.id && (
                                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 mt-2 space-y-3.5 text-xs text-slate-700 animate-in slide-in-from-top-1 duration-200">
                                            <div className="space-y-1.5">
                                                <p className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">Servicios Reservados</p>
                                                <div className="space-y-1">
                                                    {bookedSvcs.map((s: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs">
                                                            <span className="font-medium text-slate-600">{s.name}</span>
                                                            <span className="font-bold text-slate-800">S/ {s.price.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-200 pt-2.5 space-y-1.5">
                                                <p className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">Desglose de Tarifas</p>
                                                <div className="space-y-1 text-slate-600">
                                                    <div className="flex justify-between">
                                                        <span>Servicio a abonar en local:</span>
                                                        <span className="font-bold text-primary-600">S/ {apt.totalServicePrice.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Agendamiento en app (pagado):</span>
                                                        <span className="font-bold text-slate-800">
                                                            {apt.commissionAmount > 0 ? `S/ ${apt.commissionAmount.toFixed(2)}` : 'S/ 0.00 (Gratis)'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5 font-bold text-slate-900">
                                                        <span>Total Cita:</span>
                                                        <span>S/ {(apt.totalServicePrice + apt.commissionAmount).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {(attendingSpecialistName || attendingSpecialistCmvp) && (
                                                <div className="border-t border-slate-200 pt-2.5 space-y-1">
                                                    <p className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">Especialista Asignado</p>
                                                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                                                        🩺 {attendingSpecialistName}
                                                        {attendingSpecialistCmvp && (
                                                            <span className="font-mono text-[10px] text-slate-500 font-normal">
                                                                (CMVP: {attendingSpecialistCmvp})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {apt.notes && (
                                                <div className="border-t border-slate-200 pt-2.5 space-y-1">
                                                    <p className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">Notas / Indicaciones</p>
                                                    <p className="text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100 leading-normal">
                                                        &ldquo;{apt.notes.split("[Propuesta Reprog:")[0]?.trim() || apt.notes}&rdquo;
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Active Price Change Counter Proposal Section */}
                                    {hasPriceChange && (
                                        <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl space-y-3">
                                            <p className="text-xs font-bold text-amber-955 flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" /> Actualización de precio sugerido por local:
                                            </p>
                                            <div className="text-xs text-amber-900 space-y-1 bg-white/50 p-2.5 rounded-xl border border-amber-100">
                                                <div className="flex justify-between">
                                                    <span>Tarifa Original:</span>
                                                    <span className="line-through">S/ {originalTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-amber-955">
                                                    <span>Nueva Tarifa:</span>
                                                    <span>S/ {newTotal.toFixed(2)}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">La variación se debe a ajustes específicos en las características del paciente o insumos requeridos.</p>
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={() => handleAcceptPriceChange(apt.id)}
                                                    className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                                                >
                                                    Aceptar Tarifa
                                                </button>
                                                <button
                                                    onClick={() => handleCancelWithRefund(apt.id)}
                                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 text-red-650 rounded-xl text-xs font-bold hover:bg-red-50 transition-all active:scale-95"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Active OTP Attention Code Widget */}
                                    {(apt.status === "paid" || apt.status === "confirmed") && apt.otpValidationCode && (
                                        <div className={`rounded-2xl p-4 flex flex-col gap-3 shadow-sm border transition-all duration-300 ${
                                            canClaim && !isProposed
                                                ? 'bg-white text-slate-800 border-amber-100' 
                                                : 'bg-primary-600 text-white border-primary-500'
                                        }`}>
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className={`text-xs font-semibold ${
                                                        canClaim && !isProposed ? 'text-slate-700' : 'text-primary-200'
                                                    }`}>Tu Código de verificación</p>
                                                    <p className={`text-[10px] ${
                                                        canClaim && !isProposed ? 'text-slate-400' : 'text-primary-100/80'
                                                    }`}>Muéstraselo al especialista al llegar</p>
                                                </div>
                                                <span className={`font-mono text-xl font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl border ${
                                                    canClaim && !isProposed 
                                                        ? 'bg-amber-50/50 border-amber-200 text-amber-900 shadow-sm' 
                                                        : 'bg-white/10 border-white/20 text-white'
                                                }`}>
                                                    {apt.otpValidationCode}
                                                </span>
                                            </div>
                                            {canClaim && !isProposed && (
                                                <div className="border-t border-amber-100 pt-3 mt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs bg-amber-50/50 -mx-4 -mb-4 p-4 rounded-b-2xl border-b-0 border-l-0 border-r-0 border">
                                                    <span className="text-[11px] text-amber-900 font-medium leading-normal flex-1">
                                                        ⚠️ <strong>Inasistencia del Proveedor:</strong> El horario expiró. Puedes reclamar inasistencia para recuperar tu comisión.
                                                    </span>
                                                    <button
                                                        onClick={() => setDenouncingId(apt.id)}
                                                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-[10px] uppercase shrink-0 transition-colors shadow-sm border border-amber-500/20 active:scale-95"
                                                    >
                                                        Reclamar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Vet Proposed Rescheduling Section */}
                                    {isProposed && (
                                        <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                                            <p className="text-xs font-bold text-amber-955 flex items-center gap-1.5">
                                                <Sparkles className="w-4 h-4 text-amber-600" /> El establecimiento propone reprogramar:
                                            </p>
                                            <div className="text-xs text-amber-900 space-y-1">
                                                <p>📅 **Nuevo Horario:** {formatDateTime(apt.rescheduledAt)}</p>
                                                {apt.notes && <p className="italic opacity-80 mt-1">&quot; {apt.notes.split("[Propuesta Reprog:")[1]?.replace("]", "") || apt.notes} &quot;</p>}
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
                                                <button
                                                    onClick={() => handleAcceptReschedule(apt.id)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95"
                                                >
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Aceptar sin costo
                                                </button>
                                                <button
                                                    onClick={() => setReschedulingId(apt.id)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95"
                                                >
                                                    <Calendar className="w-3.5 h-3.5" /> Proponer otro horario
                                                </button>
                                                {(apt.status === "paid" || apt.status === "confirmed") && (
                                                    <button
                                                        onClick={() => setDenouncingId(apt.id)}
                                                        className="px-4 py-2.5 bg-white border border-slate-200 text-red-650 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors active:scale-95"
                                                    >
                                                        Iniciar Reclamo
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            ) : (
                historyAppointments.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                        <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-slate-900 mb-1">Sin historial de citas</h2>
                        <p className="text-sm text-slate-500">Aún no tienes atenciones finalizadas o canceladas en tu registro.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historyAppointments.map((apt: any) => {
                            const isNoAtendido = (apt.status === 'paid' || apt.status === 'confirmed') && apt.scheduledAt && (Date.now() - new Date(apt.scheduledAt).getTime() > 48 * 60 * 60 * 1000);
                            const statusInfo = isNoAtendido
                                ? { label: 'No atendido', color: 'text-slate-550 bg-slate-100' }
                                : (APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS] || { label: apt.status, color: 'text-slate-650 bg-slate-100' });
                            
                            let bookedSvcs: any[] = [];
                            try {
                                bookedSvcs = JSON.parse(apt.bookedServices || "[]");
                            } catch {}

                            const attendingSpecialistName = apt.medicalRecord?.attendingName || apt.provider?.fullName;
                            const attendingSpecialistCmvp = apt.medicalRecord?.attendingCmvp || apt.provider?.cmvpId;

                            return (
                                <div
                                    key={apt.id}
                                    className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h4 className="font-extrabold text-slate-900 text-sm truncate">
                                                {apt.establishment?.name || 'Establecimiento'}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-0.5 capitalize truncate">
                                                🐶 {apt.pet?.name} · {apt.serviceType}
                                            </p>
                                            <p className="text-[11px] text-slate-455 mt-1 font-medium">
                                                {apt.scheduledAt ? formatDateTime(apt.scheduledAt) : 'Sin hora'}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusInfo?.color || 'text-slate-650 bg-slate-100'} shrink-0`}>
                                            {statusInfo?.label || apt.status}
                                        </span>
                                    </div>

                                    {/* Collapsible Details Button */}
                                    <button
                                        onClick={() => setExpandedAptId(expandedAptId === apt.id ? null : apt.id)}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-500 rounded-xl transition-all border border-slate-100 active:scale-[0.98]"
                                        type="button"
                                    >
                                        <span>{expandedAptId === apt.id ? "Ocultar Detalles ▲" : "Ver Detalles de Cita ▼"}</span>
                                    </button>

                                    {/* Collapsible Details Content */}
                                    {expandedAptId === apt.id && (
                                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 mt-2 space-y-3.5 text-xs text-slate-700 animate-in slide-in-from-top-1 duration-200">
                                            <div className="space-y-1.5">
                                                <p className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">Servicios Reservados</p>
                                                <div className="space-y-1">
                                                    {bookedSvcs.map((s: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs">
                                                            <span className="font-medium text-slate-600">{s.name}</span>
                                                            <span className="font-bold text-slate-800">S/ {s.price.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-200 pt-2.5 space-y-1.5">
                                                <p className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">Desglose de Tarifas</p>
                                                <div className="space-y-1 text-slate-600">
                                                    <div className="flex justify-between">
                                                        <span>Servicio a abonar en local:</span>
                                                        <span className="font-bold text-primary-600">S/ {apt.totalServicePrice.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Agendamiento en app (pagado):</span>
                                                        <span className="font-bold text-slate-800">
                                                            {apt.commissionAmount > 0 ? `S/ ${apt.commissionAmount.toFixed(2)}` : 'S/ 0.00 (Gratis)'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5 font-bold text-slate-900">
                                                        <span>Total Cita:</span>
                                                        <span>S/ {(apt.totalServicePrice + apt.commissionAmount).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {(attendingSpecialistName || attendingSpecialistCmvp) && (
                                                <div className="border-t border-slate-200 pt-2.5 space-y-1">
                                                    <p className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">Especialista Atendiendo</p>
                                                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                                                        🩺 {attendingSpecialistName}
                                                        {attendingSpecialistCmvp && (
                                                            <span className="font-mono text-[10px] text-slate-500 font-normal">
                                                                (CMVP: {attendingSpecialistCmvp})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {apt.notes && (
                                                <div className="border-t border-slate-200 pt-2.5 space-y-1">
                                                    <p className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">Notas / Indicaciones</p>
                                                    <p className="text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100 leading-normal">
                                                        &ldquo;{apt.notes.split("[Propuesta Reprog:")[0]?.trim() || apt.notes}&rdquo;
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

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
                )
            )}
            
            {/* Denuncia Modal Dialog Form */}
            {denouncingId && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <form onSubmit={handleDenounce} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-150 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-red-500" /> Registrar Reclamo Brofy
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setDenouncingId(null)}
                                className="p-1 text-slate-400 hover:text-slate-655 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-red-50 text-red-950 border border-red-200 p-3.5 rounded-2xl text-[10px] leading-relaxed space-y-1">
                            <p className="font-bold">⚠️ Sistema de Auditoría y Protección Brofy:</p>
                            <p>Tu reclamo será auditado por el Administrador de Brofy para validar las versiones de ambas partes. Si se aprueba, se cancelará el turno y **se te reembolsará la comisión en forma de Huellitas** (ej: 500 Huellitas por S/ 5.00) en tu cuenta. Se podrán aplicar sanciones al proveedor en caso de incumplimiento.</p>
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
                                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submittingDenounce}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingDenounce ? "Enviando..." : "Confirmar Reclamo"}
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
                            <p>📅 **Fecha y Hora:** {successApt.scheduledAt ? formatDateTime(successApt.scheduledAt) : "Sin hora"}</p>
                            <p>🏷️ **Servicio:** {successApt.serviceType}</p>
                        </div>

                        {/* OTP Warning */}
                        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 space-y-2">
                            <p className="text-xs text-primary-800 font-semibold">Código de verificación:</p>
                            <span className="font-mono text-3xl font-black tracking-[0.3em] text-primary-700 block">
                                {successApt.otpValidationCode}
                            </span>
                            <p className="text-[10px] text-primary-600 leading-normal">
                                Este es tu código único de verificación. Muéstraselo al veterinario al llegar al establecimiento para iniciar la cita.
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
