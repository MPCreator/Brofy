import { requireRole } from '@/lib/auth'
import { getVetAppointments } from '@/lib/actions'
import Link from 'next/link'
import { PawPrint, ArrowLeft, FileText, ChevronRight, Search, ClipboardList } from 'lucide-react'
import { APPOINTMENT_STATUS_LABELS, SPECIES_LABELS } from '@/lib/types'

const SPECIES_EMOJI: Record<string, string> = {
    dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', hamster: '🐹', fish: '🐟', reptile: '🦎'
}

export default async function VetPatientsPage() {
    await requireRole(['vet', 'provider'])
    const appointments = await getVetAppointments()

    // Build unique pets map, keeping the latest appointment per pet
    const petsMap = new Map<string, { pet: any; client: any; lastApt: any; totalVisits: number }>()

    for (const apt of appointments) {
        const pet = apt.pet as any
        if (!pet) continue

        const existing = petsMap.get(pet.id)
        if (!existing) {
            petsMap.set(pet.id, {
                pet,
                client: apt.client,
                lastApt: apt,
                totalVisits: 1,
            })
        } else {
            // Accumulate visits, keep most recent appointment date
            petsMap.set(pet.id, {
                ...existing,
                totalVisits: existing.totalVisits + 1,
                lastApt: new Date(apt.createdAt) > new Date(existing.lastApt.createdAt) ? apt : existing.lastApt,
            })
        }
    }

    const patients = Array.from(petsMap.values()).sort(
        (a, b) => new Date(b.lastApt.createdAt).getTime() - new Date(a.lastApt.createdAt).getTime()
    )

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/vet" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <PawPrint className="w-6 h-6 text-primary-600" />
                        Mis Pacientes
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Historial de mascotas atendidas</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-slate-900">{patients.length}</p>
                    <p className="text-xs text-slate-500 mt-1">pacientes únicos</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-slate-900">{appointments.filter(a => a.status === 'completed').length}</p>
                    <p className="text-xs text-slate-500 mt-1">atenciones completadas</p>
                </div>
            </div>

            {/* Patients list */}
            {patients.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <PawPrint className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Aún no has atendido ninguna mascota registrada.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {patients.map(({ pet, client, lastApt, totalVisits }) => (
                        <div key={pet.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-primary-200 hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4 p-4">
                                {/* Pet avatar */}
                                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl shrink-0">
                                    {SPECIES_EMOJI[pet.species] || '🐾'}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900">{pet.name}</h3>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{SPECIES_LABELS[pet.species as keyof typeof SPECIES_LABELS] || pet.species}</span>
                                        {pet.breed && <span className="text-xs text-slate-400 truncate">{pet.breed}</span>}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        Dueño: <span className="font-medium text-slate-700">{(client as any)?.fullName || '—'}</span>
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-slate-400">
                                            Última atención: {new Date(lastApt.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="text-xs text-primary-700 font-medium bg-primary-50 px-2 py-0.5 rounded-full">
                                            {totalVisits} visita{totalVisits !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                            </div>

                            {/* Appointments accordion */}
                            <div className="border-t border-slate-50 divide-y divide-slate-50">
                                {appointments
                                    .filter(a => (a.pet as any)?.id === pet.id)
                                    .slice(0, 3)
                                    .map(apt => (
                                        <div key={apt.id} className="flex items-center gap-3 px-4 py-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                                {(apt as any).medicalRecord
                                                    ? <FileText className="w-3.5 h-3.5 text-primary-500" />
                                                    : <ClipboardList className="w-3.5 h-3.5 text-slate-300" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-slate-700 truncate">{apt.serviceType}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {new Date(apt.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {' · '}
                                                    <span className={`${
                                                        apt.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                                                    } font-semibold`}>
                                                        {APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS]?.label || apt.status}
                                                    </span>
                                                </p>
                                            </div>
                                            {(apt as any).medicalRecord && (
                                                <Link
                                                    href={`/dashboard/vet/fast-entry?appointmentId=${apt.id}`}
                                                    className="text-xs text-primary-600 hover:underline font-medium"
                                                >
                                                    Ver ficha
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
