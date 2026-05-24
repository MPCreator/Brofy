'use server'

import { z } from 'zod'
import prisma from './prisma'
import { getSession, requireSession, requireRole } from './auth'
import { revalidatePath } from 'next/cache'
import { calculateDistanceKm, generateOtp } from './utils'
import { uploadImage } from './cloudinary'
import type {
    MedicalHistoryEntry,
    EstablishmentWithDistance,
    OtpResult,
} from './types'

export async function getMyRole() {
    const session = await getSession();
    return session?.role || 'client';
}

// ============================================================================
// PET ACTIONS
// ============================================================================

const AddPetSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    species: z.string().min(1, 'La especie es requerida'),
    breed: z.string().optional(),
    dateOfBirth: z.string().optional(),
    weight: z.coerce.number().min(0).optional(),
    sex: z.enum(['male', 'female', 'unknown']).optional(),
})

export async function addPet(formData: FormData) {
    const session = await requireSession()

    const validatedFields = AddPetSchema.safeParse({
        name: formData.get('name'),
        species: formData.get('species'),
        breed: formData.get('breed'),
        dateOfBirth: formData.get('dateOfBirth'),
        weight: formData.get('weight'),
        sex: formData.get('sex'),
    })

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors }
    }

    const { name, species, breed, dateOfBirth, weight, sex } = validatedFields.data
    const photoBase64 = formData.get('photoBase64') as string

    let photoUrl: string | null = null
    if (photoBase64) {
        photoUrl = await uploadImage(photoBase64, 'pets')
    }

    try {
        await prisma.pet.create({
            data: {
                name,
                species,
                breed: breed || null,
                dateOfBirth: dateOfBirth || null,
                weight: weight || null,
                sex: sex || null,
                ownerId: session.sub,
                medicalHistory: '[]',
                photoUrl,
            }
        })

        revalidatePath('/dashboard/client')
        return { success: true, message: 'Mascota agregada correctamente' }
    } catch (error) {
        console.error('Error creating pet:', error)
        return { message: 'Error al guardar la mascota' }
    }
}

export async function getUserPets() {
    const session = await getSession()
    if (!session) return []

    try {
        const pets = await prisma.pet.findMany({
            where: { ownerId: session.sub },
            orderBy: { createdAt: 'desc' }
        })
        return pets.map(pet => ({
            ...pet,
            medicalHistory: JSON.parse(pet.medicalHistory) as MedicalHistoryEntry[],
        }))
    } catch {
        return []
    }
}

export async function getPetById(petId: string) {
    const session = await getSession()
    if (!session) return null

    const pet = await prisma.pet.findFirst({
        where: {
            id: petId,
            ownerId: session.sub,
        }
    })

    if (!pet) return null

    return {
        ...pet,
        medicalHistory: JSON.parse(pet.medicalHistory) as MedicalHistoryEntry[],
    }
}

export async function updatePet(formData: FormData) {
    const session = await requireSession()

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const species = formData.get('species') as string
    const breed = formData.get('breed') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const weight = Number(formData.get('weight'))
    const sex = formData.get('sex') as string
    const photoBase64 = formData.get('photoBase64') as string

    let photoUrl: string | undefined = undefined
    if (photoBase64) {
        photoUrl = await uploadImage(photoBase64, 'pets')
    }

    await prisma.pet.update({
        where: { id, ownerId: session.sub },
        data: {
            name,
            species,
            breed: breed || null,
            dateOfBirth: dateOfBirth || null,
            weight: weight || null,
            sex: sex || null,
            photoUrl: photoUrl || undefined,
        }
    })

    revalidatePath('/dashboard/client')
    return { success: true }
}

export async function deletePet(petId: string) {
    const session = await requireSession()

    try {
        await prisma.pet.delete({
            where: { id: petId, ownerId: session.sub }
        })
        revalidatePath('/dashboard/client')
        return { success: true }
    } catch {
        return { success: false, message: 'Error al eliminar mascota' }
    }
}

// ============================================================================
// ESTABLISHMENT ACTIONS
// ============================================================================

export async function getEstablishments() {
    const establishments = await prisma.establishment.findMany({
        where: { isActive: true },
        orderBy: { rating: 'desc' },
    })
    return establishments
}

export async function getNearbyEstablishments(
    userLat: number,
    userLng: number,
    typeFilter?: string
): Promise<EstablishmentWithDistance[]> {
    const whereClause: Record<string, unknown> = { isActive: true }
    if (typeFilter && typeFilter !== 'all') {
        whereClause.type = typeFilter
    }

    const establishments = await prisma.establishment.findMany({
        where: whereClause,
    })

    // Calculate distance using Haversine (emulates PostGIS ST_Distance for SQLite)
    const withDistance = establishments.map(est => ({
        ...est,
        operatingHours: JSON.parse(est.operatingHours) as Record<string, { open: string; close: string }>,
        distanceKm: calculateDistanceKm(userLat, userLng, est.latitude, est.longitude),
    }))

    // Sort by distance
    withDistance.sort((a, b) => a.distanceKm - b.distanceKm)

    return withDistance as EstablishmentWithDistance[]
}

export async function getEstablishmentByQr(qrToken: string) {
    const establishment = await prisma.establishment.findUnique({
        where: { qrCodeToken: qrToken },
        include: {
            owner: {
                select: { id: true, fullName: true, role: true, cmvpId: true }
            }
        }
    })
    return establishment
}

export async function getEstablishmentById(id: string) {
    return prisma.establishment.findUnique({
        where: { id },
        include: {
            owner: {
                select: { id: true, fullName: true, role: true, cmvpId: true }
            }
        }
    })
}

const CreateEstablishmentSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    district: z.string().optional(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
    type: z.enum(['clinic', 'groomer', 'walker', 'hospital', 'pet_shop']),
    phone: z.string().optional(),
    description: z.string().optional(),
})

export async function createEstablishment(formData: FormData) {
    const session = await requireRole(['vet', 'provider'])

    const validated = CreateEstablishmentSchema.safeParse({
        name: formData.get('name'),
        address: formData.get('address'),
        district: formData.get('district'),
        latitude: formData.get('latitude'),
        longitude: formData.get('longitude'),
        type: formData.get('type'),
        phone: formData.get('phone'),
        description: formData.get('description'),
    })

    if (!validated.success) return { errors: validated.error.flatten().fieldErrors }

    // Enforce CMVP for clinic/hospital
    if (validated.data.type === 'clinic' || validated.data.type === 'hospital') {
        const profile = await prisma.profile.findUnique({ select: { cmvpId: true }, where: { id: session.sub } })
        if (!profile?.cmvpId) {
            return { message: 'Para registrar una Clínica o Hospital, debes configurar tu número de colegiatura (CMVP) en tu perfil primero.' }
        }
    }

    // Parse operating hours
    const is24h = formData.get('is24h') === 'true'
    const openTime = formData.get('openTime') as string || '09:00'
    const closeTime = formData.get('closeTime') as string || '18:00'
    const operatingHours = JSON.stringify({ is24h, openTime, closeTime })
    
    const concurrentSlots = parseInt(formData.get('concurrentSlots') as string) || 1
    const photosBase64Str = formData.get('photosBase64') as string

    let photoUrl: string | null = null
    if (photosBase64Str) {
        try {
            const base64Arr = JSON.parse(photosBase64Str) as string[]
            if (Array.isArray(base64Arr) && base64Arr.length > 0) {
                const uploadedUrls = await Promise.all(
                    base64Arr.slice(0, 4).map(b64 => {
                        if (!b64) return null
                        return uploadImage(b64, 'establishments')
                    })
                )
                photoUrl = uploadedUrls.filter(Boolean).join(',')
            }
        } catch (e) {
            console.error("Error parsing photosBase64 in createEstablishment:", e)
        }
    }

    await prisma.establishment.create({
        data: {
            ...validated.data,
            district: validated.data.district || null,
            phone: validated.data.phone || null,
            description: validated.data.description || null,
            operatingHours,
            concurrentSlots,
            ownerId: session.sub,
            photoUrl,
        }
    })

    revalidatePath('/dashboard/vet')
    return { success: true }
}

// ============================================================================
// APPOINTMENT FLOW — "MANO DURA" ANTI-DESINTERMEDIACIÓN
// ============================================================================

/**
 * Paso 1: Cliente crea una cita (status: 'pending')
 * Se crea tras escanear el QR o desde el discovery
 */
export async function createAppointment(data: {
    petId: string;
    establishmentId: string;
    providerId?: string;
    serviceType: string;
    commissionType: 'booking' | 'walkin';
    scheduledAt?: string;
    notes?: string;
}) {
    const session = await requireRole(['client'])

    const commissionAmount = data.commissionType === 'booking' ? 5.00 : 6.00

    // Anti-saturación: Evitar citas solapadas (30 minutos de margen)
    if (data.scheduledAt) {
        const requestedTime = new Date(data.scheduledAt)
        const thirtyMinsBefore = new Date(requestedTime.getTime() - 30 * 60000)
        const thirtyMinsAfter = new Date(requestedTime.getTime() + 30 * 60000)

        const [overlappingCount, est] = await Promise.all([
            prisma.appointment.count({
                where: {
                    establishmentId: data.establishmentId,
                    status: { notIn: ['cancelled'] },
                    scheduledAt: {
                        gte: thirtyMinsBefore,
                        lte: thirtyMinsAfter
                    }
                }
            }),
            prisma.establishment.findUnique({
                where: { id: data.establishmentId },
                select: { concurrentSlots: true }
            })
        ])

        if (est && overlappingCount >= est.concurrentSlots) {
            return { success: false, error: 'El horario seleccionado ya está ocupado. Por favor, elige otro horario (mínimo 30 min de diferencia).' }
        }
    }

    const appointment = await prisma.appointment.create({
        data: {
            clientId: session.sub,
            petId: data.petId,
            establishmentId: data.establishmentId,
            providerId: data.providerId || null,
            serviceType: data.serviceType,
            commissionType: data.commissionType,
            commissionAmount,
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
            notes: data.notes || null,
            status: 'pending',
        }
    })

    return { success: true, appointmentId: appointment.id }
}

/**
 * Paso 2: Pago de comisión (MOCK — preparado para Izipay/MercadoPago)
 * Simula el pago y genera OTP
 */
export async function processPayment(appointmentId: string): Promise<OtpResult> {
    const session = await requireRole(['client'])

    // Verificar que la cita pertenece al cliente
    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            clientId: session.sub,
            status: 'pending',
        }
    })

    if (!appointment) {
        return { success: false, message: 'Cita no encontrada o ya fue pagada.' }
    }

    // ---- MOCK PAYMENT ----
    // TODO: Integrar Izipay o MercadoPago aquí
    // Por ahora simulamos el pago como exitoso
    const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    // ---- FIN MOCK ----

    // Generar OTP
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos

    // Actualizar cita: status → 'paid', guardar OTP
    await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            status: 'paid',
            paymentId: mockPaymentId,
            otpValidationCode: otp,
        }
    })

    revalidatePath('/dashboard/client')

    return {
        success: true,
        otp,
        expiresAt: expiresAt.toISOString(),
    }
}

export async function getPendingAppointments() {
    const session = await requireRole(['vet', 'provider'])

    return prisma.appointment.findMany({
        where: {
            establishment: {
                ownerId: session.sub
            },
            status: { in: ['pending', 'paid'] },
        },
        include: {
            pet: {
                include: { owner: true }
            },
            establishment: true
        },
        orderBy: { createdAt: 'desc' }
    })
}

/**
 * Paso 3: Veterinario valida el OTP que el cliente le muestra
 * Si es válido: status → 'validated', se desbloquea la ficha médica
 */
export async function validateOtp(appointmentId: string, code: string) {
    const session = await requireRole(['vet', 'provider'])

    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            status: 'paid',
            otpValidationCode: code,
        }
    })

    if (!appointment) {
        return { success: false, message: 'Código OTP inválido.' }
    }

    // Validar y asignar proveedor
    await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            status: 'validated',
            providerId: session.sub,
        }
    })

    revalidatePath('/dashboard/vet')
    return { success: true, message: 'OTP validado. Ficha médica desbloqueada.' }
}

/**
 * Paso 4: Veterinario crea la ficha médica (SOLO si la cita está 'validated')
 */
export async function createMedicalRecord(data: {
    appointmentId: string;
    weight?: number;
    temperature?: number;
    heartRate?: number;
    symptoms: string[];
    diagnosis?: string;
    prescription?: string;
    treatment?: string;
    nextVisit?: string;
}) {
    const session = await requireRole(['vet'])

    // Verificar que la cita está validada y pertenece al vet
    const appointment = await prisma.appointment.findFirst({
        where: {
            id: data.appointmentId,
            providerId: session.sub,
            status: 'validated',
        },
        include: { pet: true },
    })

    if (!appointment) {
        return {
            success: false,
            message: 'La cita no está activa o no tienes permiso para editarla. Verifica el código de atención primero.'
        }
    }

    // Crear registro médico
    const record = await prisma.medicalRecord.create({
        data: {
            appointmentId: data.appointmentId,
            vetId: session.sub,
            weight: data.weight || null,
            temperature: data.temperature || null,
            heartRate: data.heartRate || null,
            symptoms: JSON.stringify(data.symptoms),
            diagnosis: data.diagnosis || null,
            prescription: data.prescription || null,
            treatment: data.treatment || null,
            nextVisit: data.nextVisit || null,
        }
    })

    // Actualizar el medical_history JSONB de la mascota
    const pet = appointment.pet
    const currentHistory: MedicalHistoryEntry[] = JSON.parse(pet.medicalHistory)
    const newEntry: MedicalHistoryEntry = {
        date: new Date().toISOString().split('T')[0],
        type: 'consultation',
        description: data.diagnosis || 'Consulta general',
        provider: session.fullName,
        notes: data.prescription || undefined,
    }
    currentHistory.push(newEntry)

    await prisma.pet.update({
        where: { id: pet.id },
        data: { medicalHistory: JSON.stringify(currentHistory) }
    })

    // Marcar la cita como completada
    await prisma.appointment.update({
        where: { id: data.appointmentId },
        data: {
            status: 'completed',
            completedAt: new Date(),
        }
    })

    // Crear recordatorio automático si hay próxima visita
    if (data.nextVisit && appointment.clientId) {
        await prisma.reminder.create({
            data: {
                clientId: appointment.clientId,
                petId: appointment.petId,
                appointmentId: appointment.id,
                createdBy: session.sub,
                type: 'control',
                title: `Próximo control - ${appointment.serviceType === 'consultation' ? 'Consulta' : 'Servicio'}`,
                message: `Control programado en el establecimiento. Tratamiento o notas sugeridas.`,
                dueDate: data.nextVisit,
            }
        })
    }

    revalidatePath('/dashboard/vet')
    revalidatePath('/dashboard/client')

    return { success: true, recordId: record.id }
}

/**
 * Ficha Rápida (Invitado): Para clientes sin cuenta registrada.
 * Crea un perfil fantasma, mascota, cita y ficha médica en 1 solo paso sin OTP.
 */
export async function createGuestFastEntry(data: {
    guestClientName: string;
    guestEmail?: string;
    guestPetName: string;
    guestPetSpecies: string;
    establishmentId?: string;
    weight?: number;
    temperature?: number;
    heartRate?: number;
    symptoms: string[];
    diagnosis?: string;
    prescription?: string;
    treatment?: string;
}) {
    const session = await requireRole(['vet'])

    let est = null
    if (data.establishmentId) {
        est = await prisma.establishment.findFirst({ where: { id: data.establishmentId, ownerId: session.sub } })
    }
    if (!est) {
        est = await prisma.establishment.findFirst({ where: { ownerId: session.sub } })
    }
    if (!est) return { success: false, message: 'No tienes un establecimiento registrado.' }

    // 1. Buscar o Crear perfil fantasma
    const email = data.guestEmail?.trim().toLowerCase() || `guest_${Date.now()}@brofy.guest`
    let profile = await prisma.profile.findUnique({ where: { email } })
    
    if (!profile) {
        profile = await prisma.profile.create({
            data: {
                email,
                password: 'guest-no-login',
                fullName: data.guestClientName,
                role: 'client'
            }
        })
    }

    // 2. Buscar o Crear mascota fantasma
    let pet = await prisma.pet.findFirst({
        where: { ownerId: profile.id, name: { equals: data.guestPetName, mode: 'insensitive' } }
    })
    
    if (!pet) {
        pet = await prisma.pet.create({
            data: {
                ownerId: profile.id,
                name: data.guestPetName,
                species: data.guestPetSpecies
            }
        })
    }

    // 3. Crear cita (completada)
    const appointment = await prisma.appointment.create({
        data: {
            clientId: profile.id,
            petId: pet.id,
            establishmentId: est.id,
            providerId: session.sub,
            status: 'completed',
            serviceType: 'consultation',
            commissionType: 'walkin',
            commissionAmount: 6.00,
            paymentId: 'DEBT'
        }
    })

    // 4. Crear Ficha Médica
    const record = await prisma.medicalRecord.create({
        data: {
            appointmentId: appointment.id,
            vetId: session.sub,
            weight: data.weight || null,
            temperature: data.temperature || null,
            heartRate: data.heartRate || null,
            symptoms: JSON.stringify(data.symptoms),
            diagnosis: data.diagnosis || null,
            prescription: data.prescription || null,
            treatment: data.treatment || null,
        }
    })

    // 5. Cobrar la comisión a las finanzas del Vet
    await prisma.transaction.create({
        data: {
            profileId: session.sub,
            type: 'expense',
            amount: 6.00,
            category: 'brofy_commission',
            description: `Comisión Brofy Ficha Rápida - ${data.guestClientName} (${data.guestPetName})`,
            date: new Date().toISOString().split('T')[0]
        }
    })


    revalidatePath('/dashboard/vet')
    revalidatePath('/dashboard/vet/finances')

    return { success: true, recordId: record.id }
}

export async function getVetDebt() {
    const session = await getSession()
    if (!session) return 0

    const debtAppointments = await prisma.appointment.findMany({
        where: {
            providerId: session.sub,
            paymentId: 'DEBT'
        }
    })

    const totalDebt = debtAppointments.reduce((sum, apt) => sum + apt.commissionAmount, 0)
    return totalDebt
}

export async function payVetDebt() {
    const session = await requireRole(['vet', 'provider'])

    await prisma.appointment.updateMany({
        where: {
            providerId: session.sub,
            paymentId: 'DEBT'
        },
        data: {
            paymentId: `PAID-${Date.now()}`
        }
    })

    revalidatePath('/dashboard/vet/finances')
    return { success: true }
}

// ============================================================================
// REVIEW ACTIONS
// ============================================================================

export async function createReview(data: {
    appointmentId: string
    establishmentId: string
    rating: number
    comment?: string
}) {
    const session = await requireRole(['client'])

    if (data.rating < 1 || data.rating > 5) {
        return { success: false, error: 'La valoración debe ser entre 1 y 5 estrellas.' }
    }

    // Verify appointment belongs to client and is completed
    const apt = await prisma.appointment.findFirst({
        where: { id: data.appointmentId, clientId: session.sub, status: 'completed' }
    })
    if (!apt) return { success: false, error: 'Solo puedes valorar citas completadas.' }

    // Block duplicate review — one review per appointment, permanent
    const existing = await prisma.review.findUnique({ where: { appointmentId: data.appointmentId } })
    if (existing) return { success: false, error: 'Ya has valorado esta atención.' }

    await prisma.review.create({
        data: {
            appointmentId: data.appointmentId,
            clientId: session.sub,
            establishmentId: data.establishmentId,
            rating: data.rating,
            comment: data.comment || null,
        }
    })

    // Recalculate establishment average rating
    const aggregate = await prisma.review.aggregate({
        where: { establishmentId: data.establishmentId },
        _avg: { rating: true },
        _count: true,
    })

    await prisma.establishment.update({
        where: { id: data.establishmentId },
        data: { rating: aggregate._avg.rating || 0 }
    })

    revalidatePath(`/establishment/${data.establishmentId}`)
    revalidatePath('/dashboard/client')
    return { success: true }
}

export async function getEstablishmentReviews(establishmentId: string) {
    return prisma.review.findMany({
        where: { establishmentId },
        include: {
            client: { select: { fullName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    })
}

// ============================================================================
// QUERY ACTIONS
// ============================================================================

export async function getClientAppointments() {
    const session = await getSession()
    if (!session) return []

    return prisma.appointment.findMany({
        where: { clientId: session.sub },
        include: {
            pet: true,
            establishment: true,
            provider: { select: { id: true, fullName: true, cmvpId: true } },
            medicalRecord: true,
            review: true,
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getVetAppointments() {
    const session = await getSession()
    if (!session) return []

    return prisma.appointment.findMany({
        where: {
            OR: [
                { providerId: session.sub },
                {
                    status: 'paid',
                    establishment: {
                        ownerId: session.sub,
                    }
                }
            ]
        },
        include: {
            pet: true,
            client: { select: { id: true, fullName: true, phone: true } },
            establishment: true,
            medicalRecord: true,
        },
        orderBy: { createdAt: 'desc' },
    })
}

/**
 * Devuelve citas en estado 'validated' que NO tienen ficha médica completada.
 * Permite al vet retomar fichas que quedaron abiertas.
 */
export async function getOpenFichas() {
    const session = await getSession()
    if (!session) return []

    return prisma.appointment.findMany({
        where: {
            providerId: session.sub,
            status: 'validated',
            medicalRecord: null,  // sin ficha completada
        },
        include: {
            pet: true,
            client: { select: { id: true, fullName: true } },
        },
        orderBy: { updatedAt: 'desc' },
    })
}

export async function getMedicalHistory(petId: string) {
    const session = await getSession()
    if (!session) return []

    // Verificar acceso (dueño o vet de citas validadas)
    const pet = await prisma.pet.findFirst({
        where: { id: petId, ownerId: session.sub }
    })

    if (!pet) return []

    // Obtener registros médicos de todas las citas de esta mascota
    const records = await prisma.medicalRecord.findMany({
        where: {
            appointment: { petId }
        },
        include: {
            vet: { select: { fullName: true, cmvpId: true } },
            appointment: {
                select: { scheduledAt: true, serviceType: true, establishment: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return records
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
    const session = await requireRole(['vet', 'provider'])
    
    // Verify ownership
    const apt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { establishment: true }
    })
    
    if (!apt || (apt.providerId !== session.sub && apt.establishment.ownerId !== session.sub)) {
        throw new Error('Unauthorized')
    }

    await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status }
    })

    revalidatePath('/dashboard/vet')
    revalidatePath('/dashboard/client')
    return { success: true }
}

export async function getVetStats() {
    const session = await getSession()
    if (!session) return { todayCount: 0, monthRevenue: 0, pendingOtp: 0, completedTotal: 0 }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today.getTime() + 86400000)
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [todayCount, monthAppointments, pendingOtp, completedTotal] = await Promise.all([
        prisma.appointment.count({
            where: {
                providerId: session.sub,
                scheduledAt: { gte: today, lt: tomorrow },
            }
        }),
        prisma.appointment.findMany({
            where: {
                providerId: session.sub,
                createdAt: { gte: firstOfMonth },
                status: { in: ['validated', 'completed'] },
            }
        }),
        prisma.appointment.count({
            where: {
                establishment: { ownerId: session.sub },
                status: 'paid',
            }
        }),
        prisma.appointment.count({
            where: {
                providerId: session.sub,
                status: 'completed',
            }
        }),
    ])

    const monthRevenue = monthAppointments.reduce((acc, a) => acc + a.commissionAmount, 0)

    return { todayCount, monthRevenue, pendingOtp, completedTotal }
}

// ============================================================================
// PROFILE ACTIONS
// ============================================================================

export async function getProfile() {
    const session = await getSession()
    if (!session) return null
    return prisma.profile.findUnique({
        where: { id: session.sub },
        select: {
            id: true, email: true, fullName: true, role: true,
            cmvpId: true, phone: true, avatarUrl: true,
            latitude: true, longitude: true,
        }
    })
}

export async function updateProfile(formData: FormData) {
    const session = await requireSession()

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const cmvpId = formData.get('cmvpId') as string
    const avatarBase64 = formData.get('avatarBase64') as string

    let avatarUrl: string | undefined = undefined
    if (avatarBase64) {
        avatarUrl = await uploadImage(avatarBase64, 'avatars')
    }

    await prisma.profile.update({
        where: { id: session.sub },
        data: {
            fullName: fullName || undefined,
            phone: phone || null,
            cmvpId: cmvpId || null,
            avatarUrl: avatarUrl || undefined,
        }
    })

    revalidatePath('/dashboard/settings')
    return { success: true }
}

// ============================================================================
// SERVICE (TARIFARIO) ACTIONS
// ============================================================================

export async function getEstablishmentServices(establishmentId: string) {
    return prisma.service.findMany({
        where: { establishmentId, isActive: true },
        orderBy: { price: 'asc' },
    })
}

export async function getMyEstablishments() {
    const session = await getSession()
    if (!session) return []
    return prisma.establishment.findMany({
        where: { ownerId: session.sub },
        include: { services: { where: { isActive: true } } },
        orderBy: { createdAt: 'desc' },
    })
}

export async function addService(formData: FormData) {
    const session = await requireRole(['vet', 'provider'])
    const establishmentId = formData.get('establishmentId') as string

    // Verify ownership
    const est = await prisma.establishment.findFirst({
        where: { id: establishmentId, ownerId: session.sub }
    })
    if (!est) return { message: 'No autorizado' }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const duration = parseInt(formData.get('duration') as string) || 30
    const category = formData.get('category') as string || 'general'

    if (!name || isNaN(price)) return { message: 'Nombre y precio son requeridos' }

    await prisma.service.create({
        data: {
            establishmentId,
            name,
            description: description || null,
            price,
            duration,
            category,
        }
    })

    revalidatePath('/dashboard/vet/services')
    return { success: true }
}

export async function updateService(formData: FormData) {
    const session = await requireRole(['vet', 'provider'])
    const id = formData.get('id') as string

    const service = await prisma.service.findFirst({
        where: { id },
        include: { establishment: { select: { ownerId: true } } }
    })
    if (!service || service.establishment.ownerId !== session.sub) {
        return { message: 'No autorizado' }
    }

    await prisma.service.update({
        where: { id },
        data: {
            name: formData.get('name') as string,
            description: (formData.get('description') as string) || null,
            price: parseFloat(formData.get('price') as string),
            duration: parseInt(formData.get('duration') as string) || 30,
            category: (formData.get('category') as string) || 'general',
        }
    })

    revalidatePath('/dashboard/vet/services')
    return { success: true }
}

export async function deleteService(serviceId: string) {
    const session = await requireRole(['vet', 'provider'])

    const service = await prisma.service.findFirst({
        where: { id: serviceId },
        include: { establishment: { select: { ownerId: true } } }
    })
    if (!service || service.establishment.ownerId !== session.sub) {
        return { message: 'No autorizado' }
    }

    await prisma.service.update({
        where: { id: serviceId },
        data: { isActive: false }
    })

    revalidatePath('/dashboard/vet/services')
    return { success: true }
}

// ============================================================================
// TRANSACTION (FINANZAS) ACTIONS
// ============================================================================

export async function getTransactions(month?: number, year?: number) {
    const session = await getSession()
    if (!session) return []

    const now = new Date()
    const m = month ?? now.getMonth()
    const y = year ?? now.getFullYear()
    const startDate = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const endDate = m === 11
        ? `${y + 1}-01-01`
        : `${y}-${String(m + 2).padStart(2, '0')}-01`

    return prisma.transaction.findMany({
        where: {
            profileId: session.sub,
            date: { gte: startDate, lt: endDate },
        },
        orderBy: { date: 'desc' },
    })
}

export async function addTransaction(formData: FormData) {
    const session = await requireSession()

    const type = formData.get('type') as string
    const amount = parseFloat(formData.get('amount') as string)
    const category = formData.get('category') as string || 'other'
    const description = formData.get('description') as string
    const date = formData.get('date') as string || new Date().toISOString().split('T')[0]

    if (!type || isNaN(amount) || amount <= 0) {
        return { message: 'Tipo y monto válidos son requeridos' }
    }

    await prisma.transaction.create({
        data: {
            profileId: session.sub,
            type,
            amount,
            category,
            description: description || null,
            date,
        }
    })

    revalidatePath('/dashboard/vet/finances')
    return { success: true }
}

export async function deleteTransaction(id: string) {
    const session = await requireSession()

    await prisma.transaction.deleteMany({
        where: { id, profileId: session.sub }
    })

    revalidatePath('/dashboard/vet/finances')
    return { success: true }
}

export async function getFinanceSummary() {
    const session = await getSession()
    if (!session) return { totalIncome: 0, totalExpense: 0, balance: 0 }

    const now = new Date()
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const transactions = await prisma.transaction.findMany({
        where: { profileId: session.sub, date: { gte: startDate } }
    })

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
}

// ============================================================================
// ESTABLISHMENT PUBLIC VIEW
// ============================================================================

export async function getEstablishmentPublic(id: string) {
    return prisma.establishment.findUnique({
        where: { id, isActive: true },
        include: {
            owner: { select: { id: true, fullName: true, cmvpId: true, role: true } },
            services: { where: { isActive: true }, orderBy: { price: 'asc' } },
        }
    })
}

export async function updateEstablishment(formData: FormData) {
    const session = await requireRole(['vet', 'provider'])
    const id = formData.get('id') as string

    const est = await prisma.establishment.findFirst({ where: { id, ownerId: session.sub } })
    if (!est) return { message: 'No autorizado' }

    const newType = (formData.get('type') as string) || est.type
    // Enforce CMVP for clinic/hospital
    if (newType === 'clinic' || newType === 'hospital') {
        const profile = await prisma.profile.findUnique({ select: { cmvpId: true }, where: { id: session.sub } })
        if (!profile?.cmvpId) {
            return { message: 'Para registrar o cambiar a una Clínica o Hospital, debes configurar tu número de colegiatura (CMVP) en tu perfil primero.' }
        }
    }

    const is24h = formData.get('is24h') === 'true'
    const openTime = formData.get('openTime') as string || '09:00'
    const closeTime = formData.get('closeTime') as string || '18:00'
    const operatingHours = JSON.stringify({ is24h, openTime, closeTime })
    
    const concurrentSlots = parseInt(formData.get('concurrentSlots') as string) || 1
    const photosBase64Str = formData.get('photosBase64') as string

    let photoUrl: string | undefined = undefined
    if (photosBase64Str) {
        try {
            const base64Arr = JSON.parse(photosBase64Str) as string[]
            if (Array.isArray(base64Arr)) {
                const processedUrls = await Promise.all(
                    base64Arr.slice(0, 4).map(async item => {
                        if (!item) return null
                        if (item.startsWith('data:image')) {
                            return await uploadImage(item, 'establishments')
                        }
                        if (item.startsWith('http')) {
                            return item
                        }
                        return null
                    })
                )
                photoUrl = processedUrls.filter(Boolean).join(',')
            }
        } catch (e) {
            console.error("Error parsing photosBase64 in updateEstablishment:", e)
        }
    }

    await prisma.establishment.update({
        where: { id },
        data: {
            name: (formData.get('name') as string) || est.name,
            address: (formData.get('address') as string) || est.address,
            district: (formData.get('district') as string) || null,
            phone: (formData.get('phone') as string) || null,
            description: (formData.get('description') as string) || null,
            type: newType,
            operatingHours,
            concurrentSlots,
            photoUrl: photoUrl !== undefined ? photoUrl : undefined,
        }
    })

    revalidatePath('/dashboard/vet/establishment')
    return { success: true }
}

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

export async function getAllUsers() {
    await requireRole(['admin'])
    return prisma.profile.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function validateVetCmvp(userId: string, valid: boolean) {
    await requireRole(['admin'])
    
    await prisma.profile.update({
        where: { id: userId },
        data: { cmvpValidated: valid }
    })
    
    revalidatePath('/dashboard/admin')
    return { success: true }
}

export async function toggleAccountStatus(userId: string, isActive: boolean) {
    await requireRole(['admin'])
    await prisma.profile.update({
        where: { id: userId },
        data: { isActive }
    })
    revalidatePath('/dashboard/admin')
    return { success: true }
}

export async function updateRevisionMessage(userId: string, message: string) {
    await requireRole(['admin'])
    await prisma.profile.update({
        where: { id: userId },
        data: { revisionMsg: message }
    })
    revalidatePath('/dashboard/admin')
    return { success: true }
}

export async function deleteAccount(userId: string) {
    await requireRole(['admin'])
    await prisma.profile.delete({
        where: { id: userId }
    })
    revalidatePath('/dashboard/admin')
    return { success: true }
}

// ============================================================================
// CLAIMS (Libro de Reclamaciones)
// ============================================================================

export async function createClaim(formData: FormData) {
    await prisma.claim.create({
        data: {
            fullName: formData.get('fullName') as string,
            documentId: formData.get('documentId') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            claimType: formData.get('claimType') as string,
            description: formData.get('description') as string,
            request: formData.get('request') as string,
        }
    })
    return { success: true }
}

export async function getAllClaims() {
    await requireRole(['admin'])
    return prisma.claim.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function updateClaimStatus(claimId: string, status: string) {
    await requireRole(['admin'])
    await prisma.claim.update({
        where: { id: claimId },
        data: { status }
    })
    revalidatePath('/dashboard/admin')
    return { success: true }
}

// ============================================================================
// REMINDERS (Recordatorios)
// ============================================================================

export async function createReminder(data: {
    clientId: string;
    petId?: string;
    appointmentId?: string;
    type: string;
    title: string;
    message?: string;
    dueDate: string;
}) {
    const session = await requireRole(['vet', 'admin'])
    const reminder = await prisma.reminder.create({
        data: {
            clientId: data.clientId,
            petId: data.petId || null,
            appointmentId: data.appointmentId || null,
            createdBy: session.sub,
            type: data.type,
            title: data.title,
            message: data.message || null,
            dueDate: data.dueDate,
        }
    })
    revalidatePath('/dashboard/client')
    revalidatePath('/dashboard/vet')
    return { success: true, reminder }
}

export async function getClientReminders() {
    const session = await getSession()
    if (!session) return []
    // Get personal reminders + global reminders created by admin
    return prisma.reminder.findMany({
        where: {
            OR: [
                { clientId: session.sub },
                { isGlobal: true }
            ]
        },
        include: {
            pet: { select: { name: true } },
            creator: { select: { fullName: true } }
        },
        orderBy: { dueDate: 'asc' }
    })
}

export async function getVetReminders() {
    const session = await requireRole(['vet', 'provider'])
    // Vets see reminders they created, or global templates
    return prisma.reminder.findMany({
        where: {
            OR: [
                { createdBy: session.sub },
                { isGlobal: true }
            ]
        },
        include: {
            client: { select: { fullName: true } },
            pet: { select: { name: true } }
        },
        orderBy: { dueDate: 'asc' }
    })
}

export async function completeReminder(id: string) {
    const session = await getSession()
    if (!session) return { success: false, message: 'No autorizado' }
    await prisma.reminder.update({
        where: { id },
        data: {
            isCompleted: true,
            completedAt: new Date()
        }
    })
    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteReminder(id: string) {
    const session = await getSession()
    if (!session) return { success: false, message: 'No autorizado' }
    await prisma.reminder.delete({
        where: { id }
    })
    revalidatePath('/dashboard')
    return { success: true }
}

export async function createGlobalReminder(data: {
    type: string;
    title: string;
    message?: string;
    dueDate: string;
}) {
    const session = await requireRole(['admin'])
    const reminder = await prisma.reminder.create({
        data: {
            createdBy: session.sub,
            type: data.type,
            title: data.title,
            message: data.message || null,
            dueDate: data.dueDate,
            isGlobal: true
        }
    })
    revalidatePath('/dashboard/admin')
    return { success: true, reminder }
}

export async function getAllRemindersAdmin() {
    await requireRole(['admin'])
    return prisma.reminder.findMany({
        include: {
            client: { select: { fullName: true, email: true } },
            pet: { select: { name: true } },
            creator: { select: { fullName: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createAdminAuditReminder(data: {
    vetId: string;
    vetName: string;
    dueDate: string;
}) {
    const session = await requireRole(['admin'])
    const reminder = await prisma.reminder.create({
        data: {
            clientId: session.sub,
            createdBy: session.sub,
            type: 'control',
            title: `Revisar habilitación CMVP de ${data.vetName}`,
            message: `Auditoría periódica de colegiatura CMVP del veterinario en el portal público.`,
            dueDate: data.dueDate,
        }
    })
    revalidatePath('/dashboard/admin')
    return { success: true, reminder }
}

