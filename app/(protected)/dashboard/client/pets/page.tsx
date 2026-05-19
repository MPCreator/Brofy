'use client'

import { useState, useEffect } from 'react'
import { getUserPets, addPet, updatePet, deletePet } from '@/lib/actions'
import { SPECIES_OPTIONS } from '@/lib/types'
import Link from 'next/link'
import {
    PawPrint, Plus, ChevronRight, Calendar, Weight, Pencil, Trash2, X, Save, Loader2
} from 'lucide-react'

type PetForm = {
    id?: string
    name: string
    species: string
    breed: string
    dateOfBirth: string
    weight: string
    sex: string
}

const emptyForm: PetForm = { name: '', species: 'dog', breed: '', dateOfBirth: '', weight: '', sex: 'unknown' }

export default function PetsPage() {
    const [pets, setPets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingPet, setEditingPet] = useState<PetForm | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => { loadPets() }, [])

    async function loadPets() {
        setLoading(true)
        const data = await getUserPets()
        setPets(data)
        setLoading(false)
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
        })
        setShowForm(true)
    }

    function startAdd() {
        setEditingPet(null)
        setShowForm(true)
    }

    async function handleSubmit(formData: FormData) {
        setSaving(true)
        if (editingPet?.id) {
            formData.set('id', editingPet.id)
            await updatePet(formData)
        } else {
            await addPet(formData)
        }
        setSaving(false)
        setShowForm(false)
        setEditingPet(null)
        loadPets()
    }

    async function handleDelete(pet: any) {
        if (!confirm(`¿Eliminar a ${pet.name}? Esta acción no se puede deshacer.`)) return
        await deletePet(pet.id)
        loadPets()
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Mis Mascotas</h1>
                <button onClick={startAdd} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-colors shadow-md">
                    <Plus className="w-4 h-4" /> Agregar
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <form action={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-in">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-900">{editingPet?.id ? 'Editar mascota' : 'Nueva mascota'}</h3>
                        <button type="button" onClick={() => { setShowForm(false); setEditingPet(null) }} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input name="name" defaultValue={editingPet?.name || ''} required placeholder="Nombre" className="col-span-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <select name="species" defaultValue={editingPet?.species || 'dog'} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            {SPECIES_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <select name="sex" defaultValue={editingPet?.sex || 'unknown'} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="male">♂ Macho</option>
                            <option value="female">♀ Hembra</option>
                            <option value="unknown">Desconocido</option>
                        </select>
                        <input name="breed" defaultValue={editingPet?.breed || ''} placeholder="Raza (opcional)" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input name="weight" type="number" step="0.1" defaultValue={editingPet?.weight || ''} placeholder="Peso kg" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input name="dateOfBirth" type="date" defaultValue={editingPet?.dateOfBirth || ''} className="col-span-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => { setShowForm(false); setEditingPet(null) }} className="flex-1 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
                        <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editingPet?.id ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            )}

            {/* Pet Cards */}
            {pets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <PawPrint className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">Sin mascotas registradas</h2>
                    <p className="text-sm text-slate-500 mb-4">Agrega tu primera mascota para comenzar</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pets.map(pet => (
                        <div key={pet.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-primary-200 hover:shadow-card transition-all">
                            <div className="flex items-center gap-4">
                                <Link href={`/dashboard/client/carnet/${pet.id}`} className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0">
                                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : pet.species === 'bird' ? '🐦' : '🐾'}
                                </Link>
                                <Link href={`/dashboard/client/carnet/${pet.id}`} className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900">{pet.name}</h3>
                                    <p className="text-xs text-slate-500 capitalize">
                                        {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}{pet.sex && pet.sex !== 'unknown' ? ` · ${pet.sex === 'male' ? '♂' : '♀'}` : ''}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        {pet.weight && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <Weight className="w-3 h-3" /> {pet.weight} kg
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Calendar className="w-3 h-3" /> {pet.medicalHistory?.length || 0} registros
                                        </span>
                                    </div>
                                </Link>
                                <div className="flex flex-col gap-1 flex-shrink-0">
                                    <button onClick={() => startEdit(pet)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Editar">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(pet)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
