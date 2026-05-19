'use client'

import { useState, useEffect } from 'react'
import { getMyEstablishments, addService, deleteService } from '@/lib/actions'
import { SERVICE_CATEGORIES } from '@/lib/types'
import { formatPEN } from '@/lib/utils'
import { toast } from 'sonner'
import {
    Building2, Plus, Trash2, Clock, DollarSign, Save, Loader2, ChevronDown, ChevronUp, Tag
} from 'lucide-react'

export default function ServicesPage() {
    const [establishments, setEstablishments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState<string | null>(null) // establishmentId
    const [saving, setSaving] = useState(false)
    const [expandedEst, setExpandedEst] = useState<string | null>(null)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true)
        const data = await getMyEstablishments()
        setEstablishments(data)
        if (data.length > 0 && !expandedEst) setExpandedEst(data[0].id)
        setLoading(false)
    }

    async function handleAddService(formData: FormData) {
        setSaving(true)
        try {
            await addService(formData)
            toast.success('Servicio agregado exitosamente')
            setShowForm(null)
            loadData()
        } catch {
            toast.error('Error al agregar servicio')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(serviceId: string) {
        if (!confirm('¿Eliminar este servicio?')) return
        try {
            await deleteService(serviceId)
            toast.success('Servicio eliminado')
            loadData()
        } catch {
            toast.error('Error al eliminar servicio')
        }
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Servicios y Tarifario</h1>
                <p className="text-sm text-slate-500 mt-1">Administra los servicios de tus establecimientos</p>
            </div>

            {establishments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                    <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No tienes establecimientos registrados</p>
                    <a href="/dashboard/vet/establishment" className="mt-3 inline-block text-sm text-primary-600 font-medium hover:underline">Crear establecimiento →</a>
                </div>
            ) : (
                establishments.map(est => (
                    <div key={est.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        {/* Establishment Header */}
                        <button
                            onClick={() => setExpandedEst(expandedEst === est.id ? null : est.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-lg">
                                    {est.type === 'clinic' ? '🏥' : est.type === 'groomer' ? '✂️' : '🏠'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{est.name}</h3>
                                    <p className="text-xs text-slate-500">{est.services.length} servicios activos</p>
                                </div>
                            </div>
                            {expandedEst === est.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </button>

                        {expandedEst === est.id && (
                            <div className="border-t border-slate-100 p-4 space-y-3">
                                {/* Services List */}
                                {est.services.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4">Sin servicios. Agrega uno abajo.</p>
                                ) : (
                                    est.services.map((svc: any) => (
                                        <div key={svc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">{svc.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <DollarSign className="w-3 h-3" /> {formatPEN(svc.price)}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock className="w-3 h-3" /> {svc.duration} min
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                                        <Tag className="w-3 h-3" /> {SERVICE_CATEGORIES.find(c => c.value === svc.category)?.label || svc.category}
                                                    </span>
                                                </div>
                                                {svc.description && <p className="text-xs text-slate-400 mt-1">{svc.description}</p>}
                                            </div>
                                            <button onClick={() => handleDelete(svc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}

                                {/* Add Service Form */}
                                {showForm === est.id ? (
                                    <form action={handleAddService} className="bg-primary-50 rounded-xl p-4 space-y-3 animate-in">
                                        <input type="hidden" name="establishmentId" value={est.id} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input name="name" required placeholder="Nombre del servicio" className="col-span-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            <input name="price" type="number" step="0.5" required placeholder="Precio (S/)" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            <input name="duration" type="number" placeholder="Duración (min)" defaultValue="30" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            <select name="category" className="col-span-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                                {SERVICE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                            <textarea name="description" placeholder="Descripción (opcional)" rows={2} className="col-span-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setShowForm(null)} className="flex-1 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-white">Cancelar</button>
                                            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50">
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setShowForm(est.id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Agregar servicio
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}
