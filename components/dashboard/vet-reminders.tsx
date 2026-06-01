'use client'

import { useState } from 'react'
import { Bell, CheckCircle, Trash2, Calendar, Shield, Sparkles, Plus, X, Search, HeartPulse } from 'lucide-react'
import { createReminder, completeReminder, deleteReminder } from '@/lib/actions'
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

export function VetRemindersList({ 
    initialReminders, 
    patients 
}: { 
    initialReminders: any[], 
    patients: Array<{ petId: string; petName: string; clientId: string; clientName: string }> 
}) {
    const [reminders, setReminders] = useState(initialReminders)
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form states
    const [selectedPatientIndex, setSelectedPatientIndex] = useState('')
    const [type, setType] = useState('control')
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [dueDate, setDueDate] = useState('')

    async function handleComplete(id: string) {
        const res = await completeReminder(id)
        if (res.success) {
            setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: true } : r))
            toast.success('Notificación/Recordatorio marcado como completado')
        }
    }

    async function handleDelete(id: string) {
        const res = await deleteReminder(id)
        if (res.success) {
            setReminders(prev => prev.filter(r => r.id !== id))
            toast.success('Notificación/Recordatorio eliminado')
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedPatientIndex) {
            toast.error('Selecciona una mascota/paciente')
            return
        }
        if (!title.trim()) {
            toast.error('Ingresa un título')
            return
        }
        if (!dueDate) {
            toast.error('Selecciona la fecha de vencimiento')
            return
        }

        setLoading(true)
        try {
            const patient = patients[parseInt(selectedPatientIndex)]
            const res = await createReminder({
                clientId: patient.clientId,
                petId: patient.petId,
                type,
                title,
                message,
                dueDate
            })

            if (res.success) {
                toast.success('🔔 ¡Recordatorio enviado al cliente con éxito!')
                setReminders(prev => [res.reminder, ...prev])
                setShowForm(false)
                // Reset form
                setSelectedPatientIndex('')
                setTitle('')
                setMessage('')
                setDueDate('')
            }
        } catch {
            toast.error('Error al programar el recordatorio')
        } finally {
            setLoading(false)
        }
    }

    const activeReminders = reminders.filter(r => !r.isCompleted)

    return (
        <section className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary-500 animate-bounce" />
                    <h2 className="text-lg font-bold text-slate-900">Notificaciones y Recordatorios ({activeReminders.length})</h2>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold rounded-xl transition-all"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancelar' : 'Nuevo Aviso'}
                </button>
            </div>

            {/* Quick Create Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 animate-in">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-primary-500" />
                        Programar Alerta Médica / Comercial
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Select Patient */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Mascota / Paciente *</label>
                            {patients.length === 0 ? (
                                <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                                    No tienes pacientes registrados aún. Atiende a un paciente para poder enviarle notificaciones.
                                </div>
                            ) : (
                                <select
                                    value={selectedPatientIndex}
                                    onChange={e => setSelectedPatientIndex(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                >
                                    <option value="">Seleccionar paciente...</option>
                                    {patients.map((p, idx) => (
                                        <option key={p.petId} value={idx}>
                                            🐾 {p.petName} (Dueño: {p.clientName})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Select Type */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tipo de Notificación</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full px-3 py-2 text-xs border rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="control">🩺 Control Médico / Control Clínico</option>
                                <option value="vaccine">💉 Vacuna / Inoculación</option>
                                <option value="deworming">🐛 Desparasitación</option>
                                <option value="service">✂️ Grooming / Paseo / Servicio Comercial</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Title */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Título del recordatorio *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ej: Toca refuerzo de vacuna Triple Felina"
                                className="w-full px-3 py-2 text-xs border rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Vence el / Control programado *</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 text-xs border rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                                required
                            />
                        </div>
                    </div>

                    {/* Message Details */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Mensaje / Recomendaciones adicionales (Opcional)</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Ej: Recuerda traer a tu gato en ayunas de 8 horas."
                            className="w-full px-3 py-2 text-xs border rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 h-16 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || patients.length === 0}
                        className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-350 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Programando...' : '🔔 Activar y Notificar al Cliente'}
                    </button>
                </form>
            )}

            {/* List */}
            {activeReminders.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                    <p className="text-sm font-medium">No tienes recordatorios activos.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Usa &quot;Nuevo Aviso&quot; para notificar a tus clientes sobre vacunas, controles o servicios.</p>
                </div>
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
                                            <Shield className="w-2.5 h-2.5" /> Oficial Brofy
                                        </span>
                                    )}
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {rem.type === 'vaccine' ? '💉 Vacuna' : rem.type === 'deworming' ? '🐛 Desparasitación' : rem.type === 'control' ? '🩺 Control Clínico' : '✂️ Servicio Comercial'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-slate-900">{rem.title}</h3>
                                {rem.message && <p className="text-xs text-slate-600">{rem.message}</p>}
                                {rem.pet && (
                                    <p className="text-xs text-primary-600 font-semibold">
                                        Paciente: {rem.pet.name} (Dueño: {rem.client?.fullName})
                                    </p>
                                )}
                                <div className="flex items-center gap-1.5 text-xs text-slate-450">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Vence: <strong>{formatFriendlyDate(rem.dueDate)}</strong></span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                <button
                                    onClick={() => handleComplete(rem.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" /> Completar
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