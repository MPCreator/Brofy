'use client'

import { useState } from 'react'
import {
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
    Activity,
    CheckCircle2,
    FileText,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { SPECIES_LABELS } from '@/lib/types'
import type { MedicalHistoryEntry, MedicalEventType } from '@/lib/types'
import SafeImage from '@/components/ui/SafeImage'

const eventTypeConfig: Record<MedicalEventType, { icon: typeof Syringe; color: string; bg: string; label: string }> = {
    vaccination: { icon: Syringe, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', label: 'Vacunación' },
    consultation: { icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', label: 'Consulta' },
    surgery: { icon: Heart, color: 'text-red-600', bg: 'bg-red-50 border-red-100', label: 'Cirugía' },
    deworming: { icon: Bug, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', label: 'Desparasitación' },
    test: { icon: TestTube, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', label: 'Examen' },
    grooming: { icon: Scissors, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-100', label: 'Grooming' },
}

interface TimelineEntry extends MedicalHistoryEntry {
    fromRecord?: boolean
    recordData?: any
}

interface CarnetClientProps {
    pet: any
    timeline: TimelineEntry[]
}

type TabType = 'historial' | 'vacunas' | 'diagnosticos' | 'tratamientos'

export default function CarnetClient({ pet, timeline }: CarnetClientProps) {
    const [activeTab, setActiveTab] = useState<TabType>('historial')

    // 1. Historial (All entries)
    const historyEntries = timeline

    // 2. Vacunas (Deworming or vaccination events)
    const vaccineEntries = timeline.filter(entry => 
        entry.type === 'vaccination' || 
        entry.type === 'deworming' ||
        entry.description.toLowerCase().includes('vacuna') ||
        entry.description.toLowerCase().includes('desparasit') ||
        entry.notes?.toLowerCase().includes('vacuna') ||
        entry.notes?.toLowerCase().includes('desparasit')
    )

    // 3. Diagnósticos (Entries with actual clinical diagnosis details)
    const diagnosisEntries = timeline.filter(entry => 
        entry.fromRecord || 
        entry.type === 'surgery' || 
        entry.type === 'test' ||
        (entry.description && entry.description !== 'Consulta' && entry.description !== 'Servicio')
    )

    // 4. Tratamientos (Entries indicating active prescriptions, next controls or treatment details)
    const treatmentEntries = timeline.filter(entry => 
        entry.notes || 
        entry.recordData?.prescription || 
        entry.recordData?.treatment || 
        entry.recordData?.nextVisit
    )

    const tabsList: Array<{ id: TabType; label: string; count: number; icon: any }> = [
        { id: 'historial', label: 'Historial', count: historyEntries.length, icon: Activity },
        { id: 'vacunas', label: 'Vacunas', count: vaccineEntries.length, icon: Syringe },
        { id: 'diagnosticos', label: 'Diagnósticos', count: diagnosisEntries.length, icon: Stethoscope },
        { id: 'tratamientos', label: 'Tratamientos', count: treatmentEntries.length, icon: Pill },
    ]

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
                    <p className="text-sm text-slate-500">Historial médico digital e interactivo</p>
                </div>
            </div>

            {/* Pet Info Card */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                    <PawPrint className="w-48 h-48" />
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl overflow-hidden shadow-inner shrink-0">
                        <SafeImage
                            src={pet.photoUrl || ''}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                            fallback={
                                <span>{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}</span>
                            }
                        />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 text-white px-2 py-0.5 rounded-md">Carnet Vital</span>
                        <h2 className="text-2xl font-black mt-1">{pet.name}</h2>
                        <p className="text-sm opacity-90 capitalize font-medium">
                            {SPECIES_LABELS[pet.species as keyof typeof SPECIES_LABELS] || pet.species} {pet.breed ? `· ${pet.breed}` : ''} {pet.sex ? `· ${pet.sex === 'male' ? '♂ Macho' : '♀ Hembra'}` : ''}
                        </p>
                        {pet.cuh && (
                            <span className="inline-block text-[10px] font-mono font-extrabold bg-white text-primary-700 px-2.5 py-0.5 rounded-md mt-2 shadow-sm">
                                🐾 CUH: {pet.cuh}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-white/10 relative z-10 text-center">
                    <div className="bg-white/10 rounded-xl px-2 py-2">
                        <span className="opacity-70 text-[10px] block font-semibold uppercase">Peso</span>
                        <span className="font-extrabold text-sm block mt-0.5">{pet.weight ? `${pet.weight} kg` : '—'}</span>
                    </div>
                    <div className="bg-white/10 rounded-xl px-2 py-2">
                        <span className="opacity-70 text-[10px] block font-semibold uppercase">Nacimiento</span>
                        <span className="font-extrabold text-xs block mt-1">{pet.dateOfBirth ? formatDate(pet.dateOfBirth) : '—'}</span>
                    </div>
                    <div className="bg-white/10 rounded-xl px-2 py-2">
                        <span className="opacity-70 text-[10px] block font-semibold uppercase">Consultas</span>
                        <span className="font-extrabold text-sm block mt-0.5">{timeline.length}</span>
                    </div>
                </div>
            </div>

            {/* Interactive Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-1">
                {tabsList.map(tab => {
                    const TabIcon = tab.icon
                    const isSelected = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                                isSelected
                                    ? 'border-primary-600 text-primary-600 bg-primary-50/20'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                            }`}
                        >
                            <TabIcon className="w-4 h-4" />
                            {tab.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Tab Contents */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'historial' && (
                    historyEntries.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                            <PawPrint className="w-12 h-12 text-slate-200 mx-auto mb-3 animate-bounce" />
                            <p className="text-sm font-semibold text-slate-500">No hay registros médicos registrados</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
                            <div className="space-y-4">
                                {historyEntries.map((entry, idx) => {
                                    const config = eventTypeConfig[entry.type] || eventTypeConfig.consultation
                                    const Icon = config.icon

                                    return (
                                        <div key={idx} className="relative flex gap-4">
                                            <div className={`z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${config.bg}`}>
                                                <Icon className={`w-4 h-4 ${config.color}`} />
                                            </div>

                                            <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-sm transition-all">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${config.bg} ${config.color}`}>
                                                            {config.label}
                                                        </span>
                                                        <h3 className="text-sm font-bold text-slate-900 mt-2">
                                                            {entry.description}
                                                        </h3>
                                                    </div>
                                                    <span className="text-xs text-slate-405 font-semibold flex items-center gap-1 shrink-0">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDate(entry.date)}
                                                    </span>
                                                </div>

                                                {entry.provider && (
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">
                                                        Atendido por: <span className="text-slate-700 font-bold">Dr. {entry.provider}</span>
                                                    </p>
                                                )}

                                                {entry.fromRecord && entry.recordData && (
                                                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl">
                                                        {entry.recordData.weight && (
                                                            <div className="flex items-center gap-1.5 font-medium">
                                                                <Weight className="w-3.5 h-3.5 text-slate-400" />
                                                                Peso: {entry.recordData.weight} kg
                                                            </div>
                                                        )}
                                                        {entry.recordData.temperature && (
                                                            <div className="flex items-center gap-1.5 font-medium">
                                                                <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                                                                Temp: {entry.recordData.temperature}°C
                                                            </div>
                                                        )}
                                                        {entry.recordData.heartRate && (
                                                            <div className="flex items-center gap-1.5 font-medium col-span-2">
                                                                <Heart className="w-3.5 h-3.5 text-slate-400" />
                                                                Ritmo Cardíaco: {entry.recordData.heartRate} bpm
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {entry.notes && (
                                                    <div className="mt-2.5 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                                                        <span className="font-bold text-slate-700 block">Indicaciones:</span>
                                                        <p className="italic mt-0.5 leading-relaxed">{entry.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                )}

                {activeTab === 'vacunas' && (
                    vaccineEntries.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                            <Syringe className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-500">No hay vacunas registradas aún</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800 font-medium">
                                💉 Cronología e historial de vacunas y desparasitaciones recibidas.
                            </div>
                            {vaccineEntries.map((entry, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 items-start shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                        {entry.type === 'deworming' ? (
                                            <Bug className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <Syringe className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-bold text-slate-900 text-sm">{entry.description}</h4>
                                            <span className="text-xs text-slate-400 font-bold shrink-0">{formatDate(entry.date)}</span>
                                        </div>
                                        {entry.provider && (
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Dr. {entry.provider}</p>
                                        )}
                                        {entry.notes && (
                                            <p className="text-xs text-slate-650 mt-2 bg-slate-50 p-2 rounded-lg italic">
                                                {entry.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'diagnosticos' && (
                    diagnosisEntries.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                            <Stethoscope className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-500">No hay registros clínicos de diagnóstico aún</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {diagnosisEntries.map((entry, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className="text-[10px] uppercase font-extrabold bg-emerald-50 border border-emerald-100 text-emerald-600 px-2.5 py-0.5 rounded-md">
                                                {entry.type === 'surgery' ? 'Cirugía' : 'Ficha Clínica'}
                                            </span>
                                            <h4 className="font-bold text-slate-905 text-base mt-2">{entry.description}</h4>
                                        </div>
                                        <span className="text-xs text-slate-400 font-bold shrink-0">{formatDate(entry.date)}</span>
                                    </div>

                                    {entry.recordData && (
                                        <div className="grid grid-cols-3 gap-2.5 py-3 border-y border-slate-100 text-center">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 block uppercase">Peso</span>
                                                <span className="text-xs font-extrabold text-slate-800">{entry.recordData.weight ? `${entry.recordData.weight} kg` : '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 block uppercase">Temperatura</span>
                                                <span className="text-xs font-extrabold text-slate-800">{entry.recordData.temperature ? `${entry.recordData.temperature} °C` : '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 block uppercase">Frec. Cardíaca</span>
                                                <span className="text-xs font-extrabold text-slate-800">{entry.recordData.heartRate ? `${entry.recordData.heartRate} bpm` : '—'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {entry.recordData?.symptoms && JSON.parse(entry.recordData.symptoms).length > 0 && (
                                        <div>
                                            <span className="text-xs font-bold text-slate-500 block mb-1">Síntomas reportados:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {JSON.parse(entry.recordData.symptoms).map((s: string) => (
                                                    <span key={s} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {entry.provider && (
                                        <div className="text-xs text-slate-500 font-medium">
                                            Responsable: <span className="text-slate-800 font-bold">Dr. {entry.provider}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'tratamientos' && (
                    treatmentEntries.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                            <Pill className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-500">No hay tratamientos o prescripciones activas</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 text-xs text-violet-850 font-medium">
                                💊 Listado de recetas médicas, tratamientos recetados y próximas visitas de control sugeridas.
                            </div>
                            {treatmentEntries.map((entry, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-slate-900 text-sm">Tratamiento de {entry.description}</h4>
                                        <span className="text-xs text-slate-400 font-bold shrink-0">{formatDate(entry.date)}</span>
                                    </div>

                                    {entry.recordData?.prescription && (
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                <Pill className="w-4 h-4 text-slate-500" />
                                                <span>Receta Médica / Prescripción:</span>
                                            </div>
                                            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{entry.recordData.prescription}</p>
                                        </div>
                                    )}

                                    {entry.recordData?.treatment && (
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                <span>Detalle del Tratamiento:</span>
                                            </div>
                                            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{entry.recordData.treatment}</p>
                                        </div>
                                    )}

                                    {entry.notes && !entry.fromRecord && (
                                        <div className="p-3 bg-slate-50 border border-slate-105 rounded-xl space-y-1">
                                            <span className="text-xs font-bold text-slate-700 block">Indicaciones / Notas:</span>
                                            <p className="text-xs text-slate-600 italic leading-relaxed">{entry.notes}</p>
                                        </div>
                                    )}

                                    {entry.recordData?.nextVisit && (
                                        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-100 font-bold">
                                            <Calendar className="w-4 h-4 shrink-0" />
                                            <span>Siguiente visita de control programada: {formatDate(entry.recordData.nextVisit)}</span>
                                        </div>
                                    )}

                                    {entry.provider && (
                                        <div className="text-xs text-slate-500 font-medium">
                                            Recetado por: <span className="text-slate-800 font-bold">Dr. {entry.provider}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
