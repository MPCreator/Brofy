import { requireRole } from '@/lib/auth'
import { getPetById, getMedicalHistory } from '@/lib/actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Syringe,
    Stethoscope,
    Scissors,
    Bug,
    TestTube,
    PawPrint,
    Calendar,
    Weight,
    Heart,
    Thermometer,
    Pill,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { MedicalHistoryEntry, MedicalEventType } from '@/lib/types'

const eventTypeConfig: Record<MedicalEventType, { icon: typeof Syringe; color: string; label: string }> = {
    vaccination: { icon: Syringe, color: 'text-blue-600 bg-blue-100', label: 'Vacunación' },
    consultation: { icon: Stethoscope, color: 'text-emerald-600 bg-emerald-100', label: 'Consulta' },
    surgery: { icon: Heart, color: 'text-red-600 bg-red-100', label: 'Cirugía' },
    deworming: { icon: Bug, color: 'text-amber-600 bg-amber-100', label: 'Desparasitación' },
    test: { icon: TestTube, color: 'text-purple-600 bg-purple-100', label: 'Examen' },
    grooming: { icon: Scissors, color: 'text-pink-600 bg-pink-100', label: 'Grooming' },
}

export default async function CarnetPage({
    params,
}: {
    params: { petId: string }
}) {
    await requireRole(['client'])
    const pet = await getPetById(params.petId)
    if (!pet) notFound()

    const medicalRecords = await getMedicalHistory(params.petId)

    // Combine medical_history JSONB with medical_records from appointments
    const timeline: Array<MedicalHistoryEntry & { fromRecord?: boolean; recordData?: (typeof medicalRecords)[0] }> = [
        ...(Array.isArray(pet.medicalHistory) ? pet.medicalHistory : []).map((entry: any) => ({ ...entry, fromRecord: false as const })),
    ]

    // Add medical records as timeline entries
    for (const record of medicalRecords) {
        timeline.push({
            date: new Date(record.createdAt).toISOString().split('T')[0],
            type: 'consultation',
            description: record.diagnosis || 'Consulta',
            provider: (record.vet as { fullName: string })?.fullName,
            notes: record.prescription || undefined,
            fromRecord: true,
            recordData: record,
        })
    }

    // Sort by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard/client/pets"
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Carnet de {pet.name}</h1>
                    <p className="text-sm text-slate-500">Historial médico digital</p>
                </div>
            </div>

            {/* Pet Info Card */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{pet.name}</h2>
                        <p className="text-sm opacity-80 capitalize">
                            {pet.species} {pet.breed ? `· ${pet.breed}` : ''} {pet.sex ? `· ${pet.sex === 'male' ? '♂' : '♀'}` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 mt-4">
                    {pet.weight && (
                        <div className="bg-white/10 rounded-lg px-3 py-1.5 text-sm">
                            <span className="opacity-70">Peso</span>
                            <span className="ml-1 font-semibold">{pet.weight} kg</span>
                        </div>
                    )}
                    {pet.dateOfBirth && (
                        <div className="bg-white/10 rounded-lg px-3 py-1.5 text-sm">
                            <span className="opacity-70">Nacimiento</span>
                            <span className="ml-1 font-semibold">{formatDate(pet.dateOfBirth)}</span>
                        </div>
                    )}
                    {pet.microchipId && (
                        <div className="bg-white/10 rounded-lg px-3 py-1.5 text-sm">
                            <span className="opacity-70">Chip</span>
                            <span className="ml-1 font-semibold">{pet.microchipId}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Línea de Tiempo</h2>

                {timeline.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                        <PawPrint className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No hay registros médicos aún</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

                        <div className="space-y-4">
                            {timeline.map((entry, idx) => {
                                const config = eventTypeConfig[entry.type] || eventTypeConfig.consultation
                                const Icon = config.icon

                                return (
                                    <div key={idx} className="relative flex gap-4">
                                        {/* Icon dot */}
                                        <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>

                                        {/* Content card */}
                                        <div className="flex-1 bg-white rounded-xl border border-slate-100 p-4 hover:shadow-card transition-shadow">
                                            <div className="flex items-start justify-between mb-1">
                                                <div>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                    <p className="text-sm font-medium text-slate-900 mt-1.5">
                                                        {entry.description}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(entry.date)}
                                                </span>
                                            </div>

                                            {entry.provider && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Dr. {entry.provider}
                                                </p>
                                            )}

                                            {/* Expanded details for medical records */}
                                            {entry.fromRecord && entry.recordData && (
                                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                                    {entry.recordData.weight && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                            <Weight className="w-3.5 h-3.5 text-slate-400" />
                                                            Peso: {entry.recordData.weight} kg
                                                        </div>
                                                    )}
                                                    {entry.recordData.temperature && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                            <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                                                            Temp: {entry.recordData.temperature}°C
                                                        </div>
                                                    )}
                                                    {entry.recordData.prescription && (
                                                        <div className="flex items-start gap-2 text-xs text-slate-600">
                                                            <Pill className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                                            <span>{entry.recordData.prescription}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {entry.notes && !entry.fromRecord && (
                                                <p className="text-xs text-slate-500 mt-2 italic">
                                                    {entry.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
