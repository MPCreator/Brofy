/**
 * BROFY — Script de reinicio de base de datos
 * 
 * Borra TODOS los datos y restaura el estado inicial con perfiles enriquecidos de Cloudinary:
 *   - admin@brofy.pe (Administrador)
 *   - cliente@brofy.pe / María López (Cliente con 2 mascotas)
 *   - vet@brofy.pe / Dr. Carlos Mendoza (Veterinario con clínica, hospital, citas y recetas)
 *   - servicios@brofy.pe / Ana Ríos Pet Spa (Proveedor con spa, paseos, recordatorios y transacciones)
 * 
 * USO: npm run db:reset
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Cloudinary image resolution helper
const cloudName = (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'tu_cloud_name')
    ? process.env.CLOUDINARY_CLOUD_NAME
    : 'demo';

const getCloudinaryUrl = (publicId: string) => `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;

async function main() {
    console.log('🧹 Reiniciando base de datos y cargando datos con Cloudinary...')

    // Borrar en orden para respetar llaves foráneas
    await prisma.review.deleteMany()
    await prisma.claim.deleteMany()
    await prisma.reminder.deleteMany()
    await prisma.medicalRecord.deleteMany()
    await prisma.appointment.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.service.deleteMany()
    await prisma.pet.deleteMany()
    await prisma.establishment.deleteMany()
    await prisma.profile.deleteMany()

    console.log('   ✅ Datos antiguos eliminados')

    const hashedPassword = await bcrypt.hash('123456', 10)

    // --- Admin ---
    await prisma.profile.create({
        data: {
            email: 'admin@brofy.pe',
            password: hashedPassword,
            fullName: 'Administrador Brofy',
            role: 'admin',
        }
    })

    // --- Cliente ---
    const clientUser = await prisma.profile.create({
        data: {
            email: 'cliente@brofy.pe',
            password: hashedPassword,
            fullName: 'María López García',
            role: 'client',
            phone: '+51999111222',
            avatarUrl: getCloudinaryUrl('samples/people/smiling-man'),
            latitude: -12.0900,
            longitude: -77.0500,
        }
    })

    // --- Veterinario ---
    const vetUser = await prisma.profile.create({
        data: {
            email: 'vet@brofy.pe',
            password: hashedPassword,
            fullName: 'Dr. Carlos Mendoza Ríos',
            role: 'vet',
            cmvpId: 'CMVP-12345',
            cmvpValidated: true,
            phone: '+51999333444',
            avatarUrl: getCloudinaryUrl('samples/people/doctor'),
            latitude: -12.0850,
            longitude: -77.0450,
        }
    })

    // --- Proveedor de Servicios ---
    const providerUser = await prisma.profile.create({
        data: {
            email: 'servicios@brofy.pe',
            password: hashedPassword,
            fullName: 'Ana Ríos Pet Spa',
            role: 'provider',
            phone: '+51999555666',
            avatarUrl: getCloudinaryUrl('samples/people/girl-picture'),
            latitude: -12.1000,
            longitude: -77.0300,
        }
    })

    console.log('   ✅ Cuentas base creadas (Admin, Cliente, Vet, Servicios)')

    // --- Establecimientos ---
    const clinic = await prisma.establishment.create({
        data: {
            ownerId: vetUser.id,
            name: 'Clínica Veterinaria San Borja',
            address: 'Av. San Borja Norte 345, San Borja',
            district: 'San Borja',
            city: 'Lima',
            latitude: -12.0870,
            longitude: -77.0050,
            type: 'clinic',
            phone: '+5114567890',
            description: 'Clínica veterinaria con 15 años de experiencia. Atención integral 24/7 para emergencias.',
            rating: 4.8,
            logoUrl: getCloudinaryUrl('samples/people/doctor'),
            photoUrl: getCloudinaryUrl('samples/landscapes/architecture-interior'),
            operatingHours: JSON.stringify({
                mon: { open: '08:00', close: '20:00' },
                tue: { open: '08:00', close: '20:00' },
                wed: { open: '08:00', close: '20:00' },
                thu: { open: '08:00', close: '20:00' },
                fri: { open: '08:00', close: '20:00' },
                sat: { open: '09:00', close: '14:00' },
            }),
        }
    })

    const groomerShop = await prisma.establishment.create({
        data: {
            ownerId: providerUser.id,
            name: 'Huellitas Grooming & Pet Spa',
            address: 'Av. Larco 789, Miraflores',
            district: 'Miraflores',
            city: 'Lima',
            latitude: -12.1220,
            longitude: -77.0310,
            type: 'groomer',
            phone: '+5119876543',
            description: 'El mejor spa para tus engreídos. Baños medicados, corte de pelo estilizado y masajes relajantes.',
            rating: 4.5,
            logoUrl: getCloudinaryUrl('samples/people/girl-picture'),
            photoUrl: getCloudinaryUrl('samples/indoor-flowers'),
            operatingHours: JSON.stringify({
                mon: { open: '09:00', close: '18:00' },
                tue: { open: '09:00', close: '18:00' },
                wed: { open: '09:00', close: '18:00' },
                thu: { open: '09:00', close: '18:00' },
                fri: { open: '09:00', close: '18:00' },
                sat: { open: '09:00', close: '18:00' },
            }),
        }
    })

    const hospital = await prisma.establishment.create({
        data: {
            ownerId: vetUser.id,
            name: 'Hospital Veterinario de Lima',
            address: 'Av. Javier Prado Este 1234, La Molina',
            district: 'La Molina',
            city: 'Lima',
            latitude: -12.0780,
            longitude: -76.9500,
            type: 'hospital',
            phone: '+5113456789',
            description: 'Hospital especializado con quirófano, UCI y laboratorio clínico.',
            rating: 4.9,
            logoUrl: getCloudinaryUrl('samples/people/doctor'),
            photoUrl: getCloudinaryUrl('samples/landscapes/architecture-interior'),
            operatingHours: JSON.stringify({
                mon: { open: '00:00', close: '23:59' },
                tue: { open: '00:00', close: '23:59' },
                wed: { open: '00:00', close: '23:59' },
                thu: { open: '00:00', close: '23:59' },
                fri: { open: '00:00', close: '23:59' },
                sat: { open: '00:00', close: '23:59' },
                sun: { open: '00:00', close: '23:59' },
            }),
        }
    })

    const walker = await prisma.establishment.create({
        data: {
            ownerId: providerUser.id,
            name: 'PaseosPro Lima',
            address: 'Parque Kennedy, Miraflores',
            district: 'Miraflores',
            city: 'Lima',
            latitude: -12.1190,
            longitude: -77.0290,
            type: 'walker',
            phone: '+51987654321',
            description: 'Paseos seguros y divertidos. Grupos pequeños, GPS en tiempo real.',
            rating: 4.3,
            logoUrl: getCloudinaryUrl('samples/people/girl-picture'),
            photoUrl: getCloudinaryUrl('samples/landscapes/nature-mountains'),
            operatingHours: JSON.stringify({
                mon: { open: '06:00', close: '19:00' },
                tue: { open: '06:00', close: '19:00' },
                wed: { open: '06:00', close: '19:00' },
                thu: { open: '06:00', close: '19:00' },
                fri: { open: '06:00', close: '19:00' },
                sat: { open: '07:00', close: '17:00' },
                sun: { open: '07:00', close: '12:00' },
            }),
        }
    })

    console.log('   ✅ Establecimientos creados')

    // --- Servicios ---
    await prisma.service.createMany({
        data: [
            { establishmentId: clinic.id, name: 'Consulta General', price: 80, duration: 30, category: 'consultation', description: 'Revisión completa del paciente', operatingDays: '["mon","tue","wed","thu","fri","sat"]', operatingHours: '{"start":"08:00","end":"20:00"}', workOnHolidays: false },
            { establishmentId: clinic.id, name: 'Vacunación Completa', price: 60, duration: 15, category: 'vaccination', description: 'Incluye vacuna y registro en carnet', operatingDays: '["mon","tue","wed","thu","fri","sat"]', operatingHours: '{"start":"08:00","end":"20:00"}', workOnHolidays: false },
            { establishmentId: clinic.id, name: 'Desparasitación Interna', price: 40, duration: 15, category: 'deworming', description: 'Interna y externa', operatingDays: '["mon","tue","wed","thu","fri","sat"]', operatingHours: '{"start":"08:00","end":"20:00"}', workOnHolidays: false },
            { establishmentId: clinic.id, name: 'Examen de Sangre', price: 120, duration: 20, category: 'test', description: 'Hemograma completo', operatingDays: '["mon","tue","wed","thu","fri"]', operatingHours: '{"start":"08:00","end":"17:00"}', workOnHolidays: false },
            { establishmentId: clinic.id, name: 'Esterilización Especializada', price: 280, duration: 120, category: 'surgery', description: 'Incluye anestesia y seguimiento post-operatorio', operatingDays: '["mon","wed","fri"]', operatingHours: '{"start":"09:00","end":"13:00"}', workOnHolidays: false },
            
            { establishmentId: groomerShop.id, name: 'Grooming Completo Canino', price: 70, duration: 60, category: 'grooming', description: 'Baño, corte de pelo estilizado, corte de uñas y limpieza de oídos', operatingDays: '["mon","tue","wed","thu","fri","sat","sun"]', operatingHours: '{"start":"09:00","end":"18:00"}', workOnHolidays: false },
            { establishmentId: groomerShop.id, name: 'Baño Medicado Antipulgas', price: 45, duration: 45, category: 'grooming', description: 'Baño profundo con champú antiparasitario', operatingDays: '["mon","tue","wed","thu","fri","sat","sun"]', operatingHours: '{"start":"09:00","end":"18:00"}', workOnHolidays: false },
            { establishmentId: groomerShop.id, name: 'Paseo Grupal Dinámico', price: 25, duration: 90, category: 'walk', description: '90 minutos de recreación con paseador profesional', operatingDays: '["sat","sun"]', operatingHours: '{"start":"07:00","end":"11:00"}', workOnHolidays: true },
            { establishmentId: groomerShop.id, name: 'Hospedaje Pet Daycare (Día)', price: 90, duration: 480, category: 'general', description: 'Cuidado premium diurno con juegos', operatingDays: '["mon","tue","wed","thu","fri","sat","sun"]', operatingHours: '{"start":"08:00","end":"18:00"}', workOnHolidays: true },
        ]
    })

    console.log('   ✅ Servicios y tarifas de demo creados')

    // --- Mascotas ---
    const firulais = await prisma.pet.create({
        data: {
            ownerId: clientUser.id,
            name: 'Firulais',
            species: 'dog',
            breed: 'Golden Retriever',
            dateOfBirth: '2021-03-15',
            weight: 32.5,
            sex: 'male',
            photoUrl: getCloudinaryUrl('samples/animals/dog'),
            medicalHistory: JSON.stringify([
                {
                    date: '2025-01-05',
                    type: 'vaccination',
                    description: 'Vacuna Antirrábica (refuerzo anual)',
                    provider: 'Dr. Carlos Mendoza Ríos',
                    providerCmvp: 'CMVP-12345',
                },
            ]),
        }
    })

    const mishi = await prisma.pet.create({
        data: {
            ownerId: clientUser.id,
            name: 'Mishi',
            species: 'cat',
            breed: 'Persa',
            dateOfBirth: '2022-08-01',
            weight: 4.2,
            sex: 'female',
            photoUrl: getCloudinaryUrl('samples/animals/cat'),
            medicalHistory: JSON.stringify([]),
        }
    })

    console.log('   ✅ Mascotas creadas')

    // --- Citas, Fichas Médicas y Reseñas ---
    const completedApt = await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: firulais.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'completed',
            serviceType: 'Consulta General',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '123456',
            paymentId: 'pay_brofy_001_reset',
            notes: 'Revisión periódica de vacunas',
            scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
            totalServicePrice: 80.00
        }
    })

    await prisma.medicalRecord.create({
        data: {
            appointmentId: completedApt.id,
            vetId: vetUser.id,
            weight: 32.5,
            temperature: 38.6,
            heartRate: 90,
            symptoms: JSON.stringify(['Letargia', 'Inapetencia']),
            diagnosis: 'Dermatitis alérgica leve',
            prescription: 'Prednisolona 5mg, 1 tableta cada 12 horas por 7 días.\nShampoo de avena en cada baño.',
            treatment: 'Limpieza de zona afectada y aplicación de crema calmante.',
            nextVisit: '2026-06-15',
        }
    })

    await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: mishi.id,
            establishmentId: clinic.id,
            providerId: vetUser.id,
            status: 'paid',
            serviceType: 'Vacunación Completa',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '887766',
            paymentId: 'pay_brofy_002_reset',
            scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // En 2 días
            totalServicePrice: 60.00
        }
    })

    const groomingApt = await prisma.appointment.create({
        data: {
            clientId: clientUser.id,
            petId: firulais.id,
            establishmentId: groomerShop.id,
            providerId: providerUser.id,
            status: 'completed',
            serviceType: 'Grooming Completo Canino',
            commissionType: 'booking',
            commissionAmount: 5.00,
            otpValidationCode: '112233',
            paymentId: 'pay_brofy_003_reset',
            notes: 'Corte Golden bajo',
            scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
            totalServicePrice: 70.00
        }
    })

    await prisma.review.create({
        data: {
            appointmentId: groomingApt.id,
            clientId: clientUser.id,
            establishmentId: groomerShop.id,
            rating: 5,
            comment: 'Excelente servicio. Firulais quedó súper limpio y oliendo delicioso. Lo recomiendo ampliamente!'
        }
    })

    console.log('   ✅ Citas, historiales clínicos y reseñas cargados')

    // --- Recordatorios ---
    await prisma.reminder.createMany({
        data: [
            {
                clientId: clientUser.id,
                petId: firulais.id,
                createdBy: vetUser.id,
                type: 'control',
                title: 'Control de Alergia Dermatológica',
                message: 'Traer a Firulais para control veterinario por su dermatitis.',
                dueDate: '2026-06-15',
                isCompleted: false
            },
            {
                clientId: clientUser.id,
                petId: mishi.id,
                createdBy: clientUser.id,
                type: 'vaccination',
                title: 'Refuerzo de Vacuna Triple Felina',
                message: 'Toca vacuna anual.',
                dueDate: '2026-07-01',
                isCompleted: false
            }
        ]
    })

    console.log('   ✅ Recordatorios creados')

    // --- Transacciones (Finanzas) ---
    const todayStr = new Date().toISOString().split('T')[0]
    
    // Finanzas Veterinario
    await prisma.transaction.createMany({
        data: [
            { profileId: vetUser.id, type: 'income', amount: 80, category: 'consultation', description: 'Consulta Médica Firulais', date: todayStr },
            { profileId: vetUser.id, type: 'income', amount: 150, category: 'consultation', description: 'Consulta Especializada Hospital', date: todayStr },
            { profileId: vetUser.id, type: 'expense', amount: 500, category: 'supplies', description: 'Fármacos y vacunas antirrábicas', date: todayStr },
            { profileId: vetUser.id, type: 'expense', amount: 1200, category: 'rent', description: 'Pago de alquiler clínica', date: todayStr },
        ]
    })

    // Finanzas Proveedor
    await prisma.transaction.createMany({
        data: [
            { profileId: providerUser.id, type: 'income', amount: 70, category: 'grooming', description: 'Grooming Completo Firulais', date: todayStr },
            { profileId: providerUser.id, type: 'income', amount: 45, category: 'grooming', description: 'Baño Medicado Caniche', date: todayStr },
            { profileId: providerUser.id, type: 'expense', amount: 120, category: 'supplies', description: 'Shampoo antiparasitario y toallas', date: todayStr },
        ]
    })

    console.log('   ✅ Historial de transacciones financieras registrado')

    console.log('')
    console.log('=======================================')
    console.log('🎉 ¡Base de datos reiniciada con éxito!')
    console.log('=======================================')
    console.log('')
    console.log('Cuentas disponibles (contraseña: 123456):')
    console.log('  👑 Admin:      admin@brofy.pe')
    console.log('  🩺 Vet:        vet@brofy.pe')
    console.log('  🏪 Servicios:  servicios@brofy.pe')
    console.log('  🐾 Cliente:    cliente@brofy.pe')
    console.log('')
}

main()
    .catch((e) => {
        console.error('❌ Error al reiniciar base de datos:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })