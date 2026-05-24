'use client'

import { useState } from 'react'
import { createGlobalReminder, deleteReminder } from '@/lib/actions'
import { Bell, Calendar, Plus, Trash2, Shield, Loader2, Sparkles } from 'lucide-react'

export function AdminRemindersList({ initialReminders }: { initialReminders: any[] }) {
    const [reminders, setReminders] = useState(initialReminders)
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form states
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [type, setType] = useState('service')
    const [dueDate, setDueDate] = useState('')

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!title || !dueDate) return

        setLoading(true)
        const res = await createGlobalReminder({
            title,
            message: message || undefined,
            type,
            dueDate,
        })

        if (res.success) {
            setReminders([res.reminder, ...reminders])
            setTitle('')
            setMessage('')
            setType('service')
            setDueDate('')
            setShowForm(false)
        }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        const res = await deleteReminder(id)
        if (res.success) {
            setReminders(prev => prev.filter(r => r.id !== id))
        }
    }

    const globalReminders = reminders.filter(r => r.isGlobal)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Crea anuncios de prevención, campañas de vacunación o alertas generales para todos los usuarios.
                </p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Nueva Campaña / Recordatorio
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary-500" /> Crear Alerta General / Campaña
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Título del Anuncio *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ej: Campaña de Vacunación Antirrábica 2026"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Tipo de Alerta *</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="service">🐾 Servicio / Re-booking</option>
                                <option value="vaccine">💉 Campaña Vacunación</option>
                                <option value="deworming">🐛 Desparasitación</option>
                                <option value="control">🩺 Control General</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Mensaje / Recomendaciones</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Recomendaciones para los dueños, requisitos, etc..."
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Fecha de Vencimiento / Plazo Máximo *</label>
                            <input
                                type="date"
                                required
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Crear y Publicar
                        </button>
                    </div>
                </form>
            )}

            {globalReminders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No hay campañas ni anuncios generales registrados.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {globalReminders.map(rem => (
                        <div key={rem.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                                        <Shield className="w-2.5 h-2.5" /> Campaña Global
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Creada el: {new Date(rem.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900">{rem.title}</h3>
                                {rem.message && <p className="text-sm text-slate-600">{rem.message}</p>}
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Vencimiento: <strong>{new Date(rem.dueDate).toLocaleDateString()}</strong></span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(rem.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                title="Eliminar campaña"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
