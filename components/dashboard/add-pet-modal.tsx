'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { addPet } from '@/lib/actions'
import { Loader2, Plus, Dog, Cat } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AddPetModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AddPetModal({ isOpen, onClose }: AddPetModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await addPet(formData)

        if (result?.errors) {
            setError("Verifica los campos.")
        } else if (result?.message && !result.success) {
            setError(result.message)
        } else if (result?.success) {
            onClose()
            router.refresh()
        }

        setIsLoading(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nueva Mascota">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        ⚠️ {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                    <input required name="name" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Ej. Firulais" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Especie</label>
                        <select name="species" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                            <option value="DOG">Perro</option>
                            <option value="CAT">Gato</option>
                            <option value="OTHER">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Edad (años)</label>
                        <input required name="age" type="number" min="0" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej. 3" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Raza (Opcional)</label>
                    <input name="breed" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej. Labrador" />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button disabled={isLoading} type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Guardar Mascota
                    </button>
                </div>
            </form>
        </Modal>
    )
}
