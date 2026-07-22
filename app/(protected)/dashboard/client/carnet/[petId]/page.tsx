import { requireRole } from '@/lib/auth'
import { getPetById, getMedicalHistory } from '@/lib/actions'
import { notFound } from 'next/navigation'
import CarnetClient from './CarnetClient'
import type { MedicalHistoryEntry } from '@/lib/types'

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
            type: (record.appointment?.serviceType as any) || 'consultation',
            description: record.diagnosis || 'Consulta',
            provider: (record.vet as { fullName: string })?.fullName,
            notes: record.prescription || undefined,
            treatment: record.treatment || undefined,
            fromRecord: true,
            recordData: record,
        })
    }

    // Sort by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return <CarnetClient pet={pet} timeline={timeline} />
}
