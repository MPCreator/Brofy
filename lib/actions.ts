'use server'

import { z } from 'zod'
import prisma from './prisma'
import { getSession, requireSession, requireRole } from './auth'
import { revalidatePath } from 'next/cache'
import { calculateDistanceKm, generateOtp, checkIfNonClinical } from './utils'
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
        // Generate unique CUH with collision retry
        let cuh = ''
        for (let attempt = 0; attempt < 5; attempt++) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
            const candidate = `CUH-${randomDigits}`
            const existing = await prisma.pet.findFirst({ where: { cuh: candidate } })
            if (!existing) {
                cuh = candidate
                break
            }
        }
        if (!cuh) cuh = `CUH-${Date.now().toString().slice(-6)}`

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
                cuh,
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
            where: { ownerId: session.sub, isActive: true },
            orderBy: { createdAt: 'desc' }
        })
        
        const updatedPets = []
        for (const pet of pets) {
            if (!pet.cuh) {
                const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
                const generatedCuh = `CUH-${randomDigits}`
                await prisma.pet.update({
                    where: { id: pet.id },
                    data: { cuh: generatedCuh }
                })
                pet.cuh = generatedCuh
            }
            updatedPets.push({
                ...pet,
                medicalHistory: JSON.parse(pet.medicalHistory) as MedicalHistoryEntry[],
            })
        }
        return updatedPets
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
            isActive: true,
        }
    })

    if (!pet) return null

    if (!pet.cuh) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
        const generatedCuh = `CUH-${randomDigits}`
        await prisma.pet.update({
            where: { id: pet.id },
            data: { cuh: generatedCuh }
        })
        pet.cuh = generatedCuh
    }

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
        await prisma.pet.update({
            where: { id: petId, ownerId: session.sub },
            data: { isActive: false }
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
        include: {
            services: {
                where: { isActive: true }
            },
            reviews: true
        },
    })
    
    // Calculate dynamic rating and review counts from actual database reviews
    const mapped = establishments.map(est => {
        const reviewsCount = est.reviews.length
        const avgRating = reviewsCount > 0
            ? est.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
            : 0
        return {
            ...est,
            rating: avgRating,
            reviewsCount
        }
    })

    // Sort by rating (descending), putting new/unrated establishments at the end
    mapped.sort((a, b) => b.rating - a.rating)
    return mapped
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
        include: {
            reviews: true,
            services: true
        }
    })

    // Calculate distance and average rating
    const withDistance = establishments.map(est => {
        const reviewsCount = est.reviews.length
        const avgRating = reviewsCount > 0
            ? est.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
            : 0
        return {
            ...est,
            rating: avgRating,
            reviewsCount,
            operatingHours: JSON.parse(est.operatingHours) as Record<string, { open: string; close: string }>,
            distanceKm: calculateDistanceKm(userLat, userLng, est.latitude, est.longitude),
        }
    })

    // Sort by distance
    withDistance.sort((a, b) => a.distanceKm - b.distanceKm)

    return withDistance as unknown as EstablishmentWithDistance[]
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
    if (establishment && !establishment.dni) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
        const generatedDni = `EST-${randomDigits}`
        await prisma.establishment.update({
            where: { id: establishment.id },
            data: { dni: generatedDni }
        })
        establishment.dni = generatedDni
    }
    return establishment
}

export async function getEstablishmentById(id: string) {
    const establishment = await prisma.establishment.findUnique({
        where: { id },
        include: {
            owner: {
                select: { id: true, fullName: true, role: true, cmvpId: true }
            }
        }
    })
    if (establishment && !establishment.dni) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
        const generatedDni = `EST-${randomDigits}`
        await prisma.establishment.update({
            where: { id: establishment.id },
            data: { dni: generatedDni }
        })
        establishment.dni = generatedDni
    }
    return establishment
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
    const logoBase64 = formData.get('logoBase64') as string

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

    let logoUrl: string | null = null
    if (logoBase64) {
        try {
            logoUrl = await uploadImage(logoBase64, 'logos')
        } catch (e) {
            console.error("Error uploading logo in createEstablishment:", e)
        }
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
    const dni = `EST-${randomDigits}`

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
            logoUrl,
            dni,
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
    serviceType?: string;
    serviceIds?: string[];
    commissionType: 'booking' | 'walkin';
    scheduledAt?: string;
    notes?: string;
}) {
    const session = await requireRole(['client'])

    // Req 7: Verificar teléfono obligatorio antes de agendar
    const clientProfile = await prisma.profile.findUnique({
        where: { id: session.sub },
        select: { phone: true }
    })
    if (!clientProfile || !clientProfile.phone || clientProfile.phone.trim() === '') {
        return { success: false, error: 'El número de teléfono es obligatorio para agendar citas. Por favor, regístralo en tu Perfil de Configuración.' }
    }

    // Req 3: Obtener servicios y precios
    let selectedServicesList: Array<{ id: string; name: string; price: number; duration: number }> = []
    let totalServicePrice = 0
    let totalDuration = 30
    let serviceTypeName = data.serviceType || 'Consulta'

    if (data.serviceIds && data.serviceIds.length > 0) {
        const dbServices = await prisma.service.findMany({
            where: { id: { in: data.serviceIds }, establishmentId: data.establishmentId }
        })
        if (dbServices.length > 0) {
            selectedServicesList = dbServices.map(s => ({
                id: s.id,
                name: s.name,
                price: s.price,
                duration: s.duration
            }))
            totalServicePrice = dbServices.reduce((sum, s) => sum + s.price, 0)
            totalDuration = dbServices.reduce((sum, s) => sum + s.duration, 0)
            serviceTypeName = dbServices.map(s => s.name).join(' + ')
        }
    } else if (data.serviceType) {
        const dbService = await prisma.service.findFirst({
            where: { name: data.serviceType, establishmentId: data.establishmentId }
        })
        if (dbService) {
            selectedServicesList = [{
                id: dbService.id,
                name: dbService.name,
                price: dbService.price,
                duration: dbService.duration
            }]
            totalServicePrice = dbService.price
            totalDuration = dbService.duration
            serviceTypeName = dbService.name
        } else {
            selectedServicesList = [{
                id: 'default',
                name: data.serviceType,
                price: 0,
                duration: 30
            }]
        }
    }

    const numServices = selectedServicesList.length > 0 ? selectedServicesList.length : 1
    const commissionAmount = data.commissionType === 'booking' ? (5.00 * numServices) : (6.00 * numServices)

    // Req 4: Prevención robusta de solapamientos basada en duraciones reales
    if (data.scheduledAt) {
        const requestedTime = new Date(data.scheduledAt)
        const newStart = requestedTime.getTime()
        const newEnd = newStart + totalDuration * 60000

        // Buscar citas en rango amplio de 4 horas antes/después
        const wideAppointments = await prisma.appointment.findMany({
            where: {
                establishmentId: data.establishmentId,
                status: { notIn: ['cancelled'] },
                scheduledAt: {
                    gte: new Date(requestedTime.getTime() - 4 * 60 * 60 * 1000),
                    lte: new Date(requestedTime.getTime() + 4 * 60 * 60 * 1000)
                }
            }
        })

        let overlapCount = 0
        for (const apt of wideAppointments) {
            if (!apt.scheduledAt) continue
            const aptStart = new Date(apt.scheduledAt).getTime()
            
            let aptDuration = 30
            try {
                const booked = JSON.parse(apt.bookedServices)
                if (Array.isArray(booked) && booked.length > 0) {
                    aptDuration = booked.reduce((sum: number, s: any) => sum + (s.duration || 30), 0)
                }
            } catch {}
            const aptEnd = aptStart + aptDuration * 60000

            // startA < endB && endA > startB
            if (newStart < aptEnd && newEnd > aptStart) {
                overlapCount++
            }
        }

        const est = await prisma.establishment.findUnique({
            where: { id: data.establishmentId },
            select: { concurrentSlots: true }
        })

        if (est && overlapCount >= est.concurrentSlots) {
            return { success: false, error: `El horario seleccionado (${totalDuration} min) tiene cruces de horarios con la capacidad del local. Por favor elige otro horario.` }
        }
    }

    const appointment = await prisma.appointment.create({
        data: {
            clientId: session.sub,
            petId: data.petId,
            establishmentId: data.establishmentId,
            providerId: data.providerId || null,
            serviceType: serviceTypeName,
            commissionType: data.commissionType,
            commissionAmount,
            bookedServices: JSON.stringify(selectedServicesList),
            totalServicePrice,
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

    const merchantId = process.env.IZIPAY_MERCHANT_ID
    const apiPassword = process.env.IZIPAY_API_PASSWORD

    // Determinar la URL del simulador o pasarela real
    let redirectUrl = `/checkout/simulate-payment?appointmentId=${appointmentId}`

    if (merchantId && apiPassword && merchantId !== 'tu_codigo_de_comercio' && apiPassword !== 'tu_clave_de_api_password') {
        try {
            const authHeader = 'Basic ' + Buffer.from(`${merchantId}:${apiPassword}`).toString('base64')
            const apiUrl = process.env.NEXT_PUBLIC_IZIPAY_API_URL || 'https://api.izipay.pe'
            const amountInCents = Math.round(appointment.commissionAmount * 100)
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

            const response = await fetch(`${apiUrl}/api-payment/v4/Charge/CreatePayment`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amountInCents,
                    currency: appointment.currency || 'PEN',
                    orderId: appointment.id,
                    paymentMethodType: "IPG_HOSTED",
                    customer: {
                        email: session.email || ''
                    },
                    redirectionParameters: {
                        successUrl: `${appUrl}/dashboard/client/pending?status=success`,
                        cancelUrl: `${appUrl}/dashboard/client/pending?status=cancel`
                    }
                })
            })

            const data = await response.json()
            if (data.status === 'SUCCESS' && data.answer?.redirectUrl) {
                redirectUrl = data.answer.redirectUrl
            } else {
                console.error('Error Izipay API response in processPayment action:', data)
            }
        } catch (error) {
            console.error('Connection error with Izipay API in processPayment action:', error)
        }
    }

    return {
        success: true,
        redirectUrl
    }
}

export async function getPendingAppointments() {
    const session = await requireRole(['vet', 'provider'])

    return prisma.appointment.findMany({
        where: {
            establishment: {
                ownerId: session.sub
            },
            status: 'paid',
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
            establishment: {
                ownerId: session.sub
            }
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
            otpValidationCode: null,
            otpExpiresAt: null,
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
    attendingName?: string;
    attendingCmvp?: string;
}) {
    const session = await requireRole(['vet'])

    // Fetch profile for fallback CMVP
    const profile = await prisma.profile.findUnique({
        where: { id: session.sub },
        select: { cmvpId: true }
    })
    const fallbackCmvp = profile?.cmvpId || undefined

    // Verificar que la cita está validada o completada y pertenece al vet
    const appointment = await prisma.appointment.findFirst({
        where: {
            id: data.appointmentId,
            providerId: session.sub,
            status: { in: ['validated', 'completed'] },
        },
        include: { pet: true },
    })

    if (!appointment) {
        return {
            success: false,
            message: 'La cita no está activa o no tienes permiso para editarla. Verifica el código de atención primero.'
        }
    }

    // Check if medical record already exists
    const existingRecord = await prisma.medicalRecord.findUnique({
        where: { appointmentId: data.appointmentId }
    })

    let record;
    if (existingRecord) {
        // Check if within 24 hours
        const hoursSinceCreation = (new Date().getTime() - existingRecord.createdAt.getTime()) / (1000 * 60 * 60)
        if (hoursSinceCreation > 24) {
            return {
                success: false,
                message: 'La ficha médica ya fue completada hace más de 24 horas y no se puede editar.'
            }
        }

        // Update existing record
        record = await prisma.medicalRecord.update({
            where: { id: existingRecord.id },
            data: {
                weight: data.weight !== undefined ? data.weight : existingRecord.weight,
                temperature: data.temperature !== undefined ? data.temperature : existingRecord.temperature,
                heartRate: data.heartRate !== undefined ? data.heartRate : existingRecord.heartRate,
                symptoms: JSON.stringify(data.symptoms),
                diagnosis: data.diagnosis || null,
                prescription: data.prescription || null,
                treatment: data.treatment || null,
                nextVisit: data.nextVisit || null,
                attendingName: data.attendingName !== undefined ? data.attendingName : existingRecord.attendingName,
                attendingCmvp: data.attendingCmvp !== undefined ? data.attendingCmvp : existingRecord.attendingCmvp,
            }
        })

        // Update corresponding entry in the pet's medicalHistory array
        const pet = appointment.pet
        let currentHistory: any[] = JSON.parse(pet.medicalHistory)
        
        const appointmentDate = new Date(existingRecord.createdAt).toISOString().split('T')[0]
        let matchIndex = currentHistory.findIndex((entry: any) => entry.appointmentId === data.appointmentId)
        if (matchIndex === -1) {
            // Fallback match
            matchIndex = currentHistory.findIndex((entry: any) => 
                entry.provider === session.fullName && 
                entry.date === appointmentDate
            )
        }

        const isNonClinical = checkIfNonClinical(appointment.serviceType)
        const updatedEntry: any = {
            appointmentId: data.appointmentId,
            date: appointmentDate,
            type: isNonClinical ? 'grooming' : 'consultation',
            description: isNonClinical ? (appointment.serviceType || 'Servicio de Estética') : (data.diagnosis || 'Consulta general'),
            provider: data.attendingName || session.fullName,
            providerCmvp: isNonClinical ? 'No aplica' : (data.attendingCmvp || fallbackCmvp),
            notes: isNonClinical ? undefined : data.prescription,
            treatment: data.treatment || undefined
        }

        if (matchIndex > -1) {
            currentHistory[matchIndex] = updatedEntry
        } else {
            currentHistory.push(updatedEntry)
        }

        await prisma.pet.update({
            where: { id: pet.id },
            data: { medicalHistory: JSON.stringify(currentHistory) }
        })
    } else {
        // Create new record
        record = await prisma.medicalRecord.create({
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
                attendingName: data.attendingName || null,
                attendingCmvp: data.attendingCmvp || null,
            }
        })

        // Add to pet's medicalHistory array
        const pet = appointment.pet
        const currentHistory: any[] = JSON.parse(pet.medicalHistory)
        const isNonClinical = checkIfNonClinical(appointment.serviceType)
        const newEntry: any = {
            appointmentId: data.appointmentId,
            date: new Date().toISOString().split('T')[0],
            type: isNonClinical ? 'grooming' : 'consultation',
            description: isNonClinical ? (appointment.serviceType || 'Servicio de Estética') : (data.diagnosis || 'Consulta general'),
            provider: data.attendingName || session.fullName,
            providerCmvp: isNonClinical ? 'No aplica' : (data.attendingCmvp || fallbackCmvp),
            notes: isNonClinical ? undefined : data.prescription,
            treatment: data.treatment || undefined
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
    }

    // Crear recordatorio automático si hay próxima visita
    if (data.nextVisit && appointment.clientId) {
        // Delete existing reminder for this appointment if any, to avoid duplicate controls
        await prisma.reminder.deleteMany({
            where: { appointmentId: appointment.id }
        })
        
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
    attendingName?: string;
    attendingCmvp?: string;
    serviceType?: string;
}) {
    const session = await requireRole(['vet'])

    // Fetch profile for fallback CMVP
    const profile = await prisma.profile.findUnique({
        where: { id: session.sub },
        select: { cmvpId: true }
    })
    const fallbackCmvp = profile?.cmvpId || undefined

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
    let clientProfile = await prisma.profile.findUnique({ where: { email } })
    
    if (!clientProfile) {
        clientProfile = await prisma.profile.create({
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
        where: { ownerId: clientProfile.id, name: { equals: data.guestPetName, mode: 'insensitive' } }
    })
    
    if (!pet) {
        pet = await prisma.pet.create({
            data: {
                ownerId: clientProfile.id,
                name: data.guestPetName,
                species: data.guestPetSpecies
            }
        })
    }

    // 3. Crear cita (completada)
    const appointment = await prisma.appointment.create({
        data: {
            clientId: clientProfile.id,
            petId: pet.id,
            establishmentId: est.id,
            providerId: session.sub,
            status: 'completed',
            serviceType: data.serviceType || 'consultation',
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
            attendingName: data.attendingName || null,
            attendingCmvp: data.attendingCmvp || null,
        }
    })

    // 5. Agregar al historial clínico de la mascota
    const currentHistory: any[] = JSON.parse(pet.medicalHistory || '[]')
    const isNonClinical = checkIfNonClinical(data.serviceType)
    const newEntry: any = {
        appointmentId: appointment.id,
        date: new Date().toISOString().split('T')[0],
        type: isNonClinical ? 'grooming' : 'consultation',
        description: isNonClinical ? (data.serviceType || 'Servicio de Estética') : (data.diagnosis || 'Consulta general'),
        provider: data.attendingName || session.fullName,
        providerCmvp: isNonClinical ? 'No aplica' : (data.attendingCmvp || fallbackCmvp),
        notes: isNonClinical ? undefined : data.prescription,
        treatment: data.treatment || undefined
    }
    currentHistory.push(newEntry)

    await prisma.pet.update({
        where: { id: pet.id },
        data: { medicalHistory: JSON.stringify(currentHistory) }
    })

    // 6. Cobrar la comisión a las finanzas del Vet
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
        where: { 
            clientId: session.sub,
            status: { not: 'pending' }
        },
        include: {
            pet: true,
            establishment: {
                include: {
                    services: {
                        where: { isActive: true }
                    }
                }
            },
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
            status: { not: 'pending' },
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

export async function getMedicalRecordByAppointment(appointmentId: string) {
    const session = await requireRole(['vet', 'provider'])

    const record = await prisma.medicalRecord.findUnique({
        where: { appointmentId },
        include: {
            appointment: {
                select: {
                    pet: true,
                    client: true,
                }
            }
        }
    })

    if (!record) return null

    // Check if within 24 hours of creation
    const isEditable = (new Date().getTime() - record.createdAt.getTime()) <= 24 * 60 * 60 * 1000

    return {
        ...record,
        isEditable,
        symptoms: JSON.parse(record.symptoms) as string[],
    }
}

export async function getPetHistoryForProvider(petId: string, appointmentId: string) {
    const session = await requireRole(['vet', 'provider'])

    // Fetch the appointment to check its date/time
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { scheduledAt: true }
    })

    if (!appointment) return []

    const appointmentTime = appointment.scheduledAt ? new Date(appointment.scheduledAt) : new Date()

    // Fetch all medical records for this pet that were created at or BEFORE the appointment's scheduled date
    const records = await prisma.medicalRecord.findMany({
        where: {
            appointment: { petId },
            createdAt: { lte: appointmentTime }
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

export async function getAppointmentForVet(appointmentId: string) {
    const session = await requireRole(['vet', 'provider'])

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            pet: true,
            client: true,
            establishment: {
                select: {
                    id: true,
                    name: true,
                    specialists: true
                }
            }
        }
    })

    if (!appointment) return null

    // Fetch existing medical record if any
    const record = await prisma.medicalRecord.findUnique({
        where: { appointmentId }
    })

    let isEditable = true
    let symptoms: string[] = []
    if (record) {
        isEditable = (new Date().getTime() - record.createdAt.getTime()) <= 24 * 60 * 60 * 1000
        try {
            symptoms = JSON.parse(record.symptoms) as string[]
        } catch {
            symptoms = []
        }
    }

    // Fetch history before this appointment
    const appointmentTime = appointment.scheduledAt ? new Date(appointment.scheduledAt) : new Date()
    const history = await prisma.medicalRecord.findMany({
        where: {
            appointment: { petId: appointment.petId },
            createdAt: { lte: appointmentTime },
            // If the record exists, exclude it from past history list
            id: record ? { not: record.id } : undefined
        },
        include: {
            vet: { select: { fullName: true, cmvpId: true } },
            appointment: {
                select: { scheduledAt: true, serviceType: true, establishment: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return {
        appointment: {
            id: appointment.id,
            serviceType: appointment.serviceType,
            status: appointment.status,
            scheduledAt: appointment.scheduledAt,
            notes: appointment.notes,
            pet: appointment.pet,
            client: appointment.client,
            establishment: appointment.establishment,
        },
        record: record ? {
            ...record,
            symptoms,
            isEditable,
        } : null,
        history,
    }
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
    if (!session) return { todayCount: 0, monthRevenue: 0, pendingOtp: 0, completedTotal: 0, estStats: [], specStats: [] }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today.getTime() + 86400000)
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [todayCount, monthAppointments, pendingOtp, completedTotal, establishments, medicalRecords] = await Promise.all([
        prisma.appointment.count({
            where: {
                providerId: session.sub,
                scheduledAt: { gte: today, lt: tomorrow },
                status: { not: 'pending' },
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
        prisma.establishment.findMany({
            where: { ownerId: session.sub },
            select: {
                id: true,
                name: true,
                specialists: true,
                appointments: {
                    where: { status: { not: 'pending' } },
                    select: {
                        status: true,
                    }
                }
            }
        }),
        prisma.medicalRecord.findMany({
            where: { vetId: session.sub },
            select: {
                attendingName: true,
                attendingCmvp: true,
            }
        })
    ])

    const monthRevenue = monthAppointments.reduce((acc, a) => acc + a.commissionAmount, 0)

    const estStats = establishments.map(est => {
        const pending = est.appointments.filter(a => a.status === 'paid').length
        const completed = est.appointments.filter(a => a.status === 'completed' || a.status === 'validated').length
        const total = est.appointments.length
        return {
            id: est.id,
            name: est.name,
            pending,
            completed,
            total
        }
    })

    // Compute specialist stats
    const specStatsMap = new Map<string, { name: string; cmvpId: string; count: number }>()
    
    // Pre-fill registered specialists
    establishments.forEach(est => {
        try {
            const specs = JSON.parse(est.specialists || '[]')
            if (Array.isArray(specs)) {
                specs.forEach((s: any) => {
                    if (s.cmvpId) {
                        specStatsMap.set(s.cmvpId, {
                            name: s.name,
                            cmvpId: s.cmvpId,
                            count: 0
                        })
                    }
                })
            }
        } catch {}
    })

    // Count medical records
    let defaultCount = 0
    medicalRecords.forEach(rec => {
        if (rec.attendingCmvp && specStatsMap.has(rec.attendingCmvp)) {
            const spec = specStatsMap.get(rec.attendingCmvp)!
            spec.count += 1
        } else {
            defaultCount += 1
        }
    })

    const specStats = Array.from(specStatsMap.values())
    // Add default veterinarian (owner)
    specStats.unshift({
        name: 'Veterinario Principal (Dueño)',
        cmvpId: 'Principal',
        count: defaultCount
    })

    return { 
        todayCount, 
        monthRevenue, 
        pendingOtp, 
        completedTotal, 
        estStats, 
        specStats 
    }
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
            creditBalance: true,
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
    const establishments = await prisma.establishment.findMany({
        where: { ownerId: session.sub },
        include: { services: { where: { isActive: true } } },
        orderBy: { createdAt: 'desc' },
    })

    const updatedEstablishments = []
    for (const est of establishments) {
        if (!est.dni) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
            const generatedDni = `EST-${randomDigits}`
            await prisma.establishment.update({
                where: { id: est.id },
                data: { dni: generatedDni }
            })
            est.dni = generatedDni
        }
        updatedEstablishments.push(est)
    }
    return updatedEstablishments
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

    const operatingDays = formData.get('operatingDays') as string || '["mon","tue","wed","thu","fri","sat","sun"]'
    const startHour = formData.get('startHour') as string || '08:00'
    const endHour = formData.get('endHour') as string || '20:00'
    const operatingHours = JSON.stringify({ start: startHour, end: endHour })
    const workOnHolidays = formData.get('workOnHolidays') === 'true'

    if (!name || isNaN(price)) return { message: 'Nombre y precio son requeridos' }

    await prisma.service.create({
        data: {
            establishmentId,
            name,
            description: description || null,
            price,
            duration,
            category,
            operatingDays,
            operatingHours,
            workOnHolidays,
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
        include: { establishment: { select: { name: true, ownerId: true, id: true } } }
    })
    if (!service || service.establishment.ownerId !== session.sub) {
        return { message: 'No autorizado' }
    }

    const newPrice = parseFloat(formData.get('price') as string)
    const oldPrice = service.price

    // If price has changed, send alerts to clients with active reservations
    if (!isNaN(newPrice) && newPrice !== oldPrice) {
        const activeAppointments = await prisma.appointment.findMany({
            where: {
                establishmentId: service.establishmentId,
                status: { in: ['pending', 'paid'] }
            }
        })

        for (const appt of activeAppointments) {
            try {
                const svcs = JSON.parse(appt.bookedServices || '[]')
                const hasService = svcs.some((s: any) => s.id === id)
                if (hasService) {
                    await prisma.reminder.create({
                        data: {
                            clientId: appt.clientId,
                            createdBy: session.sub,
                            type: 'alerta',
                            title: `Cambio de precio en ${service.name}`,
                            message: `El precio del servicio "${service.name}" en "${service.establishment.name}" ha sido actualizado de S/ ${oldPrice.toFixed(2)} a S/ ${newPrice.toFixed(2)}. Tu reserva actual se respetará con la tarifa contratada originalmente.`,
                            dueDate: new Date().toISOString().split('T')[0],
                        }
                    })
                }
            } catch (err) {
                console.error("Error parsing bookedServices", err)
            }
        }
    }

    const operatingDays = formData.get('operatingDays') as string || '["mon","tue","wed","thu","fri","sat","sun"]'
    const startHour = formData.get('startHour') as string || '08:00'
    const endHour = formData.get('endHour') as string || '20:00'
    const operatingHours = JSON.stringify({ start: startHour, end: endHour })
    const workOnHolidays = formData.get('workOnHolidays') === 'true'

    await prisma.service.update({
        where: { id },
        data: {
            name: formData.get('name') as string,
            description: (formData.get('description') as string) || null,
            price: newPrice,
            duration: parseInt(formData.get('duration') as string) || 30,
            category: (formData.get('category') as string) || 'general',
            operatingDays,
            operatingHours,
            workOnHolidays,
            tariffUpdatedAt: new Date()
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
    const logoBase64 = formData.get('logoBase64') as string

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

    let logoUrl: string | null | undefined = undefined
    if (logoBase64 !== null && logoBase64 !== undefined) {
        if (logoBase64 === '') {
            logoUrl = null
        } else if (logoBase64.startsWith('data:image')) {
            try {
                logoUrl = await uploadImage(logoBase64, 'logos')
            } catch (e) {
                console.error("Error uploading logo in updateEstablishment:", e)
            }
        } else if (logoBase64.startsWith('http')) {
            logoUrl = logoBase64
        }
    }

    const blockedDates = formData.get('blockedDates') as string
    const specialists = formData.get('specialists') as string

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
            blockedDates: blockedDates !== null && blockedDates !== undefined ? blockedDates : undefined,
            specialists: specialists !== null && specialists !== undefined ? specialists : undefined,
            concurrentSlots,
            photoUrl: photoUrl !== undefined ? photoUrl : undefined,
            logoUrl: logoUrl !== undefined ? logoUrl : undefined,
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
}

export async function sendCustomEmailFromAdmin({ userId, subject, body }: { userId: string; subject: string; body: string }) {
    await requireRole(['admin'])
    
    const user = await prisma.profile.findUnique({
        where: { id: userId }
    })
    
    if (!user) {
        return { success: false, error: 'Usuario no encontrado.' }
    }

    const { sendEmail } = await import('./mail')
    
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #078EAD; margin: 0;">Mensaje de Administración de Brofy</h2>
            </div>
            <p>Estimado/a <strong>${user.fullName}</strong>,</p>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #334155;">${body}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #64748b; text-align: center;">Este es un mensaje administrativo puntual enviado directamente desde la administración de Brofy.</p>
        </div>
    `

    const res = await sendEmail({
        to: user.email,
        subject: `Brofy Admin: ${subject}`,
        html
    })

    if (res.success) {
        return { success: true }
    } else {
        return { success: false, error: res.error }
    }
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

// ============================================================================
// REAL CREDITS, CLAIMS, RESCHEDULING & TIME LIMITATION ACTIONS
// ============================================================================

export async function bookWithCredits(appointmentId: string) {
    const session = await requireRole(['client'])
    
    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, clientId: session.sub, status: 'pending' }
    })
    if (!appointment) return { success: false, message: 'Cita no encontrada' }
    
    const client = await prisma.profile.findUnique({
        where: { id: session.sub },
        select: { creditBalance: true }
    })
    if (!client || client.creditBalance < appointment.commissionAmount) {
        return { success: false, message: 'Saldo de créditos insuficiente' }
    }
    
    // Deduce el saldo de créditos y marca la cita como pagada
    await prisma.$transaction([
        prisma.profile.update({
            where: { id: session.sub },
            data: { creditBalance: { decrement: appointment.commissionAmount } }
        }),
        prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'paid',
                otpValidationCode: Math.floor(100000 + Math.random() * 900000).toString(),
                otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        })
    ])
    
    revalidatePath('/dashboard/client')
    revalidatePath('/dashboard/client/pending')
    return { success: true }
}

export async function fileDenuncia(appointmentId: string, reason: string) {
    const session = await requireRole(['client'])

    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            clientId: session.sub,
            status: { in: ['paid', 'confirmed', 'validated'] },
        },
        include: { client: true }
    })
    if (!appointment) return { success: false, message: 'Cita no encontrada o no tiene un estado válido para denuncia.' }

    // Verificar que el horario programado ya haya pasado
    if (appointment.scheduledAt && new Date(appointment.scheduledAt).getTime() > Date.now()) {
        return { success: false, message: 'Solo puedes reportar inasistencia después de la hora programada de la cita.' }
    }

    await prisma.appointment.update({
        where: { id: appointmentId },
        data: { 
            status: 'disputed', 
            denunciaReason: reason,
            denunciaStatus: 'pending',
            notes: appointment.notes ? `${appointment.notes}\n[Denuncia: ${reason}]` : `Denuncia: ${reason}`
        }
    })

    revalidatePath('/dashboard/client')
    revalidatePath('/dashboard/client/pending')
    return { success: true, message: 'Tu reporte ha sido enviado. Un administrador de Brofy revisará la inasistencia y, de ser validada, se te reembolsarán tus Huellitas.' }
}
export async function proposeReschedule(appointmentId: string, newDate: string, notes: string) {
    const session = await requireSession()

    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            OR: [
                { clientId: session.sub },
                { providerId: session.sub },
                { establishment: { ownerId: session.sub } }
            ]
        }
    })
    if (!appointment) return { success: false, message: 'Cita no encontrada o no tienes autorización' }

    await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            rescheduledAt: new Date(newDate),
            rescheduleProposedBy: session.sub,
            notes: notes ? `${appointment.notes || ''} [Propuesta Reprog (${session.role === 'client' ? 'Cliente' : 'Proveedor'}): ${notes}]` : appointment.notes
        }
    })

    if (session.role === 'client') {
        // Alert the provider
        if (appointment.providerId) {
            await prisma.reminder.create({
                data: {
                    clientId: appointment.providerId,
                    createdBy: session.sub,
                    type: 'control',
                    title: 'Contrapropuesta de Reprogramación (Cliente)',
                    message: `${session.fullName} (Cliente) ha propuesto una fecha alternativa para la cita: el ${new Date(newDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.`,
                    dueDate: new Date().toISOString().split('T')[0]
                }
            })
        }
    } else {
        // Alert the client
        if (appointment.clientId) {
            await prisma.reminder.create({
                data: {
                    clientId: appointment.clientId,
                    createdBy: session.sub,
                    type: 'control',
                    title: 'Propuesta de Reprogramación de Cita',
                    message: `${session.fullName} ha propuesto reprogramar la cita para el ${new Date(newDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}. Acepta en tu pestaña de Pendientes sin costo adicional o propón tu propio horario.`,
                    dueDate: new Date().toISOString().split('T')[0]
                }
            })
        }
    }

    revalidatePath('/dashboard/vet')
    revalidatePath('/dashboard/client')
    revalidatePath('/dashboard/client/pending')
    return { success: true }
}

export async function acceptReschedule(appointmentId: string) {
    const session = await requireSession()

    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            OR: [
                { clientId: session.sub },
                { providerId: session.sub },
                { establishment: { ownerId: session.sub } }
            ]
        }
    })
    if (!appointment || !appointment.rescheduledAt) {
        return { success: false, message: 'Cita o propuesta de reprogramación no encontrada' }
    }

    if (appointment.rescheduleProposedBy === session.sub) {
        return { success: false, message: 'No puedes aceptar tu propia propuesta de reprogramación' }
    }

    await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            scheduledAt: appointment.rescheduledAt,
            rescheduledAt: null,
            rescheduleProposedBy: null,
        }
    })

    revalidatePath('/dashboard/client')
    revalidatePath('/dashboard/client/pending')
    revalidatePath('/dashboard/vet')
    return { success: true }
}

export async function getAllDisputedAppointments() {
    const session = await requireRole(['admin'])
    
    return prisma.appointment.findMany({
        where: {
            OR: [
                { status: 'disputed' },
                { denunciaStatus: 'pending' }
            ]
        },
        include: {
            client: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    creditBalance: true
                }
            },
            pet: {
                select: {
                    id: true,
                    name: true,
                    species: true,
                    breed: true,
                    cuh: true
                }
            },
            establishment: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    ownerId: true,
                    dni: true,
                    owner: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                            email: true
                        }
                    }
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function resolveDenunciaAdmin(
    appointmentId: string,
    status: 'resolved_refunded' | 'resolved_rejected',
    applySanction: boolean
) {
    const session = await requireRole(['admin'])

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { client: true }
    })

    if (!appointment) return { success: false, message: 'Cita no encontrada.' }

    try {
        if (status === 'resolved_refunded') {
            await prisma.$transaction([
                prisma.appointment.update({
                    where: { id: appointmentId },
                    data: {
                        status: 'cancelled',
                        denunciaStatus: 'resolved_refunded',
                        notes: `${appointment.notes || ''}\n[Resolución Admin: A favor del cliente. Reembolso de ${appointment.commissionAmount * 100} Huellitas. ${applySanction ? 'SANCIÓN APLICADA al proveedor.' : ''}]`
                    }
                }),
                prisma.profile.update({
                    where: { id: appointment.clientId },
                    data: {
                        creditBalance: {
                            increment: appointment.commissionAmount
                        }
                    }
                })
            ])
            revalidatePath('/dashboard/admin')
            revalidatePath('/dashboard/client/pending')
            return { success: true, message: `Disputa resuelta a favor del cliente. Se reembolsaron ${(appointment.commissionAmount * 100).toFixed(0)} Huellitas.` }
        } else {
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: {
                    status: 'cancelled',
                    denunciaStatus: 'resolved_rejected',
                    notes: `${appointment.notes || ''}\n[Resolución Admin: A favor del proveedor. Sin reembolso. ${applySanction ? 'SANCIÓN APLICADA al proveedor.' : ''}]`
                }
            })
            revalidatePath('/dashboard/admin')
            revalidatePath('/dashboard/client/pending')
            return { success: true, message: 'Disputa resuelta a favor del proveedor. Reembolso denegado.' }
        }
    } catch (e) {
        console.error('Error resolving dispute:', e)
        return { success: false, message: 'Ocurrió un error al procesar la resolución.' }
    }
}

export async function acceptPriceChange(appointmentId: string) {
    const session = await getSession()
    if (!session) return { success: false, message: 'No autenticado' }

    const apt = await prisma.appointment.findFirst({
        where: { id: appointmentId, clientId: session.sub },
        include: { establishment: { include: { services: true } } }
    })
    if (!apt) return { success: false, message: 'Cita no encontrada' }

    try {
        const bookedSvcs = JSON.parse(apt.bookedServices || '[]')
        let totalNewPrice = 0
        const updatedBookedSvcs = bookedSvcs.map((s: any) => {
            const master = apt.establishment.services.find(m => m.id === s.id)
            if (master) {
                totalNewPrice += master.price
                return { ...s, price: master.price }
            }
            totalNewPrice += s.price
            return s
        })

        await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                bookedServices: JSON.stringify(updatedBookedSvcs),
                totalServicePrice: totalNewPrice
            }
        })

        revalidatePath('/dashboard/client/pending')
        return { success: true }
    } catch (err) {
        return { success: false, message: 'Error al aceptar tarifa' }
    }
}

export async function cancelAppointmentWithRefund(appointmentId: string) {
    const session = await getSession()
    if (!session) return { success: false, message: 'No autenticado' }

    const apt = await prisma.appointment.findFirst({
        where: { id: appointmentId, clientId: session.sub }
    })
    if (!apt) return { success: false, message: 'Cita no encontrada' }
    if (apt.status === 'cancelled' || apt.status === 'completed') {
        return { success: false, message: 'Cita ya finalizada' }
    }

    const refundCredits = apt.commissionAmount

    try {
        await prisma.$transaction([
            prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: 'cancelled' }
            }),
            prisma.profile.update({
                where: { id: apt.clientId },
                data: { creditBalance: { increment: refundCredits } }
            })
        ])

        revalidatePath('/dashboard/client/pending')
        return { success: true }
    } catch (err) {
        return { success: false, message: 'Error al cancelar la cita' }
    }
}
