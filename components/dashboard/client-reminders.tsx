'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, Trash2, Calendar, Shield, Sparkles } from 'lucide-react'
import { completeReminder, deleteReminder } from '@/lib/actions'
import { toast } from 'sonner'

function formatFriendlyDate(dateStr: string) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    const dateObj = new Date(dateStr);
    return isNaN(dateObj.getTime()) ? dateStr : dateObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function buildGoogleCalendarReminderUrl(rem: any) {
    const title = encodeURIComponent(`${rem.title} | Brofy`);
    const dateStr = rem.dueDate.replace(/-/g, '');
    const dateObj = new Date(rem.dueDate + 'T00:00:00');
    dateObj.setDate(dateObj.getDate() + 1);
    const nextDateStr = dateObj.toISOString().split('T')[0].replace(/-/g, '');
    const dates = `${dateStr}/${nextDateStr}`;
    const details = encodeURIComponent(`${rem.message || ''}\nMascota: ${rem.pet?.name || 'Todas'}\nRecordatorio de control gestionado por Brofy.`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}

function buildIcsReminderDataUri(rem: any) {
    const dateStr = rem.dueDate.replace(/-/g, '');
    const dateObj = new Date(rem.dueDate + 'T00:00:00');
    dateObj.setDate(dateObj.getDate() + 1);
    const nextDateStr = dateObj.toISOString().split('T')[0].replace(/-/g, '');
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${nextDateStr}`,
        `SUMMARY:${rem.title} | Brofy`,
        `DESCRIPTION:${rem.message || ''} - Mascota: ${rem.pet?.name || 'Todas'}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}

export function ClientRemindersList({ initialReminders }: { initialReminders: any[] }) {
    const [reminders, setReminders] = useState(initialReminders)
    const [pushEnabled, setPushEnabled] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPushEnabled(Notification.permission === 'granted')
        }
    }, [])

    async function handleComplete(id: string) {
        const res = await completeReminder(id)
        if (res.success) {
            setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: true } : r))
            toast.success('Recordatorio marcado como completado')
        }
    }

    async function handleDelete(id: string) {
        const res = await deleteReminder(id)
        if (res.success) {
            setReminders(prev => prev.filter(r => r.id !== id))
            toast.success('Recordatorio eliminado')
        }
    }

    const enableBrowserPush = () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setPushEnabled(true)
                    toast.success('🔔 ¡Alerta de escritorio Brofy activada! Te avisaremos antes de cada cita.')
                } else {
                    toast.error('Acceso denegado. Habilita las notificaciones en el candado de la barra de direcciones.')
                }
            })
        } else {
            setPushEnabled(true)
            toast.success('🔔 Alertas de sistema Brofy habilitadas en tu dispositivo.')
        }
    }

    const activeReminders = reminders.filter(r => !r.isCompleted)


    return (
        <section className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Bell className="w-5 h-5 text-primary-500 animate-bounce" />
                <h2 className="text-lg font-bold text-slate-900">Recordatorios y Controles ({activeReminders.length})</h2>
            </div>

            {!pushEnabled && (
                <div className="bg-gradient-to-r from-primary-50 to-primary-100/30 border border-primary-100/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-all">
                    <div className="flex items-center gap-3 flex-col sm:flex-row">
                        <div className="w-10 h-10 rounded-xl bg-white border border-primary-100 flex items-center justify-center shadow-sm text-lg flex-shrink-0">
                            🔔
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">Recibe alertas inmediatas en tu dispositivo</h4>
                            <p className="text-xs text-slate-500">Activa las notificaciones en el navegador para avisarte al instante antes de que venza un control.</p>
                        </div>
                    </div>
                    <button 
                        onClick={enableBrowserPush}
                        className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all flex-shrink-0 shadow-sm active:scale-[0.97]"
                    >
                        Activar Alertas
                    </button>
                </div>
            )}

            {activeReminders.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">¡Todo al día! No tienes recordatorios pendientes.</p>
            ) : (
                <div className="space-y-3">
                    {activeReminders.map(rem => (
                        <div
                            key={rem.id}
                            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                                rem.isGlobal 
                                    ? 'bg-amber-50/50 border-amber-200' 
                                    : 'bg-slate-50 border-slate-100'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    {rem.isGlobal && (
                                        <span className="text-[10px] uppercase font-extrabold text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Shield className="w-2.5 h-2.5" /> Anuncio Oficial
                                        </span>
                                    )}
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {rem.type === 'vaccine' ? '💉 Vacuna' : rem.type === 'deworming' ? '🐛 Desparasitación' : rem.type === 'control' ? '🩺 Control Médico' : '🐾 Servicio / Campaña'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-slate-900">{rem.title}</h3>
                                {rem.message && <p className="text-xs text-slate-600">{rem.message}</p>}
                                {rem.pet && (
                                    <p className="text-xs text-primary-600 font-medium">
                                        Mascota: {rem.pet.name}
                                    </p>
                                )}
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Vence: <strong>{formatFriendlyDate(rem.dueDate)}</strong></span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                <a
                                    href={buildGoogleCalendarReminderUrl(rem)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center"
                                    title="Añadir a Google Calendar"
                                >
                                    <Calendar className="w-4.5 h-4.5" />
                                </a>
                                <a
                                    href={buildIcsReminderDataUri(rem)}
                                    download={`recordatorio-${rem.id}.ics`}
                                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center text-xs font-bold font-mono"
                                    title="Descargar para iCal / Outlook"
                                >
                                    ICS
                                </a>
                                <button
                                    onClick={() => handleComplete(rem.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" /> Completado
                                </button>
                                <button
                                    onClick={() => handleDelete(rem.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar recordatorio"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}