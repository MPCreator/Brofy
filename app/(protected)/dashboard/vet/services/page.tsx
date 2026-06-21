'use client'

import { useState, useEffect, useCallback } from 'react'
import { getMyEstablishments, addService, deleteService, updateService } from '@/lib/actions'
import { SERVICE_CATEGORIES, SPECIES_LABELS } from '@/lib/types'
import { formatPEN } from '@/lib/utils'
import { toast } from 'sonner'
import {
    Building2, Plus, Trash2, Clock, Coins, Save, Loader2, ChevronDown, ChevronUp, Tag, Edit2
} from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'

const ALL_SPECIES = [
    { value: 'dog', label: '🐕 Perro' },
    { value: 'cat', label: '🐈 Gato' },
    { value: 'bird', label: '🦜 Ave' },
    { value: 'rabbit', label: '🐇 Conejo' },
    { value: 'hamster', label: '🐹 Hámster' },
    { value: 'fish', label: '🐟 Pez' },
    { value: 'reptile', label: '🦎 Reptil' }
]

export default function ServicesPage() {
    const [establishments, setEstablishments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState<string | null>(null) // establishmentId
    const [saving, setSaving] = useState(false)
    const [expandedEst, setExpandedEst] = useState<string | null>(null)
    const [editingService, setEditingService] = useState<any | null>(null)
    const [addIsSpecific, setAddIsSpecific] = useState(false)
    const [editIsSpecific, setEditIsSpecific] = useState(false)
    const [addSpecies, setAddSpecies] = useState<string[]>([])
    const [editSpecies, setEditSpecies] = useState<string[]>([])

    const [addDays, setAddDays] = useState<string[]>(['mon','tue','wed','thu','fri','sat','sun'])
    const [editDays, setEditDays] = useState<string[]>([])
    const [addStartHour, setAddStartHour] = useState('08:00')
    const [addEndHour, setAddEndHour] = useState('20:00')
    const [editStartHour, setEditStartHour] = useState('08:00')
    const [editEndHour, setEditEndHour] = useState('20:00')
    const [addWorkOnHolidays, setAddWorkOnHolidays] = useState(false)
    const [editWorkOnHolidays, setEditWorkOnHolidays] = useState(false)
    const [addInheritHours, setAddInheritHours] = useState(true)
    const [editInheritHours, setEditInheritHours] = useState(true)

    const startEditing = (svc: any) => {
        setEditingService(svc)
        setEditIsSpecific(svc.isSpecific || false)
        setEditSpecies(svc.specieRestriction ? svc.specieRestriction.split(',') : [])
        try {
            setEditDays(JSON.parse(svc.operatingDays || '["mon","tue","wed","thu","fri","sat","sun"]'))
        } catch {
            setEditDays(['mon','tue','wed','thu','fri','sat','sun'])
        }
        let isInherited = false
        try {
            const hours = JSON.parse(svc.operatingHours || '{"start":"08:00","end":"20:00"}')
            setEditStartHour(hours.start || '08:00')
            setEditEndHour(hours.end || '20:00')
            if (hours.start === '00:00' && hours.end === '24:00') {
                isInherited = true
            }
        } catch {
            setEditStartHour('08:00')
            setEditEndHour('20:00')
        }
        setEditInheritHours(isInherited)
        setEditWorkOnHolidays(svc.workOnHolidays || false)
    }

    const startAdding = (estId: string) => {
        setShowForm(estId)
        setAddIsSpecific(false)
        setAddSpecies([])
        setAddDays(['mon','tue','wed','thu','fri','sat','sun'])
        setAddStartHour('08:00')
        setAddEndHour('20:00')
        setAddWorkOnHolidays(false)
        setAddInheritHours(true)
    }

    const toggleAddDay = (day: string) => {
        setAddDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
    }

    const toggleEditDay = (day: string) => {
        setEditDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
    }

    const loadData = useCallback(async () => {
        setLoading(true)
        const data = await getMyEstablishments()
        setEstablishments(data)
        setExpandedEst(prev => {
            if (data.length > 0 && !prev) return data[0].id
            return prev
        })
        setLoading(false)
    }, [])

    useEffect(() => { loadData() }, [loadData])

    async function handleAddService(formData: FormData) {
        setSaving(true)
        try {
            const res = await addService(formData)
            if (res && 'message' in res) {
                toast.error(res.message)
            } else {
                toast.success('Servicio agregado exitosamente')
                setShowForm(null)
                loadData()
            }
        } catch {
            toast.error('Error al agregar servicio')
        } finally {
            setSaving(false)
        }
    }

    async function handleEditService(formData: FormData) {
        setSaving(true)
        try {
            const res = await updateService(formData)
            if (res && 'message' in res) {
                toast.error(res.message)
            } else {
                toast.success('Servicio actualizado exitosamente')
                setEditingService(null)
                loadData()
            }
        } catch {
            toast.error('Error al actualizar servicio')
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

    if (loading) {
        return (
            <LoadingState 
                message="Cargando servicios..." 
                description="Cargando tu tarifario y horarios de atención"
                minHeight="min-h-[40vh]"
                size="md"
            />
        )
    }

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
                                    {est.type ? est.type.split(',').map((t: string) => {
                                        const c = t.trim();
                                        if (c === 'clinic' || c === 'hospital') return '🏥';
                                        if (c === 'groomer') return '✂️';
                                        if (c === 'walker') return '🦮';
                                        if (c === 'lodging') return '🏨';
                                        if (c === 'trainer') return '🎓';
                                        if (c === 'other') return '🐾';
                                        return '🏠';
                                    })[0] : '🏠'}
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
                                        editingService?.id === svc.id ? (
                                            <form key={svc.id} action={handleEditService} className="bg-primary-50 rounded-xl p-4 space-y-3 animate-in border border-primary-200">
                                                <input type="hidden" name="id" value={svc.id} />
                                                <div className="flex items-center gap-1.5 text-xs font-black text-primary-800 uppercase tracking-wider mb-1">
                                                     <Edit2 className="w-3.5 h-3.5" />
                                                     <span>Editar Servicio: {svc.name}</span>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-3 text-left">
                                                     <div className="col-span-2 flex flex-col gap-1">
                                                         <label className="text-xs font-bold text-slate-500">Nombre del Servicio</label>
                                                         <input name="name" required defaultValue={svc.name} placeholder="Nombre del servicio" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                                     </div>
                                                     <div className="flex flex-col gap-1">
                                                         <label className="text-xs font-bold text-slate-500">Precio (S/)</label>
                                                         <input name="price" type="number" step="0.5" required defaultValue={svc.price} placeholder="Precio (S/)" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full" />
                                                     </div>
                                                     <div className="flex flex-col gap-1">
                                                         <label className="text-xs font-bold text-slate-500">Duración (min)</label>
                                                         <input name="duration" type="number" defaultValue={svc.duration} placeholder="Duración (min)" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full" />
                                                     </div>
                                                     <div className="col-span-2 flex flex-col gap-1">
                                                         <label className="text-xs font-bold text-slate-500">Categoría</label>
                                                         <select name="category" defaultValue={svc.category} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                                             {SERVICE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                         </select>
                                                     </div>
                                                     <div className="col-span-2 flex flex-col gap-1">
                                                         <label className="text-xs font-bold text-slate-500">Descripción (opcional)</label>
                                                         <textarea name="description" defaultValue={svc.description || ''} placeholder="Descripción (opcional)" rows={2} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                                                     </div>

                                                     <div className="col-span-2 space-y-2.5 bg-white/70 p-3 rounded-lg border border-slate-200/80 mt-1">
                                                         <label className="flex items-center gap-2 text-xs font-bold text-slate-750 select-none cursor-pointer">
                                                             <input
                                                                 type="checkbox"
                                                                 name="isSpecific"
                                                                 value="true"
                                                                 checked={editIsSpecific}
                                                                 onChange={(e) => setEditIsSpecific(e.target.checked)}
                                                                 className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                                                             />
                                                             <span>⚙️ ¿Es un servicio específico? (Restringir especie, peso, etc.)</span>
                                                         </label>

                                                         {editIsSpecific && (
                                                             <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200 animate-in fade-in text-left">
                                                                 <div className="col-span-2 flex flex-col gap-1.5">
                                                                     <label className="text-xs font-bold text-slate-500">Especies elegibles (Selecciona una o más, o ninguna para todas)</label>
                                                                     <div className="flex flex-wrap gap-2 pt-1">
                                                                         {ALL_SPECIES.map((spec) => {
                                                                             const isChecked = editSpecies.includes(spec.value);
                                                                             return (
                                                                                 <label key={spec.value} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 select-none">
                                                                                     <input
                                                                                         type="checkbox"
                                                                                         checked={isChecked}
                                                                                         onChange={() => {
                                                                                             setEditSpecies(prev =>
                                                                                                 prev.includes(spec.value)
                                                                                                     ? prev.filter(v => v !== spec.value)
                                                                                                     : [...prev, spec.value]
                                                                                             )
                                                                                         }}
                                                                                         className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                                                                                     />
                                                                                     <span>{spec.label}</span>
                                                                                 </label>
                                                                             );
                                                                         })}
                                                                     </div>
                                                                     <input type="hidden" name="specieRestriction" value={editSpecies.join(',')} />
                                                                 </div>
                                                                 <div className="flex flex-col gap-1">
                                                                     <label className="text-xs font-bold text-slate-500">Peso Mínimo (kg)</label>
                                                                     <input
                                                                         type="number"
                                                                         step="0.1"
                                                                         name="minWeight"
                                                                         defaultValue={svc.minWeight !== null ? svc.minWeight : ''}
                                                                         placeholder="Ej: 5.0"
                                                                         className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                                     />
                                                                 </div>
                                                                 <div className="flex flex-col gap-1">
                                                                     <label className="text-xs font-bold text-slate-500">Peso Máximo (kg)</label>
                                                                     <input
                                                                         type="number"
                                                                         step="0.1"
                                                                         name="maxWeight"
                                                                         defaultValue={svc.maxWeight !== null ? svc.maxWeight : ''}
                                                                         placeholder="Ej: 20.0"
                                                                         className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                                     />
                                                                 </div>
                                                                 <div className="flex flex-col gap-1">
                                                                     <label className="text-xs font-bold text-slate-500">Edad Mínima (Años)</label>
                                                                     <input
                                                                         type="number"
                                                                         step="0.1"
                                                                         name="minAge"
                                                                         defaultValue={svc.minAge !== null ? svc.minAge : ''}
                                                                         placeholder="Ej: 0.5 (6 meses)"
                                                                         className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                                     />
                                                                 </div>
                                                                 <div className="flex flex-col gap-1">
                                                                     <label className="text-xs font-bold text-slate-500">Edad Máxima (Años)</label>
                                                                     <input
                                                                         type="number"
                                                                         step="0.1"
                                                                         name="maxAge"
                                                                         defaultValue={svc.maxAge !== null ? svc.maxAge : ''}
                                                                         placeholder="Ej: 10"
                                                                         className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                                     />
                                                                 </div>
                                                                 <div className="col-span-2 flex flex-col gap-1">
                                                                     <label className="text-xs font-bold text-slate-500">Restricción de Raza (Opcional)</label>
                                                                     <input
                                                                         type="text"
                                                                         name="breedRestriction"
                                                                         defaultValue={svc.breedRestriction || ''}
                                                                         placeholder="Ej: Pug, Beagle (dejar vacío para cualquier raza)"
                                                                         className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                                     />
                                                                 </div>
                                                                 <div className="col-span-2 flex flex-col gap-1">
                                                                     <label className="text-xs font-bold text-slate-500">Restricción de Edad / Nota (Opcional)</label>
                                                                     <input
                                                                         type="text"
                                                                         name="ageRestriction"
                                                                         defaultValue={svc.ageRestriction || ''}
                                                                         placeholder="Ej: Solo cachorros de hasta 6 meses"
                                                                         className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                                     />
                                                                 </div>
                                                             </div>
                                                         )}
                                                     </div>
                                                    
                                                    {/* Disponibilidad del Servicio */}
                                                    <div className="col-span-2 space-y-2 mt-2 bg-white/70 p-3 rounded-lg border border-slate-200/80">
                                                        <label className="text-xs font-bold text-slate-500 block">Días de Atención</label>
                                                        <input type="hidden" name="operatingDays" value={JSON.stringify(editDays)} />
                                                        <div className="flex flex-wrap gap-1">
                                                            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                                                                const isSelected = editDays.includes(day);
                                                                const label = { mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' }[day];
                                                                return (
                                                                    <button
                                                                        key={day}
                                                                        type="button"
                                                                        onClick={() => toggleEditDay(day)}
                                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                                            isSelected
                                                                                ? 'bg-primary-600 text-white shadow-sm'
                                                                                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-350'
                                                                        }`}
                                                                    >
                                                                        {label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-750 mt-1 select-none cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={editInheritHours}
                                                                onChange={(e) => {
                                                                    setEditInheritHours(e.target.checked)
                                                                    if (e.target.checked) {
                                                                        setEditStartHour('00:00')
                                                                        setEditEndHour('24:00')
                                                                    } else {
                                                                        setEditStartHour('08:00')
                                                                        setEditEndHour('20:00')
                                                                    }
                                                                }}
                                                                className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                                                            />
                                                            <span>Heredar horario de atención del local</span>
                                                        </label>

                                                        {!editInheritHours ? (
                                                            <div className="grid grid-cols-2 gap-2 pt-1.5">
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Hora Inicio</label>
                                                                    <input
                                                                        type="time"
                                                                        name="startHour"
                                                                        value={editStartHour}
                                                                        onChange={(e) => setEditStartHour(e.target.value)}
                                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Hora Fin</label>
                                                                    <input
                                                                        type="time"
                                                                        name="endHour"
                                                                        value={editEndHour}
                                                                        onChange={(e) => setEditEndHour(e.target.value)}
                                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <input type="hidden" name="startHour" value="00:00" />
                                                                <input type="hidden" name="endHour" value="24:00" />
                                                            </>
                                                        )}
                                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-750 mt-2 select-none cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="workOnHolidays"
                                                                value="true"
                                                                checked={editWorkOnHolidays}
                                                                onChange={(e) => setEditWorkOnHolidays(e.target.checked)}
                                                                className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                                                            />
                                                            <span>¿Atiende feriados / días de cierre del local?</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-1">
                                                    <p className="font-semibold">🔔 Aviso de cambio de precio:</p>
                                                    <p>Al guardar, los clientes con reservas activas recibirán una alerta del cambio de precio. No obstante, **se respetará la tarifa contratada originalmente** para sus reservas actuales.</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => setEditingService(null)} className="flex-1 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-white">Cancelar</button>
                                                    <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50">
                                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div key={svc.id} className="flex flex-col p-3 bg-slate-50 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <p className="text-sm font-medium text-slate-900 truncate">{svc.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="flex items-center gap-0.5 text-xs text-slate-500">
                                                                <Coins className="w-3 h-3 text-slate-400" /> {formatPEN(svc.price)}
                                                            </span>
                                                            <span className="flex items-center gap-0.5 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                                                                <Clock className="w-3 h-3 text-slate-400" /> {svc.duration} min
                                                            </span>
                                                            {(() => {
                                                                const cat = SERVICE_CATEGORIES.find(c => c.value === svc.category);
                                                                const label = cat?.label || svc.category;
                                                                
                                                                let colorClass = 'bg-slate-50 text-slate-600 border-slate-200';
                                                                switch (svc.category) {
                                                                    case 'consultation':
                                                                        colorClass = 'bg-blue-50/70 text-blue-700 border-blue-100';
                                                                        break;
                                                                    case 'vaccination':
                                                                        colorClass = 'bg-purple-50/70 text-purple-700 border-purple-100';
                                                                        break;
                                                                    case 'grooming':
                                                                        colorClass = 'bg-pink-50/70 text-pink-700 border-pink-100';
                                                                        break;
                                                                    case 'surgery':
                                                                        colorClass = 'bg-red-50/70 text-red-700 border-red-100';
                                                                        break;
                                                                    case 'deworming':
                                                                        colorClass = 'bg-amber-50/70 text-amber-700 border-amber-100';
                                                                        break;
                                                                    case 'test':
                                                                        colorClass = 'bg-teal-50/70 text-teal-700 border-teal-100';
                                                                        break;
                                                                    case 'walk':
                                                                        colorClass = 'bg-emerald-50/70 text-emerald-700 border-emerald-100';
                                                                        break;
                                                                    case 'bath':
                                                                        colorClass = 'bg-cyan-50/70 text-cyan-700 border-cyan-100';
                                                                        break;
                                                                }
                                                                
                                                                return (
                                                                    <>
                                                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorClass} uppercase tracking-wider`}>
                                                                        <Tag className="w-2.5 h-2.5" /> {label}
                                                                    </span>
                                                                    {svc.isSpecific && (
                                                                        <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border border-rose-250 bg-rose-50 text-rose-800 uppercase tracking-wider">
                                                                            ⚙️ Específico
                                                                        </span>
                                                                    )}
                                                                    {svc.isSpecific && svc.specieRestriction && svc.specieRestriction.split(',').filter(Boolean).map((spec: string) => {
                                                                        const label = spec === 'dog' ? '🐕 Solo Perros' : spec === 'cat' ? '🐈 Solo Gatos' : `🐾 Solo ${SPECIES_LABELS[spec as keyof typeof SPECIES_LABELS] || spec}`;
                                                                        return (
                                                                            <span key={spec} className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-250 bg-blue-50 text-blue-800 capitalize tracking-wider">
                                                                                {label}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                    {svc.isSpecific && (svc.minWeight !== null || svc.maxWeight !== null) && (
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-250 bg-amber-50 text-amber-800 tracking-wider">
                                                                            ⚖️ {svc.minWeight !== null ? `${svc.minWeight}kg` : '0'} a {svc.maxWeight !== null ? `${svc.maxWeight}kg` : '∞'}
                                                                        </span>
                                                                    )}
                                                                    {svc.isSpecific && (svc.minAge !== null || svc.maxAge !== null) && (
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border border-violet-250 bg-violet-50 text-violet-800 tracking-wider">
                                                                            ⏱️ {svc.minAge !== null ? `${svc.minAge} ${svc.minAge === 1 ? 'año' : 'años'}` : '0'} a {svc.maxAge !== null ? `${svc.maxAge} ${svc.maxAge === 1 ? 'año' : 'años'}` : '∞'}
                                                                        </span>
                                                                    )}
                                                                    </>
                                                                )
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button onClick={() => startEditing(svc)} className="p-2 text-slate-400 hover:text-primary-600 transition-colors" title="Editar">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(svc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {svc.description && <p className="text-xs text-slate-500 bg-white/50 p-2 rounded-lg leading-relaxed">{svc.description}</p>}
                                                
                                                {/* Disponibilidad inline en la tarjeta */}
                                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-white/70 p-2 rounded-lg border border-slate-100 text-[10px] text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        📅 {(() => {
                                                            try {
                                                                const days = JSON.parse(svc.operatingDays || '[]');
                                                                const dayLabels = { mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' };
                                                                if (days.length === 7) return 'Lunes a Domingo';
                                                                if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) return 'Lunes a Viernes';
                                                                return days.map((d: keyof typeof dayLabels) => dayLabels[d] || d).join(', ');
                                                            } catch { return 'Lunes a Domingo'; }
                                                        })()}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-350" />
                                                    <span className="flex items-center gap-1">
                                                        ⏱️ {(() => {
                                                            try {
                                                                const hours = JSON.parse(svc.operatingHours || '{}');
                                                                return `${hours.start || '08:00'} - ${hours.end || '20:00'}`;
                                                            } catch { return '08:00 - 20:00'; }
                                                        })()}
                                                    </span>
                                                    {svc.workOnHolidays && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-slate-350" />
                                                            <span className="text-[9px] font-black text-emerald-800 bg-emerald-100/70 border border-emerald-200/50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                                Atiende Feriados
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {svc.tariffUpdatedAt && (
                                                    <div className="text-[9px] text-slate-400 pl-1">
                                                        Tarifa actualizada: {new Date(svc.tariffUpdatedAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ))
                                )}
 
                                {/* Add Service Form */}
                                {showForm === est.id ? (
                                    <form action={handleAddService} className="bg-primary-50 rounded-xl p-4 space-y-3 animate-in border border-primary-150">
                                        <input type="hidden" name="establishmentId" value={est.id} />
                                        <div className="grid grid-cols-2 gap-3 text-left">
                                             <div className="col-span-2 flex flex-col gap-1">
                                                 <label className="text-xs font-bold text-slate-500">Nombre del Servicio</label>
                                                 <input name="name" required placeholder="Nombre del servicio" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                             </div>
                                             <div className="flex flex-col gap-1">
                                                 <label className="text-xs font-bold text-slate-500">Precio (S/)</label>
                                                 <input name="price" type="number" step="0.5" required placeholder="Precio (S/)" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full" />
                                             </div>
                                             <div className="flex flex-col gap-1">
                                                 <label className="text-xs font-bold text-slate-500">Duración (min)</label>
                                                 <input name="duration" type="number" placeholder="Duración (min)" defaultValue="30" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full" />
                                             </div>
                                             <div className="col-span-2 flex flex-col gap-1">
                                                 <label className="text-xs font-bold text-slate-500">Categoría</label>
                                                 <select name="category" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                                     {SERVICE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                 </select>
                                             </div>
                                             <div className="col-span-2 flex flex-col gap-1">
                                                 <label className="text-xs font-bold text-slate-500">Descripción (opcional)</label>
                                                 <textarea name="description" placeholder="Descripción (opcional)" rows={2} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                                             </div>

                                             <div className="col-span-2 space-y-2.5 bg-white/70 p-3 rounded-lg border border-slate-200/80 mt-1">
                                                 <label className="flex items-center gap-2 text-xs font-bold text-slate-750 select-none cursor-pointer">
                                                     <input
                                                         type="checkbox"
                                                         name="isSpecific"
                                                         value="true"
                                                         checked={addIsSpecific}
                                                         onChange={(e) => setAddIsSpecific(e.target.checked)}
                                                         className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                                                     />
                                                     <span>⚙️ ¿Es un servicio específico? (Restringir especie, peso, etc.)</span>
                                                 </label>

                                                 {addIsSpecific && (
                                                     <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200 animate-in fade-in text-left">
                                                         <div className="col-span-2 flex flex-col gap-1.5">
                                                             <label className="text-xs font-bold text-slate-500">Especies elegibles (Selecciona una o más, o ninguna para todas)</label>
                                                             <div className="flex flex-wrap gap-2 pt-1">
                                                                 {ALL_SPECIES.map((spec) => {
                                                                     const isChecked = addSpecies.includes(spec.value);
                                                                     return (
                                                                         <label key={spec.value} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 select-none">
                                                                             <input
                                                                                 type="checkbox"
                                                                                 checked={isChecked}
                                                                                 onChange={() => {
                                                                                     setAddSpecies(prev =>
                                                                                         prev.includes(spec.value)
                                                                                             ? prev.filter(v => v !== spec.value)
                                                                                             : [...prev, spec.value]
                                                                                     )
                                                                                 }}
                                                                                 className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                                                                             />
                                                                             <span>{spec.label}</span>
                                                                         </label>
                                                                     );
                                                                 })}
                                                             </div>
                                                             <input type="hidden" name="specieRestriction" value={addSpecies.join(',')} />
                                                         </div>
                                                         <div className="flex flex-col gap-1">
                                                             <label className="text-xs font-bold text-slate-500">Peso Mínimo (kg)</label>
                                                             <input
                                                                 type="number"
                                                                 step="0.1"
                                                                 name="minWeight"
                                                                 placeholder="Ej: 5.0"
                                                                 className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                             />
                                                         </div>
                                                         <div className="flex flex-col gap-1">
                                                             <label className="text-xs font-bold text-slate-500">Peso Máximo (kg)</label>
                                                             <input
                                                                 type="number"
                                                                 step="0.1"
                                                                 name="maxWeight"
                                                                 placeholder="Ej: 20.0"
                                                                 className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                             />
                                                         </div>
                                                         <div className="flex flex-col gap-1">
                                                             <label className="text-xs font-bold text-slate-500">Edad Mínima (Años)</label>
                                                             <input
                                                                 type="number"
                                                                 step="0.1"
                                                                 name="minAge"
                                                                 placeholder="Ej: 0.5 (6 meses)"
                                                                 className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                             />
                                                         </div>
                                                         <div className="flex flex-col gap-1">
                                                             <label className="text-xs font-bold text-slate-500">Edad Máxima (Años)</label>
                                                             <input
                                                                 type="number"
                                                                 step="0.1"
                                                                 name="maxAge"
                                                                 placeholder="Ej: 10"
                                                                 className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                             />
                                                         </div>
                                                         <div className="col-span-2 flex flex-col gap-1">
                                                             <label className="text-xs font-bold text-slate-500">Restricción de Raza (Opcional)</label>
                                                             <input
                                                                 type="text"
                                                                 name="breedRestriction"
                                                                 placeholder="Ej: Pug, Beagle (dejar vacío para cualquier raza)"
                                                                 className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                             />
                                                         </div>
                                                         <div className="col-span-2 flex flex-col gap-1">
                                                             <label className="text-xs font-bold text-slate-500">Restricción de Edad / Nota (Opcional)</label>
                                                             <input
                                                                 type="text"
                                                                 name="ageRestriction"
                                                                 placeholder="Ej: Solo cachorros"
                                                                 className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none font-medium"
                                                             />
                                                         </div>
                                                     </div>
                                                 )}
                                             </div>
                                            
                                            {/* Disponibilidad del Servicio */}
                                            <div className="col-span-2 space-y-2 mt-2 bg-white/70 p-3 rounded-lg border border-slate-200/80">
                                                <label className="text-xs font-bold text-slate-500 block">Días de Atención</label>
                                                <input type="hidden" name="operatingDays" value={JSON.stringify(addDays)} />
                                                <div className="flex flex-wrap gap-1">
                                                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                                                        const isSelected = addDays.includes(day);
                                                        const label = { mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' }[day];
                                                        return (
                                                            <button
                                                                key={day}
                                                                type="button"
                                                                onClick={() => toggleAddDay(day)}
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                                    isSelected
                                                                        ? 'bg-primary-600 text-white shadow-sm'
                                                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-350'
                                                                }`}
                                                            >
                                                                {label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-750 mt-1 select-none cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={addInheritHours}
                                                        onChange={(e) => {
                                                            setAddInheritHours(e.target.checked)
                                                            if (e.target.checked) {
                                                                setAddStartHour('00:00')
                                                                setAddEndHour('24:00')
                                                            } else {
                                                                setAddStartHour('08:00')
                                                                setAddEndHour('20:00')
                                                            }
                                                        }}
                                                        className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                                                    />
                                                    <span>Heredar horario de atención del local</span>
                                                </label>

                                                {!addInheritHours ? (
                                                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Hora Inicio</label>
                                                            <input
                                                                type="time"
                                                                name="startHour"
                                                                value={addStartHour}
                                                                onChange={(e) => setAddStartHour(e.target.value)}
                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Hora Fin</label>
                                                            <input
                                                                type="time"
                                                                name="endHour"
                                                                value={addEndHour}
                                                                onChange={(e) => setAddEndHour(e.target.value)}
                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <input type="hidden" name="startHour" value="00:00" />
                                                        <input type="hidden" name="endHour" value="24:00" />
                                                    </>
                                                )}

                                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-750 mt-2 select-none cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="workOnHolidays"
                                                        value="true"
                                                        checked={addWorkOnHolidays}
                                                        onChange={(e) => setAddWorkOnHolidays(e.target.checked)}
                                                        className="rounded border-slate-350 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                                                    />
                                                    <span>¿Atiende feriados / días de cierre del local?</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button type="button" onClick={() => setShowForm(null)} className="flex-1 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-white">Cancelar</button>
                                            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50">
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => startAdding(est.id)}
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
