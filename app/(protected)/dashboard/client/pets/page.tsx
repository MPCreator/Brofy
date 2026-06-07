'use client'

import { useState, useEffect } from 'react'
import { getUserPets, addPet, updatePet, deletePet } from '@/lib/actions'
import { SPECIES_OPTIONS, SPECIES_LABELS } from '@/lib/types'
import Link from 'next/link'
import {
    PawPrint, Plus, ChevronRight, Calendar, Weight, Pencil, Trash2, X, Save, Loader2, Camera
} from 'lucide-react'
import { toast } from 'sonner'
import SafeImage from '@/components/ui/SafeImage'

type PetForm = {
    id?: string
    name: string
    species: string
    breed: string
    dateOfBirth: string
    weight: string
    sex: string
    photoUrl?: string
    cuh?: string
}

export default function PetsPage() {
    const [pets, setPets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingPet, setEditingPet] = useState<PetForm | null>(null)
    const [saving, setSaving] = useState(false)
    
    // Photo preview and base64 upload states
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [photoBase64, setPhotoBase64] = useState<string | null>(null)

    useEffect(() => { loadPets() }, [])

    async function loadPets() {
        setLoading(true)
        const data = await getUserPets()
        setPets(data)
        setLoading(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 4 * 1024 * 1024) {
            toast.error('La foto de la mascota no debe superar los 4MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setPhotoPreview(base64String)
            setPhotoBase64(base64String)
        }
        reader.readAsDataURL(file)
    }

    function startEdit(pet: any) {
        setEditingPet({
            id: pet.id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed || '',
            dateOfBirth: pet.dateOfBirth || '',
            weight: pet.weight?.toString() || '',
            sex: pet.sex || 'unknown',
            photoUrl: pet.photoUrl || undefined,
            cuh: pet.cuh,
        })
        setPhotoPreview(pet.photoUrl || null)
        setPhotoBase64(null)
        setShowForm(true)
    }

    function startAdd() {
        setEditingPet(null)
        setPhotoPreview(null)
        setPhotoBase64(null)
        setShowForm(true)
    }

    async function handleSubmit(formData: FormData) {
        setSaving(true)
        try {
            if (photoBase64) {
                formData.set('photoBase64', photoBase64)
            }
            if (editingPet?.id) {
                formData.set('id', editingPet.id)
                await updatePet(formData)
                toast.success('Mascota actualizada correctamente')
            } else {
                await addPet(formData)
                toast.success('Mascota agregada correctamente')
            }
            setShowForm(false)
            setEditingPet(null)
            setPhotoPreview(null)
            setPhotoBase64(null)
            loadPets()
        } catch {
            toast.error('Error al guardar la información de la mascota')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(pet: any) {
        if (!confirm(`¿Eliminar a ${pet.name}? Esta acción no se puede deshacer.`)) return
        await deletePet(pet.id)
        toast.success('Mascota eliminada')
        loadPets()
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {!showForm && (
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Mis Mascotas</h1>
                    <button onClick={startAdd} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-colors shadow-md">
                        <Plus className="w-4 h-4" /> Agregar
                    </button>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <form action={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 animate-in">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">
                            {editingPet?.id ? '✏️ Editar mascota' : '✨ Nueva mascota'}
                            {editingPet?.cuh && (
                                <span className="block text-[10px] font-mono font-extrabold text-primary-700 bg-primary-50/70 border border-primary-100 px-2 py-0.5 rounded-md mt-1 w-max">
                                    🐾 CUH: {editingPet.cuh}
                                </span>
                            )}
                        </h3>
                        <button type="button" onClick={() => { setShowForm(false); setEditingPet(null) }} className="p-1 text-slate-400 hover:text-slate-650"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Interactive Pet Image Upload */}
                    <div className="flex flex-col items-center gap-2 py-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden transition-all shadow-sm">
                                <SafeImage
                                    src={photoPreview || ''}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    fallback={<PawPrint className="w-12 h-12 text-slate-300" />}
                                />
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center cursor-pointer shadow-md transition-all">
                                <Camera className="w-4 h-4" />
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Haz clic para {photoPreview ? 'cambiar' : 'subir'} foto de tu mascota</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input name="name" defaultValue={editingPet?.name || ''} required placeholder="Nombre de la mascota" className="col-span-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" />
                        <select name="species" defaultValue={editingPet?.species || 'dog'} className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium">
                            {SPECIES_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <select name="sex" defaultValue={editingPet?.sex || 'unknown'} className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium">
                            <option value="male">♂ Macho</option>
                            <option value="female">♀ Hembra</option>
                            <option value="unknown">Desconocido</option>
                        </select>
                        <input name="breed" defaultValue={editingPet?.breed || ''} placeholder="Raza (ej: Beagle)" className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" />
                        <input name="weight" type="number" step="0.1" defaultValue={editingPet?.weight || ''} placeholder="Peso (kg)" className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" />
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha de nacimiento</label>
                            <input name="dateOfBirth" type="date" defaultValue={editingPet?.dateOfBirth || ''} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" />
                        </div>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                        <button type="button" onClick={() => { setShowForm(false); setEditingPet(null) }} className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancelar</button>
                        <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editingPet?.id ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            )}

            {/* Pet Cards */}
            {!showForm && (
                pets.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                        <PawPrint className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-slate-900 mb-1">Sin mascotas registradas</h2>
                        <p className="text-sm text-slate-500 mb-4">Agrega tu primera mascota para comenzar</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pets.map(pet => (
                            <div key={pet.id} className="bg-white rounded-3xl border border-slate-100 p-5 hover:border-primary-200 hover:shadow-card transition-all flex flex-col justify-between">
                                <div className="flex items-start gap-4">
                                    <Link href={`/dashboard/client/carnet/${pet.id}`} className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                        <SafeImage
                                            src={pet.photoUrl || ''}
                                            alt={pet.name}
                                            className="w-full h-full object-cover"
                                            fallback={
                                                <span className="text-3xl">
                                                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : pet.species === 'bird' ? '🐦' : '🐾'}
                                                </span>
                                            }
                                        />
                                    </Link>
                                    <Link href={`/dashboard/client/carnet/${pet.id}`} className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-600 transition-colors">{pet.name}</h3>
                                        <p className="text-xs font-semibold text-slate-500 capitalize mt-0.5">
                                            {SPECIES_LABELS[pet.species as keyof typeof SPECIES_LABELS] || pet.species}{pet.breed ? ` · ${pet.breed}` : ''}{pet.sex && pet.sex !== 'unknown' ? ` · ${pet.sex === 'male' ? '♂' : '♀'}` : ''}
                                        </p>
                                        {pet.cuh && (
                                            <span className="block text-[10px] font-mono font-bold text-primary-700 bg-primary-50/70 border border-primary-100 px-2 py-0.5 rounded-md mt-1 w-max">
                                                🐾 CUH: {pet.cuh}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-3 mt-2.5">
                                            {pet.weight && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                                    <Weight className="w-3.5 h-3.5" /> {pet.weight} kg
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                                <Calendar className="w-3.5 h-3.5" /> {pet.medicalHistory?.length || 0} atenciones
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-50 mt-4 pt-3">
                                    <Link href={`/dashboard/client/carnet/${pet.id}`} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                        Ver carnet <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => startEdit(pet)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors" title="Editar">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(pet)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    )
}
