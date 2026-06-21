'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'

interface ClientPetsListProps {
    pets: any[]
    speciesLabels: Record<string, string>
}

export function ClientPetsList({ pets, speciesLabels }: ClientPetsListProps) {
    const router = useRouter()
    const [loadingPetId, setLoadingPetId] = useState<string | null>(null)

    const handlePetClick = (petId: string) => {
        setLoadingPetId(petId)
        router.push(`/dashboard/client/carnet/${petId}`)
    }

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {pets.slice(0, 4).map((pet: any) => {
                const isLoading = loadingPetId === pet.id
                return (
                    <button
                        key={pet.id}
                        onClick={() => handlePetClick(pet.id)}
                        disabled={loadingPetId !== null}
                        className="flex-shrink-0 w-36 bg-white rounded-2xl border border-slate-100 p-4 hover:border-primary-200 hover:shadow-card transition-all text-left group disabled:opacity-85 outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                        <div className="relative w-12 h-12 rounded-full bg-primary-50 border border-primary-100/50 flex items-center justify-center mb-3 text-2xl overflow-hidden">
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                            ) : (
                                <SafeImage
                                    src={pet.photoUrl || ''}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                    fallback={
                                        <span>
                                            {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                                        </span>
                                    }
                                />
                            )}
                        </div>
                        <p className="font-semibold text-sm text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                            {pet.name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                            {speciesLabels[pet.species as keyof typeof speciesLabels] || pet.species}
                        </p>
                    </button>
                )
            })}
            <Link
                href="/dashboard/client/pets"
                className="flex-shrink-0 w-36 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
            >
                <Plus className="w-8 h-8 mb-1" />
                <span className="text-xs font-medium">Agregar</span>
            </Link>
        </div>
    )
}

